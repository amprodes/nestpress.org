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

export interface ClonedResources {
  stylesheets: Array<{ originalUrl: string; localPath: string; content: string }>;
  images: Array<{ originalUrl: string; localPath: string; size: number }>;
  fonts: Array<{ originalUrl: string; localPath: string }>;
  scripts: Array<{ originalUrl: string; localPath: string }>;
}

export class ResourceCloner {
  private api: any;
  private tempDir: string;

  constructor(api: any, tempDir: string) {
    this.api = api;
    this.tempDir = tempDir;
  }

  async clone(resources: any, themeName: string): Promise<ClonedResources> {
    this.api.log(`[ResourceCloner] Cloning resources for: ${themeName}`);

    const assetsDir = path.join(this.tempDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.mkdirSync(path.join(assetsDir, 'css'), { recursive: true });
    fs.mkdirSync(path.join(assetsDir, 'images'), { recursive: true });
    fs.mkdirSync(path.join(assetsDir, 'fonts'), { recursive: true });
    fs.mkdirSync(path.join(assetsDir, 'js'), { recursive: true });

    this.api.sendProgress?.(31, `Downloading ${resources.stylesheets.length} stylesheets...`, { type: 'phase', phase: 2 });
    const stylesheets = await this.cloneStylesheets(resources.stylesheets, assetsDir);
    this.api.sendProgress?.(33, `${stylesheets.length} stylesheets downloaded`, { type: 'phase', phase: 2 });

    this.api.sendProgress?.(35, `Optimizing ${resources.images.length} images...`, { type: 'phase', phase: 2 });
    const images = await this.cloneImages(resources.images, assetsDir);
    this.api.sendProgress?.(37, `${images.length} images optimized`, { type: 'phase', phase: 2 });

    this.api.sendProgress?.(38, `Downloading ${resources.fonts.length} fonts...`, { type: 'phase', phase: 2 });
    const fonts = await this.cloneFonts(resources.fonts, assetsDir);
    this.api.sendProgress?.(39, `${fonts.length} fonts downloaded`, { type: 'phase', phase: 2 });

    const scripts = await this.cloneScripts(resources.scripts, assetsDir);

    this.api.log(`✓ Resources cloned: ${stylesheets.length} CSS, ${images.length} images, ${fonts.length} fonts`);

    return { stylesheets, images, fonts, scripts };
  }

  private async cloneStylesheets(urls: string[], assetsDir: string): Promise<any[]> {
    const results: any[] = [];

    for (let i = 0; i < Math.min(urls.length, 10); i++) {
      const url = urls[i];
      try {
        const response = await fetch(url);
        if (!response.ok) continue;

        let content = await response.text();
        
        // Rewrite URLs in CSS
        content = this.rewriteCssUrls(content, url);

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
        const response = await fetch(url);
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
        const response = await fetch(url);
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
        const response = await fetch(url);
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
      if (url.startsWith('data:') || url.startsWith('http')) {
        return match;
      }
      try {
        const absoluteUrl = new URL(url, baseUrl).href;
        return `url('${absoluteUrl}')`;
      } catch {
        return match;
      }
    });
  }
}
