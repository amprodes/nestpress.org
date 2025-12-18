import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HooksService } from '../hooks/hooks.service';
import { ContentHook } from '../hooks/interfaces';
import slugify from 'slugify';

const COLLECTION = 'pages';

export enum PageStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PageStatus;
  type: 'page'; // Distinguish from posts
  template?: string;
  parent?: string;
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly hooksService: HooksService,
  ) {}

  async create(data: Partial<Page>): Promise<Page> {
    await this.hooksService.doAction(ContentHook.PAGE_BEFORE_CREATE, data);

    // Apply content filter
    let content = data.content || '';
    if (content) {
      const contentResult = await this.hooksService.applyFilters(
        ContentHook.PAGE_CONTENT_FILTER,
        content,
      );
      content = contentResult.finalValue;
    }

    const slug = slugify(data.title || '', { lower: true, strict: true });
    const page = await this.database.create<Page>(COLLECTION, {
      ...data,
      content,
      slug,
      type: 'page', // Always set type to 'page'
      status: data.status || PageStatus.DRAFT,
      order: data.order || 0,
    });

    await this.hooksService.doAction(ContentHook.PAGE_AFTER_CREATE, page);
    return page;
  }

  async findAll(page = 1, limit = 10): Promise<{ data: Page[]; total: number }> {
    return this.database.findAll<Page>(COLLECTION, { page, limit, sortBy: 'order', sortOrder: 'asc' });
  }

  async findPublished(): Promise<{ data: Page[]; total: number }> {
    return this.database.findAll<Page>(COLLECTION, {
      filters: { status: PageStatus.PUBLISHED },
      sortBy: 'order',
      sortOrder: 'asc',
    });
  }

  async findById(id: string): Promise<Page | null> {
    return this.database.findById<Page>(COLLECTION, id);
  }

  async findBySlug(slug: string): Promise<Page | null> {
    return this.database.findByField<Page>(COLLECTION, 'slug', slug);
  }

  async findBySlugForDisplay(slug: string): Promise<Page | null> {
    const page = await this.findBySlug(slug);
    if (!page) return null;
    return this.applyDisplayFilters(page);
  }

  async findPublishedForDisplay(): Promise<{ data: Page[]; total: number }> {
    const result = await this.findPublished();
    const filteredPages = await Promise.all(
      result.data.map(page => this.applyDisplayFilters(page))
    );
    return { data: filteredPages, total: result.total };
  }

  private async applyDisplayFilters(page: Page): Promise<Page> {
    if (page.content) {
      const contentResult = await this.hooksService.applyFilters(
        ContentHook.PAGE_CONTENT_FILTER,
        page.content,
        { pageId: page.id }
      );
      page.content = contentResult.finalValue;
    }
    return page;
  }

  async update(id: string, data: Partial<Page>): Promise<Page> {
    const page = await this.findById(id);
    if (!page) throw new NotFoundException(`Page ${id} not found`);

    await this.hooksService.doAction(ContentHook.PAGE_BEFORE_UPDATE, { page, updates: data });

    const updateData: any = { ...data };
    if (data.content) {
      const contentResult = await this.hooksService.applyFilters(
        ContentHook.PAGE_CONTENT_FILTER,
        data.content,
      );
      updateData.content = contentResult.finalValue;
    }
    if (data.title && data.title !== page.title) {
      updateData.slug = slugify(data.title, { lower: true, strict: true });
    }

    const updated = await this.database.update<Page>(COLLECTION, id, updateData);
    await this.hooksService.doAction(ContentHook.PAGE_AFTER_UPDATE, updated);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const page = await this.findById(id);
    if (!page) throw new NotFoundException(`Page ${id} not found`);
    return this.database.delete(COLLECTION, id);
  }
}
