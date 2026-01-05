import path from 'path';
import { defineConfig, loadEnv, Connect } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// Middleware to serve theme assets (CSS, HTML, JSON) as raw files
function serveThemeAssetsMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url || '';
    const cleanUrl = url.split('?')[0];
    
    // Only handle /themes/ requests
    if (!cleanUrl.startsWith('/themes/')) {
      return next();
    }
    
    const filePath = path.join(process.cwd(), cleanUrl);
    
    // Handle CSS files
    if (cleanUrl.endsWith('.css')) {
      if (fs.existsSync(filePath)) {
        console.log(`[Theme Assets] Serving CSS: ${cleanUrl}`);
        const content = fs.readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(content);
        return;
      }
    }
    
    // Handle HTML template files
    if (cleanUrl.endsWith('.html')) {
      if (fs.existsSync(filePath)) {
        console.log(`[Theme Assets] Serving HTML: ${cleanUrl}`);
        const content = fs.readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(content);
        return;
      }
    }
    
    // Handle JSON files (theme.json)
    if (cleanUrl.endsWith('.json')) {
      if (fs.existsSync(filePath)) {
        console.log(`[Theme Assets] Serving JSON: ${cleanUrl}`);
        const content = fs.readFileSync(filePath, 'utf-8');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(content);
        return;
      }
    }
    
    next();
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        fs: {
          // Allow serving files from themes and plugins folders
          allow: ['..', 'themes', 'plugins']
        },
        middlewareMode: false,
      },
      plugins: [
        // Plugin to register theme assets middleware BEFORE Vite's internal middleware
        {
          name: 'serve-theme-assets',
          enforce: 'pre',
          configureServer(server) {
            // Add middleware directly - this runs BEFORE Vite's transforms
            server.middlewares.use((req, res, next) => {
              const url = req.url || '';
              const cleanUrl = url.split('?')[0];
              
              // Only handle /themes/ requests for CSS, HTML, JSON
              if (!cleanUrl.startsWith('/themes/')) {
                return next();
              }
              
              const filePath = path.join(process.cwd(), cleanUrl);
              
              // Handle CSS files - serve as raw text/css
              if (cleanUrl.endsWith('.css')) {
                if (fs.existsSync(filePath)) {
                  console.log(`[Theme Assets] Serving RAW CSS: ${cleanUrl}`);
                  const content = fs.readFileSync(filePath, 'utf-8');
                  res.setHeader('Content-Type', 'text/css; charset=utf-8');
                  res.setHeader('Cache-Control', 'no-cache');
                  res.statusCode = 200;
                  res.end(content);
                  return;
                }
              }
              
              // Handle HTML template files
              if (cleanUrl.endsWith('.html')) {
                if (fs.existsSync(filePath)) {
                  console.log(`[Theme Assets] Serving HTML: ${cleanUrl}`);
                  const content = fs.readFileSync(filePath, 'utf-8');
                  res.setHeader('Content-Type', 'text/html; charset=utf-8');
                  res.setHeader('Cache-Control', 'no-cache');
                  res.statusCode = 200;
                  res.end(content);
                  return;
                }
              }
              
              // Handle JSON files (theme.json)
              if (cleanUrl.endsWith('.json')) {
                if (fs.existsSync(filePath)) {
                  console.log(`[Theme Assets] Serving JSON: ${cleanUrl}`);
                  const content = fs.readFileSync(filePath, 'utf-8');
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.setHeader('Cache-Control', 'no-cache');
                  res.statusCode = 200;
                  res.end(content);
                  return;
                }
              }
              
              next();
            });
          }
        },
        react(),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          // Don't bundle themes and plugins - load them dynamically
          external: (id) => id.startsWith('/themes/') || id.startsWith('/plugins/')
        },
        // Increase chunk size warning limit (the app is legitimately large)
        chunkSizeWarningLimit: 1000,
      },
      optimizeDeps: {
        exclude: ['themes', 'plugins']
      },
      assetsInclude: ['**/*.css'], // Treat CSS as assets when in themes/
      publicDir: false, // Don't auto-copy public dir
    };
});
