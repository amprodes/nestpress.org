import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { OrderStatus, PaymentStatus } from './entities/order.entity';
import { CurrentUser, Roles, Role } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto';
import { Order } from './entities/order.entity';

@ApiTags('Orders')
@Controller('orders')
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get all orders (Admin/Editor)' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: OrderStatus,
  ) {
    const { page, limit } = paginationDto;
    const result = await this.ordersService.findAll(page, limit, status);
    return new PaginatedResponseDto<Order>(result.data, result.total, page!, limit!);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, description: 'List of user orders' })
  async findMyOrders(
    @CurrentUser('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;
    const result = await this.ordersService.findByCustomer(userId, page, limit);
    return new PaginatedResponseDto<Order>(result.data, result.total, page!, limit!);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Get order statistics (Admin/Editor)' })
  @ApiResponse({ status: 200, description: 'Order statistics' })
  async getStats() {
    return this.ordersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order found' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiOperation({ summary: 'Update order status (Admin/Editor)' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateDto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  async cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Refund order (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order refunded' })
  async refund(@Param('id') id: string) {
    return this.ordersService.refund(id);
  }
}
