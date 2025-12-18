import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export class OrderItem {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ required: false })
  variantId?: string;

  @ApiProperty({ required: false })
  variantName?: string;
}

export class OrderAddress {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  address1: string;

  @ApiProperty({ required: false })
  address2?: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  country: string;

  @ApiProperty({ required: false })
  phone?: string;
}

export class Order {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'ORD-001' })
  orderNumber: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  customerEmail: string;

  @ApiProperty({ type: [OrderItem] })
  items: OrderItem[];

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  shipping: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ required: false })
  paymentMethod?: string;

  @ApiProperty({ required: false })
  paymentId?: string;

  @ApiProperty({ type: OrderAddress })
  shippingAddress: OrderAddress;

  @ApiProperty({ type: OrderAddress, required: false })
  billingAddress?: OrderAddress;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  trackingNumber?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
