import { ApiProperty } from '@nestjs/swagger';

export enum ProductStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export class ProductVariant {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Small' })
  name: string;

  @ApiProperty({ example: 'SKU-001-S' })
  sku: string;

  @ApiProperty({ example: 19.99 })
  price: number;

  @ApiProperty({ example: 24.99, required: false })
  compareAtPrice?: number;

  @ApiProperty({ example: 100 })
  inventory: number;

  @ApiProperty({ type: [String], required: false })
  images?: string[];

  @ApiProperty({ required: false })
  options?: Record<string, string>;
}

export class Product {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Premium T-Shirt' })
  name: string;

  @ApiProperty({ example: 'premium-t-shirt' })
  slug: string;

  @ApiProperty({ example: 'A high-quality cotton t-shirt...' })
  description: string;

  @ApiProperty({ example: 'SKU-001' })
  sku: string;

  @ApiProperty({ example: 29.99 })
  price: number;

  @ApiProperty({ example: 39.99, required: false })
  compareAtPrice?: number;

  @ApiProperty({ example: 2.5, required: false })
  costPerItem?: number;

  @ApiProperty({ example: 100 })
  inventory: number;

  @ApiProperty({ example: true })
  trackInventory: boolean;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ example: 'Apparel' })
  category: string;

  @ApiProperty({ type: [String], example: ['clothing', 'cotton'] })
  tags?: string[];

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  status: ProductStatus;

  @ApiProperty({ type: [ProductVariant], required: false })
  variants?: ProductVariant[];

  @ApiProperty({ description: 'SEO meta title' })
  metaTitle?: string;

  @ApiProperty({ description: 'SEO meta description' })
  metaDescription?: string;

  @ApiProperty({ example: 0.5, description: 'Weight in kg' })
  weight?: number;

  @ApiProperty({ example: true })
  requiresShipping: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
