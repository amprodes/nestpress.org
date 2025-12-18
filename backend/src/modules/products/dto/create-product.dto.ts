import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsUrl,
  Min,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../entities/product.entity';

export class CreateVariantDto {
  @ApiProperty({ example: 'Small' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'SKU-001-S' })
  @IsString()
  @MinLength(1)
  sku: string;

  @ApiProperty({ example: 19.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  inventory: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  options?: Record<string, string>;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Premium T-Shirt' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'A high-quality cotton t-shirt...' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'SKU-001' })
  @IsString()
  @MinLength(1)
  sku: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 39.99, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiProperty({ example: 2.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerItem?: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  inventory: number;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUrl({}, { each: true })
  images: string[];

  @ApiProperty({ example: 'Apparel' })
  @IsString()
  category: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ type: [CreateVariantDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  metaTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaDescription?: string;

  @ApiProperty({ example: 0.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  requiresShipping?: boolean;
}
