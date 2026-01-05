import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip = require('adm-zip');
import {
  ConversionResult,
  ConversionLogEntry,
  ParsedTheme,
  ParsedPart,
  ThemeAssets,
} from './interfaces/converter.interfaces';
import { BlockParserService } from './parsers/block-parser.service';
import { PatternParserService } from './parsers/pattern-parser.service';
import { PhpParserService } from './parsers/php-parser.service';
import { ThemeGeneratorService } from './generators/theme-generator.service';

/**
 * Theme Converter Service
 * Main orchestrator for WordPress to TSX conversion
 */
@Injectable()
export class ThemeConverterService {
  private readonly logger = new Logger(ThemeConverterService.name);
  private conversionLog: ConversionLogEntry[] = [];
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(
    private readonly blockParser: BlockParserService,
    private readonly patternParser: PatternParserService,
    private readonly phpParser: PhpParserService,
    private readonly themeGenerator: ThemeGeneratorService,
  ) {}

  /**
   * Convert WordPress theme ZIP to NestPress theme
   */
  async convertTheme(
    zipFilePath: string,
    options?: any,
  ): Promise<ConversionResult> {
    this.resetLogs();
    this.log('info', `Starting conversion of theme: ${zipFilePath}`);

    try {
      // Extract ZIP
      const extractDir = await this.extractZip(zipFilePath);
      this.log('info', `Extracted theme to: ${extractDir}`);

      // Find theme root (ZIP might have a root folder)
      const themeRoot = this.findThemeRoot(extractDir);
      this.log('info', `Theme root found: ${themeRoot}`);

      // Parse theme
      const parsed = await this.parseTheme(themeRoot);
      this.log('info', `Parsed theme: ${parsed.name}`);

      // Generate theme slug
      const themeId = parsed.slug || this.slugify(parsed.name);

      // Output directory
      const outputDir = path.join(
        process.cwd(),
        '..',
        'themes',
        themeId,
      );

      // Generate NestPress theme
      await this.themeGenerator.generateTheme(parsed, outputDir);
      this.log('info', `Theme generated at: ${outputDir}`);

      // Cleanup temp files
      this.cleanup(extractDir);

      return {
        success: true,
        themeId,
        themeName: parsed.name,
        outputPath: outputDir,
        conversionLog: this.conversionLog,
        warnings: this.warnings,
        errors: this.errors,
        stats: {
          totalPatterns: parsed.patterns.length,
          convertedPatterns: parsed.patterns.length,
          totalBlocks: this.countBlocks(parsed),
          convertedBlocks: this.countBlocks(parsed),
          totalParts: parsed.parts.length,
          convertedParts: parsed.parts.length,
          assetsProcessed: parsed.assets.css.length + parsed.assets.images.length,
        },
      };
    } catch (error) {
      this.log('error', `Conversion failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract ZIP file
   */
  private async extractZip(zipPath: string): Promise<string> {
    const zip = new AdmZip(zipPath);
    const extractDir = path.join(
      path.dirname(zipPath),
      'extracted-' + Date.now(),
    );
    
    zip.extractAllTo(extractDir, true);
    return extractDir;
  }

  /**
   * Find theme root directory
   */
  private findThemeRoot(extractDir: string): string {
    // Check if style.css exists in root
    if (fs.existsSync(path.join(extractDir, 'style.css'))) {
      return extractDir;
    }

    // Check subdirectories
    const files = fs.readdirSync(extractDir);
    for (const file of files) {
      const filePath = path.join(extractDir, file);
      if (fs.statSync(filePath).isDirectory()) {
        const stylePath = path.join(filePath, 'style.css');
        if (fs.existsSync(stylePath)) {
          return filePath;
        }
      }
    }

    throw new Error('Theme root not found. style.css missing.');
  }

  /**
   * Parse WordPress theme
   */
  private async parseTheme(themeRoot: string): Promise<ParsedTheme> {
    // Parse style.css header
    const styleCssPath = path.join(themeRoot, 'style.css');
    const metadata = this.phpParser.parseThemeHeader(styleCssPath);

    // Parse theme.json
    const themeJsonPath = path.join(themeRoot, 'theme.json');
    let themeJson = {};
    if (fs.existsSync(themeJsonPath)) {
      themeJson = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));
    }

    // Parse patterns
    const patternsDir = path.join(themeRoot, 'patterns');
    const patterns = this.patternParser.parsePatterns(patternsDir);

    // Parse template parts
    const partsDir = path.join(themeRoot, 'parts');
    const parts = this.parseParts(partsDir);

    // Parse templates
    const templatesDir = path.join(themeRoot, 'templates');
    const templates = this.parseTemplates(templatesDir);

    // Scan assets
    const assets = this.scanAssets(themeRoot);

    // Parse style variations (WordPress styles/ folder)
    const styleVariations = this.parseStyleVariations(themeRoot);

    return {
      name: metadata.name || 'Converted Theme',
      slug: this.slugify(metadata.name || 'converted-theme'),
      version: metadata.version || '1.0.0',
      author: metadata.author || 'Unknown',
      authorUri: metadata.authorUri,
      description: metadata.description || '',
      themeUri: metadata.themeUri,
      requiresPhp: metadata.requiresPhp,
      requiresWP: metadata.requiresWP,
      textDomain: metadata.textDomain,
      tags: metadata.tags || [],
      patterns,
      parts,
      templates,
      themeJson,
      assets,
      styleVariations,
    };
  }

  /**
   * Parse template parts
   */
  private parseParts(partsDir: string): ParsedPart[] {
    const parts: ParsedPart[] = [];

    if (!fs.existsSync(partsDir)) {
      return parts;
    }

    const files = fs.readdirSync(partsDir);
    for (const file of files) {
      if (file.endsWith('.html')) {
        const filePath = path.join(partsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const name = path.basename(file, '.html');

        parts.push({
          name,
          content,
          blocks: this.blockParser.parseBlocks(content, `part:${name}`),
        });
      }
    }

    this.log('info', `Parsed ${parts.length} template parts`);
    return parts;
  }

  /**
   * Parse templates
   */
  private parseTemplates(templatesDir: string): any[] {
    const templates: any[] = [];

    if (!fs.existsSync(templatesDir)) {
      return templates;
    }

    const files = fs.readdirSync(templatesDir);
    for (const file of files) {
      if (file.endsWith('.html')) {
        const filePath = path.join(templatesDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const name = path.basename(file, '.html');

        templates.push({
          name,
          content,
          blocks: this.blockParser.parseBlocks(content, `template:${name}`),
        });
      }
    }

    this.log('info', `Parsed ${templates.length} templates`);
    return templates;
  }

  /**
   * Scan theme assets
   */
  private scanAssets(themeRoot: string): ThemeAssets {
    const assets: ThemeAssets = {
      css: [],
      js: [],
      images: [],
      fonts: [],
    };

    // Include root style.css (WordPress standard main stylesheet)
    const rootStyleCss = path.join(themeRoot, 'style.css');
    if (fs.existsSync(rootStyleCss)) {
      assets.css.push(rootStyleCss);
      this.log('info', 'Found root style.css');
    }

    const assetsDir = path.join(themeRoot, 'assets');
    if (!fs.existsSync(assetsDir)) {
      return assets;
    }

    // Scan CSS in assets/css directory
    const cssDir = path.join(assetsDir, 'css');
    if (fs.existsSync(cssDir)) {
      assets.css.push(...this.scanFiles(cssDir, '.css'));
    }

    // Scan images
    const imagesDir = path.join(assetsDir, 'images');
    if (fs.existsSync(imagesDir)) {
      assets.images = this.scanFiles(imagesDir, ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);
    }

    // Scan fonts
    const fontsDir = path.join(assetsDir, 'fonts');
    if (fs.existsSync(fontsDir)) {
      assets.fonts = this.scanFiles(fontsDir, ['.woff', '.woff2', '.ttf', '.eot']);
    }

    this.log('info', `Found ${assets.css.length} CSS, ${assets.images.length} images, ${assets.fonts.length} fonts`);
    return assets;
  }

  /**
   * Scan files by extension
   */
  private scanFiles(dir: string, extensions: string | string[]): string[] {
    const exts = Array.isArray(extensions) ? extensions : [extensions];
    const files: string[] = [];

    const scan = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir);
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (exts.some(ext => entry.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    scan(dir);
    return files;
  }

  /**
   * Parse style variations from WordPress styles/ folder
   */
  private parseStyleVariations(themeRoot: string): any[] {
    const stylesDir = path.join(themeRoot, 'styles');
    const variations = [];

    if (!fs.existsSync(stylesDir)) {
      this.log('info', 'No styles folder found - this theme has no style variations');
      return variations;
    }

    try {
      const files = this.getJsonFilesRecursive(stylesDir);
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(stylesDir, file);
        
        try {
          const jsonContent = JSON.parse(content);
          variations.push({
            path: relativePath,
            content: jsonContent,
          });
        } catch (error) {
          this.log('warn', `Failed to parse style variation ${relativePath}: ${error.message}`);
        }
      }

      this.log('info', `Parsed ${variations.length} style variations from styles/ folder`);
    } catch (error) {
      this.log('error', `Failed to parse style variations: ${error.message}`);
    }

    return variations;
  }

  /**
   * Get all JSON files recursively from a directory
   */
  private getJsonFilesRecursive(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.getJsonFilesRecursive(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Count total blocks
   */
  private countBlocks(parsed: ParsedTheme): number {
    let count = 0;
    parsed.patterns.forEach(p => (count += p.blocks.length));
    parsed.parts.forEach(p => (count += p.blocks.length));
    return count;
  }

  /**
   * Slugify string
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Cleanup temp files
   */
  private cleanup(dir: string): void {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      this.log('info', `Cleaned up temp directory: ${dir}`);
    } catch (error) {
      this.log('warn', `Failed to cleanup: ${error.message}`);
    }
  }

  /**
   * Log message
   */
  private log(level: 'info' | 'warn' | 'error', message: string, context?: string): void {
    const entry: ConversionLogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
    };

    this.conversionLog.push(entry);

    if (level === 'warn') {
      this.warnings.push(message);
      this.logger.warn(message);
    } else if (level === 'error') {
      this.errors.push(message);
      this.logger.error(message);
    } else {
      this.logger.log(message);
    }
  }

  /**
   * Reset logs
   */
  private resetLogs(): void {
    this.conversionLog = [];
    this.warnings = [];
    this.errors = [];
  }
}
