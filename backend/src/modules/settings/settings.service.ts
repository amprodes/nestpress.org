import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { IsString, IsEnum, IsInt, IsBoolean, IsOptional, Min, Max, ValidateIf } from 'class-validator';

const COLLECTION = 'settings';

/**
 * WordPress-style Reading Settings DTO
 * Follows WordPress data validation and sanitization principles:
 * - Sanitize on input (validate types, ranges, formats)
 * - Escape on output (handled by API layer)
 * - Capability checks (handled by controller guards)
 */
export class ReadingSettingsDto {
  @IsEnum(['posts', 'page'])
  @IsOptional()
  homepageType?: 'posts' | 'page';

  @IsString()
  @IsOptional()
  @ValidateIf(o => o.homepageType === 'page')
  homepageId?: string;

  @IsString()
  @IsOptional()
  @ValidateIf(o => o.homepageType === 'page')
  postsPageId?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  postsPerPage?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  feedItemsCount?: number;

  @IsBoolean()
  @IsOptional()
  feedShowSummary?: boolean;

  @IsBoolean()
  @IsOptional()
  discourageCrawlers?: boolean;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  
  // Social Links
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  
  // Footer
  footerText?: string;
  showPoweredBy?: boolean;
  
  // Contact
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  
  // Analytics
  googleAnalyticsId?: string;
  
  // Reading Settings (WordPress-compliant)
  homepageType?: 'posts' | 'page';
  homepageId?: string;
  postsPageId?: string;
  postsPerPage?: number;
  feedItemsCount?: number;
  feedShowSummary?: boolean;
  discourageCrawlers?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_SETTINGS: Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  siteName: 'NestPress CMS',
  siteDescription: 'A powerful headless CMS built with NestJS',
  siteUrl: 'http://localhost:3000',
  metaTitle: 'NestPress CMS',
  metaDescription: 'A powerful headless CMS combining WordPress-like content management with e-commerce capabilities',
  keywords: ['cms', 'headless', 'nestjs', 'ecommerce'],
  showPoweredBy: true,
  footerText: '© 2024 NestPress CMS. All rights reserved.',
  socialLinks: {},
  
