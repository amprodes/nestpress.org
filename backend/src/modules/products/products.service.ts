import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductStatus } from './entities/product.entity';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = 'products';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly database: DatabaseService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const slug = this.generateSlug(createProductDto.name);

    // Generate IDs for variants
    const variants = createProductDto.variants?.map((v) => ({
      ...v,
      id: uuidv4(),
    }));

    const product = await this.database.create<Product>(COLLECTION, {
      ...createProductDto,
      slug,
      variants,
      status: createProductDto.status || ProductStatus.DRAFT,
      trackInventory: createProductDto.trackInventory ?? true,
      requiresShipping: createProductDto.requiresShipping ?? true,
    });

    this.logger.log(`Product created: ${product.name}`);
    return product;
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: ProductStatus,
    category?: string,
  ): Promise<{ data: Product[]; total: number }> {
    const filters: Record<string, any> = {};

    if (status) {
      filters.status = status;
    }
    if (category) {
      filters.category = category;
    }

    return this.database.findAll<Product>(COLLECTION, {
      page,
      limit,
      filters,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  async findActive(
    page = 1,
    limit = 10,
    category?: string,
  ): Promise<{ data: Product[]; total: number }> {
    return this.findAll(page, limit, ProductStatus.ACTIVE, category);
  }

  async findById(id: string): Promise<Product | null> {
    return this.database.findById<Product>(COLLECTION, id);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.database.findByField<Product>(COLLECTION, 'slug', slug);
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.database.findByField<Product>(COLLECTION, 'sku', sku);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updateData: any = { ...updateProductDto };

    // Generate new slug if name changed
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      updateData.slug = this.generateSlug(updateProductDto.name);
    }

    // Handle variants update
    if (updateProductDto.variants) {
      updateData.variants = updateProductDto.variants.map((v: any) => ({
        ...v,
        id: v.id || uuidv4(),
      }));
    }

    const updated = await this.database.update<Product>(COLLECTION, id, updateData);
    this.logger.log(`Product updated: ${id}`);
    return updated;
  }

  async updateInventory(id: string, quantity: number): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.database.update<Product>(COLLECTION, id, {
      inventory: Math.max(0, quantity),
    });
  }

  async decrementInventory(id: string, amount = 1): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const newInventory = Math.max(0, (product.inventory || 0) - amount);
    return this.database.update<Product>(COLLECTION, id, {
      inventory: newInventory,
    });
  }

  async activate(id: string): Promise<Product> {
    return this.update(id, { status: ProductStatus.ACTIVE });
  }

  async archive(id: string): Promise<Product> {
    return this.update(id, { status: ProductStatus.ARCHIVED });
  }

  async remove(id: string): Promise<boolean> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.database.delete(COLLECTION, id);
    this.logger.log(`Product deleted: ${id}`);
    return true;
  }

  async search(query: string, page = 1, limit = 10): Promise<{ data: Product[]; total: number }> {
    // For a basic implementation, we filter in application
    // In production, use full-text search (Elasticsearch, Algolia, etc.)
    const all = await this.database.findAll<Product>(COLLECTION, {
      filters: { status: ProductStatus.ACTIVE },
    });

    const queryLower = query.toLowerCase();
    const filtered = all.data.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower) ||
        p.sku.toLowerCase().includes(queryLower) ||
        p.tags?.some((t) => t.toLowerCase().includes(queryLower)),
    );

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return { data, total: filtered.length };
  }

  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
}
