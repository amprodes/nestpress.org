import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const COLLECTION = 'site_settings';
const HEADER_KEY = 'header_settings';

export interface HeaderSettings {
  logo?: string;
  logoText?: string;
  tagline?: string;
  showTagline: boolean;
  backgroundColor?: string;
  textColor?: string;
  height?: number;
  sticky: boolean;
  transparent: boolean;
  customCss?: string;
  customHtml?: string;
}

@Injectable()
export class HeaderService {
  private readonly logger = new Logger(HeaderService.name);

  constructor(private readonly database: DatabaseService) {}

  async getSettings(): Promise<HeaderSettings> {
    const result = await this.database.findByField<any>(
      COLLECTION,
      'key',
      HEADER_KEY
    );

    if (!result) {
      // Return defaults
      return {
        logoText: 'NestPress',
        tagline: 'A Modern CMS',
        showTagline: true,
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        height: 80,
        sticky: true,
        transparent: false,
      };
    }

    return result.value;
  }

  async updateSettings(settings: Partial<HeaderSettings>): Promise<HeaderSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };

    const existing = await this.database.findByField<any>(
      COLLECTION,
      'key',
      HEADER_KEY
    );

    if (existing) {
      await this.database.update(COLLECTION, existing.id, {
        value: updated,
      });
    } else {
      await this.database.create(COLLECTION, {
        key: HEADER_KEY,
        value: updated,
      });
    }

    this.logger.log('Header settings updated');
    return updated;
  }
}
