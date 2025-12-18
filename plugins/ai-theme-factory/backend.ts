/**
 * AI Theme Factory - Backend Handlers
 * 
 * Handles theme generation pipeline:
 * 1. Analyze target website
 * 2. Clone resources (CSS, images, fonts)
 * 3. Assemble theme structure
 * 4. NestPressify (inject dynamic features)
 * 5. Package as .zip
 */

// Polyfill for Node.js environment (undici requires File/Blob)
if (typeof globalThis.File === 'undefined') {
  // @ts-ignore - Add minimal File polyfill
  globalThis.File = class File extends Blob {
    constructor(bits: any[], name: string, options?: any) {
      super(bits, options);
      // @ts-ignore
      this.name = name;
      // @ts-ignore
      this.lastModified = options?.lastModified || Date.now();
    }
  };
}

import * as path from 'path';
import * as fs from 'fs';
import { ThemeAnalyzer } from './services/ThemeAnalyzer';
import { ResourceCloner } from './services/ResourceCloner';
import { ThemeAssembler } from './services/ThemeAssembler';
import { AINestPressifier } from './services/AINestPressifier';
import { ThemePackager } from './services/ThemePackager';
import { ThemeValidator } from './services/ThemeValidator';

/**
 * Backend API Handler: Generate Theme
 * 
 * Main entry point for theme generation pipeline
 */