  // Reading Settings defaults (WordPress standard)
  homepageType: 'posts',
  postsPerPage: 10,
  feedItemsCount: 10,
  feedShowSummary: false,
  discourageCrawlers: false,
};

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly database: DatabaseService) {}

  async getSettings(): Promise<SiteSettings> {
    let settings = await this.database.findById<SiteSettings>(COLLECTION, 'site-settings');
    
    if (!settings) {
      // Check if any settings exist (legacy documents without fixed ID)
      const allSettings = await this.database.findAll<SiteSettings>(COLLECTION, { page: 1, limit: 1 });
      
      if (allSettings.data.length > 0) {
        // Found legacy settings - migrate to fixed ID
        const legacySettings = allSettings.data[0];
        this.logger.log(`Migrating legacy settings from ID: ${legacySettings.id} to 'site-settings'`);
        
        // Delete old document
        await this.database.delete(COLLECTION, legacySettings.id);
        
        // Create with fixed ID
        settings = await this.database.create<SiteSettings>(COLLECTION, {
          ...legacySettings,
          id: 'site-settings',
        });
      } else {
        // No settings exist - create defaults
        settings = await this.database.create<SiteSettings>(COLLECTION, {
          id: 'site-settings',
          ...DEFAULT_SETTINGS,
        });
      }
    }

    return settings;
  }

  /**
   * WordPress-style sanitization for reading settings
   * Follows WordPress sanitize_option() pattern
   * @param data Raw input data
   * @returns Sanitized and validated settings
   */
  private sanitizeReadingSettings(data: Partial<SiteSettings>): Partial<SiteSettings> {
    const sanitized: Partial<SiteSettings> = {};

    // Sanitize homepage type (radio selection)
    if (data.homepageType !== undefined) {
      sanitized.homepageType = ['posts', 'page'].includes(data.homepageType) 
        ? data.homepageType 
        : 'posts';
    }

    // Sanitize homepage ID (text field -> sanitize_text_field equivalent)
    if (data.homepageId !== undefined) {
      sanitized.homepageId = typeof data.homepageId === 'string' 
        ? data.homepageId.trim() 
        : undefined;
    }

    // Sanitize posts page ID
    if (data.postsPageId !== undefined) {
      sanitized.postsPageId = typeof data.postsPageId === 'string' 
        ? data.postsPageId.trim() 
        : undefined;
    }

    // Sanitize posts per page (absint equivalent - absolute integer)
    if (data.postsPerPage !== undefined) {
      const value = parseInt(String(data.postsPerPage), 10);
      sanitized.postsPerPage = !isNaN(value) && value > 0 && value <= 100 ? value : 10;
    }

    // Sanitize feed items count (absint with max limit)
    if (data.feedItemsCount !== undefined) {
      const value = parseInt(String(data.feedItemsCount), 10);
      sanitized.feedItemsCount = !isNaN(value) && value > 0 && value <= 50 ? value : 10;
    }

    // Sanitize boolean checkboxes (WordPress checkbox handling)
    if (data.feedShowSummary !== undefined) {
      sanitized.feedShowSummary = Boolean(data.feedShowSummary);
    }

    if (data.discourageCrawlers !== undefined) {
      sanitized.discourageCrawlers = Boolean(data.discourageCrawlers);
    }

    return sanitized;
  }

  /**
   * Validate reading settings relationships (WordPress-style cross-field validation)
   * Ensures homepage and posts page aren't the same, both exist, etc.
   */
  private async validateReadingSettings(data: Partial<SiteSettings>): Promise<void> {
    if (data.homepageType === 'page') {
      // Ensure homepage is selected when using static page
      if (!data.homepageId) {
        throw new BadRequestException('Homepage must be selected when using a static front page');
      }

      // Ensure homepage and posts page aren't the same (WordPress validation)
      if (data.homepageId && data.postsPageId && data.homepageId === data.postsPageId) {
        throw new BadRequestException('Homepage and posts page cannot be the same page');
      }

      // Optional: Verify the pages exist (WordPress checks this)
      // This would require injecting PagesService or accessing pages collection
      // For now, we'll trust the frontend only sends valid page IDs
    }
  }

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    // WordPress-style sanitization on input
    const sanitizedData = {
      ...data,
      ...this.sanitizeReadingSettings(data),
    };

    // WordPress-style validation (cross-field checks)
    await this.validateReadingSettings(sanitizedData);

    const existing = await this.database.findById<SiteSettings>(COLLECTION, 'site-settings');
    
    if (!existing) {
      // Create with defaults merged and fixed ID
      return this.database.create<SiteSettings>(COLLECTION, {
        id: 'site-settings',
        ...DEFAULT_SETTINGS,
        ...sanitizedData,
      });
    }

    // Use sanitized data in update
    const updated = await this.database.update<SiteSettings>(COLLECTION, 'site-settings', {
      ...existing,
      ...sanitizedData,
      updatedAt: new Date().toISOString(),
    });

    // WordPress-style action hook equivalent (for plugin integration)
    this.logger.log(`Settings updated: ${Object.keys(sanitizedData).join(', ')}`);
    
    return updated;
  }

  async getSocialLinks(): Promise<SiteSettings['socialLinks']> {
    const settings = await this.getSettings();
    return settings.socialLinks || {};
  }

  async updateSocialLinks(links: SiteSettings['socialLinks']): Promise<SiteSettings> {
    return this.updateSettings({ socialLinks: links });
  }

  async getSEOSettings(): Promise<Pick<SiteSettings, 'metaTitle' | 'metaDescription' | 'keywords' | 'ogImage'>> {
    const settings = await this.getSettings();
    return {
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      keywords: settings.keywords,
      ogImage: settings.ogImage,
    };
  }
}
