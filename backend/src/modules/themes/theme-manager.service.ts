import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import AdmZip from 'adm-zip';

export interface ThemeMetadata {
  name: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  thumbnail: string;
  features: string[];
  templates: string[];
  settings: any;
  requires: any;
}

@Injectable()
export class ThemeManagerService {
  private readonly logger = new Logger(ThemeManagerService.name);
  private readonly themesPath: string;

  constructor(private readonly configService: ConfigService) {
    // Themes stored in project root /themes folder
    this.themesPath = path.resolve(process.cwd(), '..', 'themes');
    this.ensureThemesDirectory();
  }

  private async ensureThemesDirectory() {
    try {
      await fs.access(this.themesPath);
    } catch {
      await fs.mkdir(this.themesPath, { recursive: true });
      this.logger.log(`Created themes directory: ${this.themesPath}`);
    }
  }

  /**
   * Discover all installed themes
   */
  async discoverThemes(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.themesPath, { withFileTypes: true });
      const themes = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);

      this.logger.log(`Discovered ${themes.length} themes: ${themes.join(', ')}`);
      return themes;
    } catch (error) {
      this.logger.error('Failed to discover themes:', error);
      return [];
    }
  }

  /**
   * Get theme metadata
   */
  async getThemeMetadata(slug: string): Promise<ThemeMetadata> {
    const themeJsonPath = path.join(this.themesPath, slug, 'theme.json');
    
    try {
      const content = await fs.readFile(themeJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new NotFoundException(`Theme "${slug}" not found or invalid`);
    }
  }

  /**
   * Install theme from ZIP file
   */
  async installThemeFromZip(buffer: Buffer, filename: string): Promise<{ message: string; slug: string }> {
    try {
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();

      // Find theme.json to get slug
      const themeJsonEntry = zipEntries.find((entry: any) => entry.entryName.endsWith('theme.json'));
      if (!themeJsonEntry) {
        throw new BadRequestException('Invalid theme: theme.json not found');
      }

      // Parse theme metadata
      const metadata: ThemeMetadata = JSON.parse(themeJsonEntry.getData().toString('utf-8'));
      const { slug } = metadata;

      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        throw new BadRequestException('Invalid theme slug');
      }

      // Theme installation path
      const installPath = path.join(this.themesPath, slug);

      // Check if theme already exists
      try {
        await fs.access(installPath);
        throw new BadRequestException(`Theme "${slug}" already exists. Delete it first.`);
      } catch (err) {
        // Good - doesn't exist
      }

      // Extract ZIP to theme folder
      await fs.mkdir(installPath, { recursive: true });
      
      // Detect if ZIP has a root folder (all entries start with same path)
      const firstEntry = zipEntries[0] as any;
      const firstPath = firstEntry.entryName.split('/')[0];
      const hasRootFolder = zipEntries.every((entry: any) => 
        entry.entryName.startsWith(firstPath + '/')
      );
      
      for (const entry of zipEntries) {
        const zipEntry = entry as any;
        let entryName = zipEntry.entryName;
        
        // Strip root folder if present
        if (hasRootFolder && entryName.startsWith(firstPath + '/')) {
          entryName = entryName.substring(firstPath.length + 1);
        }
        
        if (!entryName) continue; // Skip root folder itself
        
        if (zipEntry.isDirectory) {
          await fs.mkdir(path.join(installPath, entryName), { recursive: true });
        } else {
          const filePath = path.join(installPath, entryName);
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, zipEntry.getData());
        }
      }

      this.logger.log(`✅ Theme installed: ${metadata.name} (${slug}) v${metadata.version}`);

      // Update themes index
      await this.updateThemesIndex();

      return {
        message: `Theme "${metadata.name}" installed successfully`,
        slug
      };
    } catch (error) {
      this.logger.error('Theme installation failed:', error);
      throw error;
    }
  }

  /**
   * Delete theme
   */
  async deleteTheme(slug: string): Promise<{ message: string }> {
    if (slug === 'default') {
      throw new BadRequestException('Cannot delete default theme');
    }

    const themePath = path.join(this.themesPath, slug);

    try {
      await fs.access(themePath);
      await fs.rm(themePath, { recursive: true, force: true });
      
      this.logger.log(`🗑️ Theme deleted: ${slug}`);

      // Update themes index
      await this.updateThemesIndex();

      return { message: `Theme "${slug}" deleted successfully` };
    } catch (error) {
      throw new NotFoundException(`Theme "${slug}" not found`);
    }
  }

  /**
   * Activate theme (store in settings)
   */
  async activateTheme(slug: string): Promise<{ message: string }> {
    // Verify theme exists
    await this.getThemeMetadata(slug);

    // In a real app, this would update the settings in the database
    // For now, we'll just validate the theme exists
    
    this.logger.log(`✅ Theme activated: ${slug}`);
    return { message: `Theme "${slug}" activated successfully` };
  }

  /**
   * Update themes/index.json with list of available themes
   */
  private async updateThemesIndex() {
    const themes = await this.discoverThemes();
    const indexPath = path.join(this.themesPath, 'index.json');
    await fs.writeFile(indexPath, JSON.stringify(themes, null, 2));
  }
}
