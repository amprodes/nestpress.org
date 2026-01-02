/**
 * Phase 2: Resource Cloner Service
 * 
 * Downloads and optimizes website resources:
 * - Stylesheets with URL rewriting
 * - Images with Sharp optimization
 * - Fonts (local copies)
 * - Scripts (filtered for safety)
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { CSSConsolidator } from './CSSConsolidator';

export interface ClonedResources {
  stylesheets: Array<{ originalUrl: string; localPath: string; content: string }>;
  images: Array<{ originalUrl: string; localPath: string; size: number }>;
  fonts: Array<{ originalUrl: string; localPath: string }>;
  scripts: Array<{ originalUrl: string; localPath: string }>;
  htmlSnippets?: {
    header: string;
    footer: string;
    sidebar?: string;
    homepage: string;
    templates: Record<string, string>;
  };
}

export class ResourceCloner {
  private api: any;
  private tempDir: string;

  constructor(api: any, tempDir: string) {
    this.api = api;
    this.tempDir = tempDir;
  }

  async clone(resources: any, themeName: string, htmlSnippets?: any): Promise<ClonedResources> {
    this.api.log(`[ResourceCloner] Cloning resources for: ${themeName}`);
    this.api.log(`[ResourceCloner] htmlSnippets received: ${htmlSnippets ? 'YES' : 'NO'}`);
    if (htmlSnippets) {
      this.api.log(`[ResourceCloner] htmlSnippets keys: ${Object.keys(htmlSnippets).join(', ')}`);
    }

    const assetsDir = path.join(this.tempDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.mkdirSync(path.join(assetsDir, 'css'), { recursive: true });
    fs.mkdirSync(path.join(assetsDir, 'images'), { recursive: true });
    fs.mkdirSync(path.join(assetsDir, 'fonts'), { recursive: true });
    fs.mkdirSync(path.join(assetsDir, 'js'), { recursive: true });
    
    // Save original HTML snippets if provided
    if (htmlSnippets) {
      const originalHtmlDir = path.join(this.tempDir, 'original-html');
      fs.mkdirSync(originalHtmlDir, { recursive: true });
      
      this.api.log('[ResourceCloner] Saving original HTML snippets...');
      this.api.log(`[ResourceCloner] Homepage HTML length: ${htmlSnippets.homepage?.length || 0} chars`);
      
      // Save homepage HTML
      if (htmlSnippets.homepage) {
        fs.writeFileSync(path.join(originalHtmlDir, 'index.html'), htmlSnippets.homepage);
        this.api.log('  ✓ Saved homepage HTML');
      }
      
      // Save header HTML
      if (htmlSnippets.header) {
        fs.writeFileSync(path.join(originalHtmlDir, 'header.html'), htmlSnippets.header);
      }
      
      // Save footer HTML
      if (htmlSnippets.footer) {
        fs.writeFileSync(path.join(originalHtmlDir, 'footer.html'), htmlSnippets.footer);
      }
      
      // Save sidebar HTML if exists
      if (htmlSnippets.sidebar) {
        fs.writeFileSync(path.join(originalHtmlDir, 'sidebar.html'), htmlSnippets.sidebar);
      }
      
      // Save template-specific HTML
      if (htmlSnippets.templates) {
        Object.entries(htmlSnippets.templates).forEach(([name, html]) => {
          fs.writeFileSync(path.join(originalHtmlDir, `${name}.html`), html as string);
        });
      }
      
      this.api.log(`✓ Original HTML preserved in: ${originalHtmlDir}`);
    }

    this.api.sendProgress?.(31, `Downloading ${resources.stylesheets.length} stylesheets...`, { type: 'phase', phase: 2 });
    const stylesheets = await this.cloneStylesheets(resources.stylesheets, assetsDir);
    this.api.sendProgress?.(33, `${stylesheets.length} stylesheets downloaded`, { type: 'phase', phase: 2 });

    // Keep CSS as-is without consolidation (preserves original styling exactly)
    this.api.sendProgress?.(34, 'Organizing CSS files...', { type: 'phase', phase: 2 });
    this.api.log('✓ CSS files preserved as-is (no consolidation)');
    this.api.sendProgress?.(35, `${stylesheets.length} CSS files ready`, { type: 'phase', phase: 2 });

    this.api.sendProgress?.(36, `Optimizing ${resources.images.length} images...`, { type: 'phase', phase: 2 });
    const images = await this.cloneImages(resources.images, assetsDir);
    this.api.sendProgress?.(38, `${images.length} images optimized`, { type: 'phase', phase: 2 });

    this.api.sendProgress?.(39, `Downloading ${resources.fonts.length} fonts...`, { type: 'phase', phase: 2 });
    const fonts = await this.cloneFonts(resources.fonts, assetsDir);
    this.api.sendProgress?.(40, `${fonts.length} fonts downloaded`, { type: 'phase', phase: 2 });

    const scripts = await this.cloneScripts(resources.scripts, assetsDir);

    this.api.log(`✓ Resources cloned: ${stylesheets.length} CSS, ${images.length} images, ${fonts.length} fonts`);

    return { 
      stylesheets, 
      images, 
      fonts, 
      scripts,
      htmlSnippets 
    };
  }

  private async fetchWithHeaders(url: string): Promise<Response> {
    return fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      }
    });
  }

  private async cloneStylesheets(urls: string[], assetsDir: string): Promise<any[]> {
    const results: any[] = [];

    for (let i = 0; i < Math.min(urls.length, 10); i++) {
      const url = urls[i];
      try {
        const response = await this.fetchWithHeaders(url);
        if (!response.ok) continue;

        let content = await response.text();
        
        // Rewrite URLs in CSS
        content = this.rewriteCssUrls(content, url);
        
        // Resolve CSS custom properties (remove undefined var() references)
        content = this.resolveCSSCustomProperties(content);

        const filename = `style-${i + 1}.css`;
        const localPath = path.join(assetsDir, 'css', filename);
        fs.writeFileSync(localPath, content);

        results.push({
          originalUrl: url,
          localPath: `assets/css/${filename}`,
          content,
        });

        if (i % 3 === 0) {
          this.api.sendProgress?.(
            31 + Math.floor((i / Math.min(urls.length, 10)) * 2),
            `Processed ${i + 1}/${Math.min(urls.length, 10)} stylesheets`,
            { type: 'phase', phase: 2 }
          );
        }
      } catch (error: any) {
        this.api.log(`Failed to download CSS: ${url} - ${error.message}`);
      }
    }

    return results;
  }

  private async cloneImages(urls: string[], assetsDir: string): Promise<any[]> {
    const results: any[] = [];

    for (let i = 0; i < Math.min(urls.length, 20); i++) {
      const url = urls[i];
      try {
        const response = await this.fetchWithHeaders(url);
        if (!response.ok) continue;

        const buffer = Buffer.from(await response.arrayBuffer());
        
        // Optimize with Sharp
        const optimized = await sharp(buffer)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();

        const ext = path.extname(new URL(url).pathname) || '.jpg';
        const filename = `image-${i + 1}${ext}`;
        const localPath = path.join(assetsDir, 'images', filename);
        fs.writeFileSync(localPath, optimized);

        results.push({
          originalUrl: url,
          localPath: `assets/images/${filename}`,
          size: optimized.length,
        });

        if (i % 5 === 0) {
          this.api.sendProgress?.(
            35 + Math.floor((i / Math.min(urls.length, 20)) * 2),
            `Optimized ${i + 1}/${Math.min(urls.length, 20)} images`,
            { type: 'phase', phase: 2 }
          );
        }
      } catch (error: any) {
        this.api.log(`Failed to process image: ${url} - ${error.message}`);
      }
    }

    return results;
  }

  private async cloneFonts(urls: string[], assetsDir: string): Promise<any[]> {
    const results: any[] = [];

    for (let i = 0; i < Math.min(urls.length, 5); i++) {
      const url = urls[i];
      try {
        const response = await this.fetchWithHeaders(url);
        if (!response.ok) continue;

        const buffer = Buffer.from(await response.arrayBuffer());
        const ext = path.extname(new URL(url).pathname) || '.woff2';
        const filename = `font-${i + 1}${ext}`;
        const localPath = path.join(assetsDir, 'fonts', filename);
        fs.writeFileSync(localPath, buffer);

        results.push({
          originalUrl: url,
          localPath: `assets/fonts/${filename}`,
        });
      } catch (error: any) {
        this.api.log(`Failed to download font: ${url} - ${error.message}`);
      }
    }

    return results;
  }

  private async cloneScripts(urls: string[], assetsDir: string): Promise<any[]> {
    const results: any[] = [];

    // Filter safe scripts only (exclude analytics, ads, trackers)
    const safeUrls = urls.filter(url => {
      const lower = url.toLowerCase();
      return !lower.includes('google') && 
             !lower.includes('facebook') && 
             !lower.includes('analytics') &&
             !lower.includes('gtag') &&
             !lower.includes('gtm');
    });

    for (let i = 0; i < Math.min(safeUrls.length, 5); i++) {
      const url = safeUrls[i];
      try {
        const response = await this.fetchWithHeaders(url);
        if (!response.ok) continue;

        const content = await response.text();
        const filename = `script-${i + 1}.js`;
        const localPath = path.join(assetsDir, 'js', filename);
        fs.writeFileSync(localPath, content);

        results.push({
          originalUrl: url,
          localPath: `assets/js/${filename}`,
        });
      } catch (error: any) {
        this.api.log(`Failed to download script: ${url} - ${error.message}`);
      }
    }

    return results;
  }

  private rewriteCssUrls(css: string, baseUrl: string): string {
    // Replace url() references with local paths
    return css.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, (match, url) => {
      // Keep data URIs
      if (url.startsWith('data:')) {
        return match;
      }
      
      // Remove external font URLs (they cause CORS issues)
      if (url.startsWith('http') && (url.includes('.woff') || url.includes('.ttf') || url.includes('.eot'))) {
        return "url('')"; // Empty URL to avoid CORS error
      }
      
      // Keep other external URLs as-is
      if (url.startsWith('http')) {
        return match;
      }
      
      // Convert relative URLs to absolute
      try {
        const absoluteUrl = new URL(url, baseUrl).href;
        return `url('${absoluteUrl}')`;
      } catch {
        return match;
      }
    });
  }

  /**
   * Resolve CSS custom properties (CSS variables)
   * Removes undefined var() references or extracts fallback values
   */
  private resolveCSSCustomProperties(css: string): string {
    // First, collect all :root variable definitions
    const rootVars = new Map<string, string>();
    const rootMatch = css.match(/:root\s*\{[^}]+\}/gs);
    
    if (rootMatch) {
      rootMatch.forEach(block => {
        const varMatches = block.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g);
        for (const match of varMatches) {
          rootVars.set(match[1], match[2].trim());
        }
      });
    }

    // Now replace all var() usages
    let result = css.replace(/var\s*\(\s*(--[a-zA-Z0-9-]+)(?:\s*,\s*([^)]+))?\s*\)/g, (match, varName, fallback) => {
      // If there's a fallback value, use it
      if (fallback) {
        return fallback.trim();
      }
      
      // Check if variable is defined in :root
      if (rootVars.has(varName)) {
        return rootVars.get(varName)!;
      }
      
      // Default fallback values for common patterns
      if (varName.includes('color') || varName.includes('Color')) {
        return 'currentColor';
      }
      if (varName.includes('font') || varName.includes('Font')) {
        return 'inherit';
      }
      if (varName.includes('spacing') || varName.includes('margin') || varName.includes('padding')) {
        return '0';
      }
      if (varName.includes('width') || varName.includes('Width') || varName.includes('height') || varName.includes('Height')) {
        return 'auto';
      }
      if (varName.includes('opacity') || varName.includes('Opacity')) {
        return '1';
      }
      
      // Last resort: return inherit
      return 'inherit';
    });

    // Clean up orphaned values (single words between semicolons that aren't property: value pairs)
    // This fixes cases like "position: absolute; center; bottom: 0"
    result = result.replace(/;\s*([a-z-]+)\s*;/g, ';');
    
    return result;
  }
}
