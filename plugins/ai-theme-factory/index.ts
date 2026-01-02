/**
 * Plugin Name: AI Theme Factory
 * Description: Generate NestPress themes from any website URL using AI
 * Version: 1.0.0
 * Author: NestPress Team
 * Requires at least: 1.0.0
 */

import * as path from 'path';
import type { NestPressPlugin } from '../../backend/src/modules/plugins/plugin-loader.service';

const AIThemeFactoryPlugin: NestPressPlugin = {
  metadata: {
    Name: 'AI Theme Factory',
    Version: '1.0.0',
    Description: 'AI-powered theme cloning from any website',
    Author: 'NestPress',
    RequiresAtLeast: '1.0.0',
  },

  onActivate: async () => {
    console.log('[ai-theme-factory] ✅ Plugin activated!');
    console.log('[ai-theme-factory] 📦 Installing dependencies (puppeteer, cheerio, sharp)...');
  },

  onDeactivate: async () => {
    console.log('[ai-theme-factory] ⚠️  Plugin deactivated');
  },

  setup: async (api: any) => {
    console.log('[ai-theme-factory] 🚀 Setting up AI Theme Factory...');
    
    try {
      // Don't load backend handlers here - load them lazily when routes are called
      // This avoids loading heavy dependencies (Puppeteer, Sharp) on plugin init
      api._backendLoaded = false;
      api._loadBackend = async () => {
        if (!api._backendLoaded) {
          try {
            console.log('[ai-theme-factory] 📦 Loading backend handlers from:', __dirname + '/backend.ts');
            const backend = await import('./backend.ts');
            api._backendHandlers = backend;
            api._backendLoaded = true;
            console.log('[ai-theme-factory] ✅ Backend handlers loaded successfully');
            console.log('[ai-theme-factory] Available handlers:', Object.keys(backend));
          } catch (loadError: any) {
            console.error('[ai-theme-factory] ❌ Failed to load backend:', loadError.message);
            console.error('[ai-theme-factory] Stack:', loadError.stack);
            throw loadError;
          }
        }
        return api._backendHandlers;
      };
      
      console.log('[ai-theme-factory] ✅ Setup complete (backend will load on first use)');
    } catch (error: any) {
      console.error('[ai-theme-factory] ⚠️ Setup error (non-fatal):', error.message);
      // Don't throw - let other registrations proceed
    }
  },

  registerHooks: (api: any) => {
    // Add filter to inject custom CSS for admin UI
    api.addFilter('admin:head', () => {
      return `<style>.ai-theme-factory-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }</style>`;
    });
  },

  registerRoutes: (api: any) => {
    console.log('[ai-theme-factory] 📡 Registering API routes...');
    
    // POST /api/v1/plugins/ai-theme-factory/generate
    api.registerRoute('POST', '/generate', async (req: any, res: any) => {
      console.log('[ai-theme-factory] 📥 Generate theme request received');
      
      const { url, themeName: providedThemeName } = req.body;
      
      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required',
        });
      }
      
      // Extract theme name from URL if not provided
      // Example: https://kriesi.at/themes/enfold-business-flat → enfold-business-flat
      let themeName = providedThemeName;
      if (!themeName) {
        try {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          // Get last segment of path, remove trailing slash
          const lastSegment = pathname.split('/').filter(Boolean).pop() || 'generated-theme';
          // Sanitize to valid theme name
          themeName = lastSegment.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
        } catch {
          themeName = 'generated-theme';
        }
      }
      
      const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`[ai-theme-factory] 🎯 Theme name: "${themeName}" (extracted from URL: ${url})`);
      
      // Return jobId immediately for SSE connection
      res.json({ success: true, jobId });
      
      // Run generation in background
      (async () => {
        try {
          console.log('[ai-theme-factory] Loading backend handlers...');
          const backend = await api._loadBackend();
          console.log('[ai-theme-factory] Backend loaded, starting generation...');
          
          if (!backend || !backend.handleGenerateTheme) {
            throw new Error('Backend handler not found');
          }
          
          await backend.handleGenerateTheme(url, themeName, jobId, api);
          console.log('[ai-theme-factory] Generation complete');
        } catch (error: any) {
          console.error('[ai-theme-factory] Generation error:', error);
          console.error('[ai-theme-factory] Error stack:', error.stack);
          const progressStream = api.progressStreams?.get(jobId);
          if (progressStream) {
            progressStream(0, error.message || 'Generation failed', { type: 'error' });
          }
        }
      })();
    });

    // GET /api/v1/plugins/ai-theme-factory/progress/:jobId
    api.registerRoute('GET', '/progress/:jobId', async (req: any, res: any) => {
      const { jobId } = req.params;
      console.log(`[ai-theme-factory] 📊 SSE connection for job: ${jobId}`);
      
      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
      
      // Send initial connection message
      res.write(`data: ${JSON.stringify({ type: 'connected', jobId })}\n\n`);
      
      // Create progress callback
      const sendProgress = (progress: number, message: string, metadata?: any) => {
        const data = { progress, message, ...metadata };
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };
      
      // Store in map for backend to use
      if (!api.progressStreams) {
        api.progressStreams = new Map();
      }
      api.progressStreams.set(jobId, sendProgress);
      
      // Cleanup on disconnect
      req.on('close', () => {
        console.log(`[ai-theme-factory] 🔌 SSE disconnected for job: ${jobId}`);
        api.progressStreams.delete(jobId);
        res.end();
      });
    });

    // GET /api/v1/plugins/ai-theme-factory/test-simple
    // Quick test endpoint - generates minimal white theme and validates it
    api.registerRoute('GET', '/test-simple', async (req: any, res: any) => {
      try {
        const jobId = 'test-' + Date.now();
        api.log(`[ai-theme-factory] 🧪 Starting simple theme test (Job: ${jobId})`);
        
        // Generate simple white theme (minimal, fast)
        const backend = await api._loadBackend();
        const result = await backend.handleTestSimpleTheme(jobId, api);
        
        return res.json({
          success: true,
          message: '✅ Simple theme test passed! All files validated successfully.',
          data: result,
        });
      } catch (error: any) {
        api.log('Simple theme test failed: ' + error.message, 'error');
        return res.status(500).json({
          success: false,
          message: '❌ Simple theme test failed',
          error: error.message,
        });
      }
    });

    // GET /api/v1/plugins/ai-theme-factory/themes
    api.registerRoute('GET', '/themes', async (req: any, res: any) => {
      const backend = await api._loadBackend();
      const result = await backend.handleListThemes(api);
      return res.json(result);
    });

    // POST /api/v1/plugins/ai-theme-factory/install/:slug
    api.registerRoute('POST', '/install/:slug', async (req: any, res: any) => {
      const { slug } = req.params;
      const backend = await api._loadBackend();
      const result = await backend.handleInstallTheme(slug, api);
      return res.json(result);
    });

    // GET /api/v1/plugins/ai-theme-factory/download/:slug
    api.registerRoute('GET', '/download/:slug', async (req: any, res: any) => {
      const { slug } = req.params;
      const zipPath = path.join(process.cwd(), 'public', 'downloads', `${slug}.zip`);
      
      return res.download(zipPath, `${slug}.zip`, (err: any) => {
        if (err) {
          console.error('[ai-theme-factory] Download error:', err);
          return res.status(404).json({ success: false, message: 'Theme not found' });
        }
      });
    });

    console.log('[ai-theme-factory] ✅ All routes registered successfully');
  },

  registerAdminMenu: (api: any) => {
    console.log('[ai-theme-factory] 📋 Registering admin menu...');
    
    // addSubmenuPage takes TWO parameters: (parentSlug, options)
    api.addSubmenuPage('appearance', {
      pageTitle: 'AI Theme Factory',
      menuTitle: 'AI Theme Factory',
      menuSlug: 'ai-theme-factory',
      capability: 'manage_options',
      icon: 'Sparkles',
      component: 'ThemeFactoryAdminPage', // Component name as string - will be dynamically loaded
    });
    
    console.log('[ai-theme-factory] ✅ Admin menu registered under Appearance');
  },
};

export default AIThemeFactoryPlugin;
