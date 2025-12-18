import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';

const COLLECTION = 'orders';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private orderCounter = 1000; // For generating order numbers

  constructor(private readonly database: DatabaseService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Calculate totals
    const items = createOrderDto.items.map((item) => ({
      ...item,
      total: item.price * item.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const shipping = this.calculateShipping(subtotal);
    const tax = this.calculateTax(subtotal);
    const total = subtotal + shipping + tax;

    const orderNumber = this.generateOrderNumber();

    const order = await this.database.create<Order>(COLLECTION, {
      ...createOrderDto,
      items,
      orderNumber,
      subtotal,
      shipping,
      tax,
      total,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    this.logger.log(`Order created: ${orderNumber}`);
    return order;
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: OrderStatus,
    customerId?: string,
  ): Promise<{ data: Order[]; total: number }> {
    const filters: Record<string, any> = {};

    if (status) {
      filters.status = status;
    }
    if (customerId) {
      filters.customerId = customerId;
    }

    return this.database.findAll<Order>(COLLECTION, {
      page,
      limit,
      filters,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.database.findById<Order>(COLLECTION, id);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.database.findByField<Order>(COLLECTION, 'orderNumber', orderNumber);
  }

  async findByCustomer(customerId: string, page = 1, limit = 10): Promise<{ data: Order[]; total: number }> {
    return this.findAll(page, limit, undefined, customerId);
  }

  async updateStatus(id: string, updateDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updated = await this.database.update<Order>(COLLECTION, id, updateDto);
    this.logger.log(`Order ${id} status updated to ${updateDto.status}`);
    return updated;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, paymentId?: string): Promise<Order> {
    const order = await this.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updateData: any = { paymentStatus };
    if (paymentId) {
      updateData.paymentId = paymentId;
    }

    // If payment successful, move to processing
    if (paymentStatus === PaymentStatus.PAID && order.status === OrderStatus.PENDING) {
      updateData.status = OrderStatus.PROCESSING;
    }

    const updated = await this.database.update<Order>(COLLECTION, id, updateData);
    this.logger.log(`Order ${id} payment status updated to ${paymentStatus}`);
    return updated;
  }

  async cancel(id: string): Promise<Order> {
    return this.updateStatus(id, { status: OrderStatus.CANCELLED });
  }

  async refund(id: string): Promise<Order> {
    const order = await this.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updated = await this.database.update<Order>(COLLECTION, id, {
      status: OrderStatus.REFUNDED,
      paymentStatus: PaymentStatus.REFUNDED,
    });

    this.logger.log(`Order ${id} refunded`);
    return updated;
  }

  async getStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
  }> {
    const all = await this.database.findAll<Order>(COLLECTION, {});
    
    const stats = all.data.reduce(
      (acc, order) => {
        acc.totalOrders++;
        if (order.paymentStatus === PaymentStatus.PAID) {
          acc.totalRevenue += order.total;
        }
        if (order.status === OrderStatus.PENDING) {
          acc.pendingOrders++;
        }
        if (order.status === OrderStatus.PROCESSING) {
          acc.processingOrders++;
        }
        return acc;
      },
      { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, processingOrders: 0 },
    );

    return stats;
  }

  private generateOrderNumber(): string {
    this.orderCounter++;
    return `ORD-${this.orderCounter}`;
  }

  private calculateShipping(subtotal: number): number {
    // Free shipping over $100, otherwise $10 flat rate
    return subtotal >= 100 ? 0 : 10;
  }

  private calculateTax(subtotal: number): number {
    // Simple 10% tax calculation
    return Math.round(subtotal * 0.1 * 100) / 100;
  }
}