export async function handleGenerateTheme(url: string, themeName: string, jobId: string, api: any): Promise<any> {
  api.log(`[ai-theme-factory] 🚀 Starting theme generation for: ${url} (Job: ${jobId})`);
  
  // Enhance API with progress callback
  api.sendProgress = (progress: number, message: string, metadata?: any) => {
    api.log(`[ai-theme-factory] Progress ${progress}%: ${message}`);
    
    // Send to SSE stream if connected
    const progressStream = api.progressStreams?.get(jobId);
    if (progressStream) {
      progressStream(progress, message, metadata);
    }
  };
  
  try {
    // Create temp directory for this job
    const tempDir = path.join(process.cwd(), 'temp', 'themes', jobId);
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Phase 1: Analyze website (10-30%)
    api.log(`Phase 1/5: Analyzing website structure...`);
    api.sendProgress?.(10, 'Analyzing target website...', { type: 'phase', phase: 1 });
    const analyzer = new ThemeAnalyzer(api);
    const blueprint = await analyzer.analyze(url);
    api.log(`✓ Website analysis complete: ${blueprint.siteTitle}`);
    api.sendProgress?.(30, 'Website analysis complete', { type: 'phase', phase: 1 });

    // Phase 2: Clone resources (30-50%)
    api.log(`Phase 2/5: Cloning resources (CSS, images, fonts)...`);
    api.sendProgress?.(30, 'Downloading website assets...', { type: 'phase', phase: 2 });
    const cloner = new ResourceCloner(api, tempDir);
    const clonedAssets = await cloner.clone(blueprint.resources, themeName);
    api.log(`✓ Resources cloned: ${clonedAssets.stylesheets?.length || 0} CSS, ${clonedAssets.images?.length || 0} images`);
    api.sendProgress?.(50, 'Assets downloaded successfully', { type: 'phase', phase: 2 });

    // Phase 3: Assemble theme structure (50-70%)
    api.log(`Phase 3/5: Assembling theme structure...`);
    api.sendProgress?.(50, 'Generating theme files...', { type: 'phase', phase: 3 });
    const assembler = new ThemeAssembler(api, tempDir);
    const assembledTheme = await assembler.assemble(blueprint, themeName);
    api.log(`✓ Theme structure assembled`);
    api.sendProgress?.(70, 'Theme structure complete', { type: 'phase', phase: 3 });

    // Phase 4: NestPressify (70-88%)
    api.log(`Phase 4/5: NestPressifying theme (injecting dynamic features)...`);
    api.sendProgress?.(70, 'AI enhancing with NestPress features...', { type: 'phase', phase: 4 });
    const nestpressifier = new AINestPressifier(api);
    const nestpressTheme = await nestpressifier.convertToNestPress(assembledTheme, blueprint);
    api.log(`✓ NestPressification complete (validation done per-file during assembly)`);
    api.sendProgress?.(88, 'AI enhancement complete', { type: 'phase', phase: 4 });

    // Phase 5: Package as .zip (88-92%)
    api.log(`Phase 5/6: Packaging theme as .zip...`);
    api.sendProgress?.(88, 'Packaging theme files...', { type: 'phase', phase: 5 });
    const packager = new ThemePackager(api, tempDir);
    const result = await packager.package(nestpressTheme.rootDir, themeName);
    api.log(`✓ Theme packaged successfully: ${result.filename} (slug: ${result.slug})`);
    api.sendProgress?.(92, 'Theme packaged successfully', { type: 'phase', phase: 5 });

    // Phase 6: Trigger themes rescan to make it appear in Appearance → Themes
    api.sendProgress?.(95, 'Updating theme list...', { type: 'phase', phase: 6 });
    try {
      const response = await fetch('http://localhost:4000/api/v1/themes/rescan');
      if (response.ok) {
        api.log(`✓ Themes list updated - new theme visible in admin`);
        api.sendProgress?.(100, 'Theme installed successfully!', { type: 'phase', phase: 6 });
      }
    } catch (error) {
      api.log('Warning: Could not trigger theme rescan. Refresh themes page manually.', 'warn');
    }

    // Send completion message via SSE
    const progressStream = api.progressStreams?.get(jobId);
    if (progressStream) {
      progressStream(100, 'Theme generation complete!', {
        type: 'complete',
        downloadUrl: `/api/v1/plugins/ai-theme-factory/download/${result.slug}`,
        themeName: result.slug,
      });
    }

    return {
      success: true,
      message: 'Theme generated successfully! 🎉',
      data: {
        themeName,
        slug: result.slug,
        filename: result.filename,
        downloadUrl: `/api/v1/plugins/ai-theme-factory/download/${result.slug}`,
        blueprint: {
          url: blueprint.url,
          title: blueprint.siteTitle,
          pages: blueprint.pages?.length || 0,
          hasEcommerce: blueprint.hasEcommerce || false,
        },
        stats: {
          totalFiles: result.totalFiles || 0,
          fileSize: result.fileSize ? `${(result.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A',
          generatedAt: new Date().toISOString(),
        }
      },
    };
  } catch (error: any) {
    api.log('Theme generation failed: ' + (error.message || 'Unknown error'), 'error');
    
    // Send error message via SSE
    const progressStream = api.progressStreams?.get(jobId);
    if (progressStream) {
      progressStream(0, error.message || 'Generation failed', {
        type: 'error',
        error: error.message,
      });
    }
    
    return {
      success: false,
      message: error.message || 'Theme generation failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
}

/**
 * Backend API Handler: List Generated Themes
 */
export async function handleListThemes(api: any): Promise<any> {
  try {
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    
    if (!fs.existsSync(downloadsDir)) {
      return { success: true, data: [] };
    }
    
    const files = fs.readdirSync(downloadsDir);
    const zipFiles = files.filter((f: string) => f.endsWith('.zip'));
    
    const themes = zipFiles.map((filename: string) => {
      const zipPath = path.join(downloadsDir, filename);
      const stats = fs.statSync(zipPath);
      const slug = filename.replace('.zip', '');
      
      const themesDir = path.join(process.cwd(), '..', 'themes');
      const isInstalled = fs.existsSync(path.join(themesDir, slug));
      
      return {
        slug,
        filename,
        fileSize: stats.size,
        createdAt: stats.birthtime,
        downloadUrl: `/api/v1/plugins/ai-theme-factory/download/${slug}`,
        isInstalled,
      };
    });

    return { success: true, data: themes };
  } catch (error: any) {
    api.log('Failed to list themes: ' + error.message, 'error');
    return { success: false, message: error.message };
  }
}

/**
 * Backend API Handler: Install Theme
 */
export async function handleInstallTheme(slug: string, api: any): Promise<any> {
  try {
    const AdmZip = require('adm-zip');
    const zipPath = path.join(process.cwd(), 'public', 'downloads', `${slug}.zip`);
    const themesDir = path.join(process.cwd(), '..', 'themes');
    const targetDir = path.join(themesDir, slug);

    if (!fs.existsSync(zipPath)) {
      return { success: false, message: 'Theme zip not found' };
    }

    // Extract zip
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(targetDir, true);

    api.log(`✓ Theme installed: ${slug}`);

    return {
      success: true,
      message: 'Theme installed successfully!',
      data: { slug, installedAt: new Date().toISOString() },
    };
  } catch (error: any) {
    api.log('Theme installation failed: ' + error.message, 'error');
    return { success: false, message: error.message };
  }
}

/**
 * Backend API Handler: Test Simple Theme
 * Generates minimal white theme WITHOUT AI enhancement for fast testing
 */
export async function handleTestSimpleTheme(jobId: string, api: any): Promise<any> {
  api.log(`[ai-theme-factory] 🧪 Generating simple test theme (Job: ${jobId})`);
  
  try {
    // Create temp directory
    const tempDir = path.join(process.cwd(), 'temp', 'themes', jobId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    api.log(`✓ Created temp dir: ${tempDir}`);
    
    // Phase 1: Create minimal theme structure (NO AI, NO web scraping)
    api.log(`Phase 1/3: Creating minimal theme structure...`);
    const assembler = new ThemeAssembler(api, tempDir);
    
    // Mock minimal blueprint (must match ThemeBlueprint interface exactly)
    const mockBlueprint = {
      url: 'test://minimal',
      siteTitle: 'Test Theme',
      designSystem: {
        colors: { 
          primary: '#000000', 
          secondary: '#666666', 
          background: '#ffffff',
          text: '#000000',
          accent: '#0066cc'
        },
        typography: {
          headingFont: 'Arial, sans-serif',
          bodyFont: 'Arial, sans-serif',
          sizes: {
            base: '16px',
            small: '14px',
            large: '18px',
            h1: '32px',
            h2: '28px',
            h3: '24px'
          }
        },
        spacing: {
          small: '8px',
          medium: '16px',
          large: '32px'
        },
        borderRadius: {
          small: '4px',
          medium: '8px',
          large: '16px'
        }
      },
      structure: {
        navigation: [
          {
            location: 'primary',
            items: [
              { label: 'Home', url: '/' },
              { label: 'About', url: '/about' }
            ]
          }
        ],
        widgets: [],
        layout: {
          type: 'standard',
          hasSidebar: false,
          headerStyle: 'simple',
          footerStyle: 'simple'
        }
      },
      htmlSnippets: {
        header: '<header><h1>Test Site</h1></header>',
        footer: '<footer><p>&copy; 2025</p></footer>',
        templates: {}
      },
      resources: { 
        stylesheets: [], 
        scripts: [], 
        images: [],
        fonts: []
      },
      pages: [],
      hasEcommerce: false
    };
    
    const themeName = 'test-minimal';
    const assembled = await assembler.assemble(mockBlueprint, themeName);
    api.log(`✓ Minimal theme structure created`);
    
    // Phase 2: Quick file check (no TypeScript validation - too strict for plugin context)
    api.log(`Phase 2/3: Verifying file structure...`);
    
    const requiredFiles = [
      'theme.json',
      'index.tsx',
      'templates/index.tsx',
      'templates/single.tsx',
      'parts/Header.tsx',
      'parts/Footer.tsx'
    ];
    
    let fileCount = 0;
    for (const file of requiredFiles) {
      const filePath = path.join(assembled.rootDir, file);
      if (fs.existsSync(filePath)) {
        fileCount++;
      } else {
        throw new Error(`Missing required file: ${file}`);
      }
    }
    
    api.log(`✓ All ${fileCount} required files generated successfully`);
    
    // Phase 3: Package
    api.log(`Phase 3/3: Packaging test theme...`);
    const packager = new ThemePackager(api, tempDir);
    const result = await packager.package(assembled.rootDir, themeName);
    api.log(`✓ Test theme packaged: ${result.filename}`);
    
    // Cleanup temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
      api.log(`✓ Cleaned up temp directory`);
    } catch (e) {
      api.log('Warning: Could not clean up temp directory', 'warn');
    }
    
    return {
      themeName,
      slug: result.slug,
      filename: result.filename,
      filesGenerated: fileCount,
      message: '✅ Test passed! Generated minimal theme with all required files.',
    };
    
  } catch (error: any) {
    api.log(`❌ Test failed: ${error.message}`, 'error');
    throw error;
  }
}
