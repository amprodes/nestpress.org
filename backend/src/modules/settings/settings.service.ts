import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const COLLECTION = 'settings';

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

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const existing = await this.database.findById<SiteSettings>(COLLECTION, 'site-settings');
    
    if (!existing) {
      // Create with defaults merged and fixed ID
      return this.database.create<SiteSettings>(COLLECTION, {
        id: 'site-settings',
        ...DEFAULT_SETTINGS,
        ...data,
      });
    }

    return this.database.update<SiteSettings>(COLLECTION, 'site-settings', data);
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
