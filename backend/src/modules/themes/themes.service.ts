import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as fs from 'fs';
import * as path from 'path';

const SETTINGS_COLLECTION = 'settings';

// Theme metadata from theme.json
export interface ThemeMetadata {
  name: string;
  slug: string;
  version: string;
  author: string;
  description: string;
  thumbnail: string;
  features: string[];
  templates: string[];
  settings?: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    layout?: Record<string, string>;
  };
  requires?: {
    nestpress?: string;
    react?: string;
  };
}

// Full theme info returned by API
export interface InstalledTheme {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  thumbnail: string;
  templates: {
    name: string;
    file: string;
    type: string;
    description: string;
  }[];
  features: string[];
  isActive: boolean;
  path: string;
}

@Injectable()
export class ThemesService implements OnModuleInit {
  private readonly logger = new Logger(ThemesService.name);
  private themesPath: string;
  private installedThemes: InstalledTheme[] = [];
  private activeThemeId: string = 'default';

  constructor(private readonly database: DatabaseService) {
    // Themes folder is at project root /themes
    this.themesPath = path.resolve(process.cwd(), '..', 'themes');
  }

  async onModuleInit() {
    await this.scanThemesFolder();
    await this.loadActiveThemeFromDb();
  }

  /**
   * Scan the /themes folder and discover all installed themes
   */
  private async scanThemesFolder(): Promise<void> {
    this.logger.log(`Scanning themes folder: ${this.themesPath}`);
    
    if (!fs.existsSync(this.themesPath)) {
      this.logger.warn(`Themes folder not found at ${this.themesPath}`);
      this.installedThemes = [];
      return;
    }

    const themeFolders = fs.readdirSync(this.themesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    this.logger.log(`Found theme folders: ${themeFolders.join(', ')}`);

    this.installedThemes = [];

    for (const folder of themeFolders) {
      const themePath = path.join(this.themesPath, folder);
      const themeJsonPath = path.join(themePath, 'theme.json');

      if (fs.existsSync(themeJsonPath)) {
        try {
          const themeJson = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8')) as ThemeMetadata;
          
          // Discover templates in templates/ subfolder
          const templates = this.discoverTemplates(themePath, themeJson.templates || []);

          const theme: InstalledTheme = {
            id: folder, // folder name = theme ID
            name: themeJson.name || folder,
            version: themeJson.version || '1.0.0',
            author: themeJson.author || 'Unknown',
            description: themeJson.description || '',
            thumbnail: themeJson.thumbnail || `/themes/${folder}/screenshot.svg`,
            templates,
            features: themeJson.features || [],
            isActive: folder === this.activeThemeId,
            path: themePath,
          };

          this.installedThemes.push(theme);
          this.logger.log(`Loaded theme: ${theme.name} (${theme.id}) with ${templates.length} templates`);
        } catch (error) {
          this.logger.error(`Failed to load theme from ${folder}: ${error.message}`);
        }
      } else {
        this.logger.warn(`No theme.json found in ${folder}`);
      }
    }

    this.logger.log(`Total themes loaded: ${this.installedThemes.length}`);
  }

  /**
   * Discover template files in a theme's templates/ folder
   */
  private discoverTemplates(themePath: string, declaredTemplates: string[]): InstalledTheme['templates'] {
    const templatesPath = path.join(themePath, 'templates');
    const templates: InstalledTheme['templates'] = [];

    const templateDescriptions: Record<string, string> = {
      'index': 'Homepage / Front Page template',
      'single': 'Single post template',
      'page': 'Static page template',
      'archive': 'Blog archive / listing',
      'category': 'Category archive template',
      'search': 'Search results template',
      '404': 'Not found error page',
      'front-page': 'Custom front page template',
    };

    if (fs.existsSync(templatesPath)) {
      const files = fs.readdirSync(templatesPath)
        .filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'));

      for (const file of files) {
        const name = file.replace(/\.(tsx|jsx)$/, '');
        templates.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          file,
          type: name,
          description: templateDescriptions[name] || `${name} template`,
        });
      }
    }

    // Also check for index.tsx in theme root (main entry point)
    const indexPath = path.join(themePath, 'index.tsx');
    if (fs.existsSync(indexPath) && !templates.find(t => t.file === 'index.tsx')) {
      // Index.tsx is the main entry that exports all templates
      this.logger.debug(`Found index.tsx entry point for theme at ${themePath}`);
    }

