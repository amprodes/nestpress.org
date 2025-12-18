import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const COLLECTION = 'menus';

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  target?: '_blank' | '_self';
  cssClass?: string;
  parentId?: string;
  order: number;
  icon?: string;
}

export interface Menu {
  id: string;
  name: string;
  slug: string;
  location: 'primary' | 'footer' | 'mobile' | 'custom';
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class MenusService {
  private readonly logger = new Logger(MenusService.name);

  constructor(private readonly database: DatabaseService) {}

  async create(data: Partial<Menu>): Promise<Menu> {
    const menu = await this.database.create<Menu>(COLLECTION, {
      ...data,
      items: data.items || [],
    });
    this.logger.log(`Menu created: ${menu.name}`);
    return menu;
  }

  async findAll(): Promise<Menu[]> {
    const result = await this.database.findAll<Menu>(COLLECTION, { limit: 100 });
    return result.data;
  }

  async findById(id: string): Promise<Menu | null> {
    return this.database.findById<Menu>(COLLECTION, id);
  }

  async findByLocation(location: string): Promise<Menu | null> {
    return this.database.findByField<Menu>(COLLECTION, 'location', location);
  }

  async update(id: string, data: Partial<Menu>): Promise<Menu> {
    const menu = await this.findById(id);
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    await this.database.update<Menu>(COLLECTION, id, data);
    const updated = await this.findById(id);
    
    this.logger.log(`Menu updated: ${updated?.name}`);
    return updated!;
  }

  async delete(id: string): Promise<boolean> {
    const success = await this.database.delete(COLLECTION, id);
    if (success) {
      this.logger.log(`Menu deleted: ${id}`);
    }
    return success;
  }

  /**
   * Add item to menu
   */
  async addItem(menuId: string, item: Omit<MenuItem, 'id'>): Promise<Menu> {
    const menu = await this.findById(menuId);
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    const newItem: MenuItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    menu.items.push(newItem);
    return this.update(menuId, { items: menu.items });
  }

  /**
   * Update menu item
   */
  async updateItem(menuId: string, itemId: string, data: Partial<MenuItem>): Promise<Menu> {
    const menu = await this.findById(menuId);
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    const itemIndex = menu.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new NotFoundException(`Menu item with ID ${itemId} not found`);
    }

    menu.items[itemIndex] = { ...menu.items[itemIndex], ...data };
    return this.update(menuId, { items: menu.items });
  }

  /**
   * Delete menu item
   */
  async deleteItem(menuId: string, itemId: string): Promise<Menu> {
    const menu = await this.findById(menuId);
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    menu.items = menu.items.filter(item => item.id !== itemId);
    return this.update(menuId, { items: menu.items });
  }

  /**
   * Reorder menu items
   */
  async reorderItems(menuId: string, itemIds: string[]): Promise<Menu> {
    const menu = await this.findById(menuId);
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    const reordered: MenuItem[] = [];
    itemIds.forEach((id, index) => {
      const item = menu.items.find(i => i.id === id);
      if (item) {
        reordered.push({ ...item, order: index });
      }
    });

    return this.update(menuId, { items: reordered });
  }
}
