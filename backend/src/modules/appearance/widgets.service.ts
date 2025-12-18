import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const COLLECTION = 'widgets';

export interface Widget {
  id: string;
  type: 'text' | 'html' | 'menu' | 'search' | 'categories' | 'recent-posts' | 'custom';
  title: string;
  content?: any;
  area: 'sidebar' | 'footer' | 'header' | 'custom';
  position: number;
  isActive: boolean;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class WidgetsService {
  private readonly logger = new Logger(WidgetsService.name);

  constructor(private readonly database: DatabaseService) {}

  async create(data: Partial<Widget>): Promise<Widget> {
    const widget = await this.database.create<Widget>(COLLECTION, {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      settings: data.settings || {},
    });
    this.logger.log(`Widget created: ${widget.title} (${widget.type})`);
    return widget;
  }

  async findAll(): Promise<Widget[]> {
    const result = await this.database.findAll<Widget>(COLLECTION, { 
      limit: 100,
      sortBy: 'position',
      sortOrder: 'asc'
    });
    return result.data;
  }

  async findByArea(area: string): Promise<Widget[]> {
    const all = await this.findAll();
    return all.filter(w => w.area === area && w.isActive);
  }

  async findById(id: string): Promise<Widget | null> {
    return this.database.findById<Widget>(COLLECTION, id);
  }

  async update(id: string, data: Partial<Widget>): Promise<Widget> {
    const widget = await this.findById(id);
    if (!widget) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }

    await this.database.update<Widget>(COLLECTION, id, data);
    const updated = await this.findById(id);
    
    this.logger.log(`Widget updated: ${updated?.title}`);
    return updated!;
  }

  async delete(id: string): Promise<boolean> {
    const success = await this.database.delete(COLLECTION, id);
    if (success) {
      this.logger.log(`Widget deleted: ${id}`);
    }
    return success;
  }

  /**
   * Reorder widgets in an area
   */
  async reorderWidgets(area: string, widgetIds: string[]): Promise<Widget[]> {
    const updates = widgetIds.map(async (id, index) => {
      await this.update(id, { position: index });
    });
    await Promise.all(updates);
    
    return this.findByArea(area);
  }
}