    return templates;
  }

  /**
   * Load active theme ID from database
   */
  private async loadActiveThemeFromDb(): Promise<void> {
    try {
      const settings = await this.database.findById<{ activeThemeId: string }>(
        SETTINGS_COLLECTION,
        'theme-settings',
      );
      
      if (settings?.activeThemeId) {
        this.activeThemeId = settings.activeThemeId;
        // Update isActive flag
        this.installedThemes.forEach(t => {
          t.isActive = t.id === this.activeThemeId;
        });
        this.logger.log(`Active theme from DB: ${this.activeThemeId}`);
      }
    } catch (error) {
      this.logger.debug('No theme settings found, using default');
    }
  }

  /**
   * Get all installed themes from /themes folder
   */
  async findAll(): Promise<InstalledTheme[]> {
    return this.installedThemes;
  }

  /**
   * Get a specific theme by ID (folder name)
   */
  async findById(id: string): Promise<InstalledTheme | null> {
    return this.installedThemes.find(t => t.id === id) || null;
  }

  /**
   * Set active theme and persist to database
   */
  async setActive(themeId: string): Promise<InstalledTheme> {
    const theme = this.installedThemes.find(t => t.id === themeId);
    if (!theme) {
      throw new NotFoundException(`Theme not found: ${themeId}`);
    }

    // Update active theme ID
    this.activeThemeId = themeId;

    // Update all themes' isActive flag
    this.installedThemes.forEach(t => {
      t.isActive = t.id === themeId;
    });

    // Persist to database
    try {
      await this.database.update(
        SETTINGS_COLLECTION,
        'theme-settings',
        { activeThemeId: themeId, updatedAt: new Date().toISOString() },
      );
      this.logger.log(`Active theme set to: ${themeId}`);
    } catch (error) {
      // If doesn't exist, create it
      await this.database.create(SETTINGS_COLLECTION, {
        id: 'theme-settings',
        activeThemeId: themeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.logger.log(`Created theme settings with active theme: ${themeId}`);
    }

    return theme;
  }

  /**
   * Get currently active theme
   */
  async getActive(): Promise<InstalledTheme | null> {
    return this.installedThemes.find(t => t.isActive) || this.installedThemes[0] || null;
  }

  /**
   * Get the currently active theme
   */
  async getActiveTheme(): Promise<InstalledTheme | null> {
    return this.installedThemes.find(t => t.isActive) || this.installedThemes[0] || null;
  }

  /**
   * Set a theme as active
   */
  async setActiveTheme(themeId: string): Promise<InstalledTheme> {
    const theme = await this.findById(themeId);
    if (!theme) {
      throw new NotFoundException(`Theme ${themeId} not found in /themes folder`);
    }

    // Update database
    try {
      await this.database.update(SETTINGS_COLLECTION, 'theme-settings', {
        activeThemeId: themeId,
      });
    } catch {
      // Create settings if doesn't exist
      await this.database.create(SETTINGS_COLLECTION, {
        id: 'theme-settings',
        activeThemeId: themeId,
      });
    }

    // Update in-memory state
    this.activeThemeId = themeId;
    this.installedThemes.forEach(t => {
      t.isActive = t.id === themeId;
    });

    this.logger.log(`Active theme set to: ${themeId}`);
    return theme;
  }

  /**
   * Rescan themes folder (useful after uploading a new theme)
   */
  async rescan(): Promise<InstalledTheme[]> {
    await this.scanThemesFolder();
    await this.loadActiveThemeFromDb();
    return this.installedThemes;
  }

  /**
   * Delete a theme (remove from /themes folder)
   */
  async remove(id: string): Promise<boolean> {
    if (id === 'default') {
      throw new Error('Cannot delete the default theme');
    }

    const theme = await this.findById(id);
    if (!theme) {
      throw new NotFoundException(`Theme ${id} not found`);
    }

    // Remove theme folder
    const themePath = path.join(this.themesPath, id);
    if (fs.existsSync(themePath)) {
      fs.rmSync(themePath, { recursive: true, force: true });
      this.logger.log(`Deleted theme folder: ${themePath}`);
    }

    // Rescan to update the list
    await this.rescan();
    
    return true;
  }
}
