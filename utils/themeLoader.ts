/**
 * Dynamic Theme Loader
 * Loads themes from /themes folder at runtime
 * Supports hot-swapping without rebuild
 * 
 * NOTE: Templates are now .html files (WordPress block markup)
 * They are loaded and parsed at runtime using wordpress-block-renderer.tsx
 */

import React, { ComponentType } from 'react';
import { renderTemplate } from './wordpress-block-renderer';

export interface ThemeMetadata {
  name: string;
  slug: string;
  version?: string;
  themVersion?: string; // WordPress theme.json uses 'themVersion'
  author: string;
  description: string;
  thumbnail: string;
  features?: string[];
  templates?: string[]; // Old format - array of template names
  customTemplates?: Array<{ // WordPress format
    name: string;
    title: string;
    postTypes?: string[];
  }>;
  templateParts?: Array<{ // WordPress format
    name: string;
    title: string;
    area?: string;
  }>;
  patterns?: string[]; // WordPress format
  settings?: any; // Can be old format or WordPress theme.json settings
  styles?: any; // WordPress theme.json styles
  requires?: {
    nestpress: string;
    react: string;
  };
  // WordPress theme.json fields
  $schema?: string;
  assets?: { // WordPress theme assets
    css?: string[];
    js?: string[];
  };
}

export interface LoadedTheme {
  metadata: ThemeMetadata;
  templates: Record<string, ComponentType<any>>;
  assets?: {
    css?: string[];
    js?: string[];
  };
  // WordPress theme functions
  functions?: {
    enqueueAssets?: () => { styles: any[]; scripts: any[] };
    themeSetup?: () => any;
    blockStyles?: Record<string, Array<{ name: string; label: string; inlineStyle?: string }>>;
    patternCategories?: Array<{ name: string; label: string }>;
    blockBindings?: Record<string, any>;
    applyBlockStyles?: () => void;
  };
}

class ThemeLoader {
  private loadedThemes: Map<string, LoadedTheme> = new Map();
  private activeThemeSlug: string | null = null;
  private templateHTMLCache: Map<string, string> = new Map(); // Cache loaded HTML templates

  /**
   * Load HTML template and create React component wrapper
   */
  private async loadHTMLTemplate(slug: string, templateName: string): Promise<ComponentType<any>> {
    const cacheKey = `${slug}/${templateName}`;
    
    try {
      // Try to load .html template first (new WordPress-compatible approach)
      const htmlPath = `/themes/${slug}/templates/${templateName}.html`;
      
      const htmlResponse = await fetch(htmlPath);
      if (htmlResponse.ok) {
        const templateHTML = await htmlResponse.text();
        
        // CRITICAL: Validate HTML before caching
        if (!templateHTML.includes('<!-- wp:')) {
          throw new Error(`Template ${templateName} is not valid WordPress block HTML`);
        }
        
        this.templateHTMLCache.set(cacheKey, templateHTML);
        
        // Return React component that renders the HTML template
        // Store HTML in variable accessible to closure
        const capturedHTML = templateHTML;
        
        return (props: any) => {
          return renderTemplate(capturedHTML, {
            post: props.post || props.page,
            posts: props.posts,
            primaryMenu: props.primaryMenu,
            footerMenu: props.footerMenu,
            widgets: props.widgets,
            header: props.header,
            data: props.data,
          }) as any;
        };
      }
      
      // Template not found - throw error (no TSX fallback - all themes use HTML templates now)
      throw new Error(`Template ${templateName} not found`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Load a theme from /themes/{slug}
   */
  async loadTheme(slug: string): Promise<LoadedTheme> {
    // Check if already loaded
    if (this.loadedThemes.has(slug)) {
      return this.loadedThemes.get(slug)!;
    }

    try {
      // Load theme metadata
      const metadataResponse = await fetch(`/themes/${slug}/theme.json`);
      if (!metadataResponse.ok) {
        throw new Error(`Theme ${slug} not found`);
      }
      const metadata: ThemeMetadata = await metadataResponse.json();

      // Load template components (as React wrappers around HTML)
      const templates: Record<string, ComponentType<any>> = {};
      
      // Get template list - core WordPress templates
      // Note: 'category' removed as WordPress uses 'archive' as fallback
      const baseTemplateList = metadata.templates || 
        ['index', 'single', 'page', 'archive', 'search', '404', 'home'];
      
      // Add custom templates from WordPress format (optional)
      const customTemplateList = metadata.customTemplates?.map(t => t.name) || [];
      const allTemplates = [...baseTemplateList, ...customTemplateList];
      
      // Load templates (HTML or TSX)
      for (const templateName of allTemplates) {
        try {
          const templateComponent = await this.loadHTMLTemplate(slug, templateName);
          templates[templateName] = templateComponent;
        } catch (error) {
          // Only warn for core templates, custom templates are optional
          if (baseTemplateList.includes(templateName)) {
          }
        }
      }

      // Theme functions are now loaded from theme.json assets field
      // WordPress block themes don't require functions.php - they use theme.json
      // Dynamic imports don't work with Vite for runtime-variable paths
      const themeFunctions = {
        // Create enqueueAssets from theme.json assets field
        enqueueAssets: metadata.assets ? () => ({
          styles: (metadata.assets?.css || []).map((css: string) => ({
            handle: css.split('/').pop()?.replace('.css', '') || 'theme-style',
            src: `/themes/${slug}/${css}`,
          })),
          scripts: (metadata.assets?.js || []).map((js: string) => ({
            handle: js.split('/').pop()?.replace('.js', '') || 'theme-script',
            src: `/themes/${slug}/${js}`,
          })),
        }) : undefined,
        themeSetup: undefined,
        blockStyles: undefined,
        patternCategories: undefined,
        blockBindings: undefined,
        applyBlockStyles: undefined,
      };

      const loadedTheme: LoadedTheme = {
        metadata,
        templates,
        assets: metadata.assets,
        functions: themeFunctions,
      };

      // Cache the loaded theme
      this.loadedThemes.set(slug, loadedTheme);
      return loadedTheme;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all available themes from /themes folder
   */
  async discoverThemes(): Promise<string[]> {
    try {
      // In a real implementation, this would scan the /themes directory
      // For now, we'll return known themes
      const response = await fetch('/themes/index.json').catch(() => null);
      if (response && response.ok) {
        const themes = await response.json();
        return themes;
      }
      
      // Fallback: return default theme
      return ['default'];
    } catch (error) {
      return ['default'];
    }
  }

  /**
   * Set active theme (memory only - use backend API to persist)
   */
  setActiveTheme(slug: string) {
    this.activeThemeSlug = slug;
    // REMOVED: localStorage.setItem('active_theme', slug);
    // WordPress stores active theme in database (wp_options: 'template' and 'stylesheet')
    // NestPress uses backend API: POST /themes/:id/activate
  }

  /**
   * Get active theme
   */
  getActiveTheme(): LoadedTheme | null {
    if (!this.activeThemeSlug) {
      return null;
    }
    return this.loadedThemes.get(this.activeThemeSlug) || null;
  }

  /**
   * Get active theme slug (from memory - should be set by CMSContext from backend)
   */
  getActiveThemeSlug(): string {
    // REMOVED: localStorage.getItem('active_theme')
    // Active theme is now managed by backend (database) and CMSContext
    return this.activeThemeSlug || 'default';
  }

  /**
   * Reload theme (hot reload)
   */
  async reloadTheme(slug: string): Promise<LoadedTheme> {
    // Remove from cache
    this.loadedThemes.delete(slug);
    
    // Reload
    return await this.loadTheme(slug);
  }

  /**
   * Get template component from active theme
   */
  getTemplate(templateName: string): ComponentType<any> | null {
    const theme = this.getActiveTheme();
    if (!theme) return null;
    
    return theme.templates[templateName] || theme.templates['index'] || null;
  }

  /**
   * Clear all loaded themes
   */
  clearCache() {
    this.loadedThemes.clear();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Singleton instance
export const themeLoader = new ThemeLoader();

// React Hook for using themes
export function useTheme(themeIdOverride?: string) {
  const [theme, setTheme] = React.useState<LoadedTheme | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [currentThemeId, setCurrentThemeId] = React.useState<string | null>(null);
  
  // Use ref to track current theme without triggering re-renders
  const currentThemeIdRef = React.useRef<string | null>(null);

  // Load theme function - use ref instead of state in dependencies
  const loadTheme = React.useCallback(async (slug: string, forceReload: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear cache if loading a different theme to ensure fresh load
      if (forceReload || (currentThemeIdRef.current && currentThemeIdRef.current !== slug)) {
        themeLoader.clearCache();
      }
      
      const loadedTheme = await themeLoader.loadTheme(slug);
      themeLoader.setActiveTheme(slug);
      setTheme(loadedTheme);
      setCurrentThemeId(slug);
      currentThemeIdRef.current = slug;
    } catch (err) {
      setError(err as Error);
      
      // Try fallback to default
      if (slug !== 'default') {
        try {
          themeLoader.clearCache();
          const defaultTheme = await themeLoader.loadTheme('default');
          setTheme(defaultTheme);
          setCurrentThemeId('default');
          currentThemeIdRef.current = 'default';
        } catch {
          // Default also failed
        }
      }
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - use ref to track current theme

  // Load theme when themeIdOverride changes
  React.useEffect(() => {
    const themeToLoad = themeIdOverride || themeLoader.getActiveThemeSlug();
    
    
    // Always reload if theme actually changed
    if (themeToLoad !== currentThemeIdRef.current) {
      loadTheme(themeToLoad, true);
    }
  }, [themeIdOverride, loadTheme]);

  const switchTheme = React.useCallback(async (slug: string) => {
    await loadTheme(slug, true);
  }, [loadTheme]);

  const reloadTheme = React.useCallback(async () => {
    if (!currentThemeIdRef.current) return;
    try {
      setLoading(true);
      themeLoader.clearCache();
      const reloaded = await themeLoader.loadTheme(currentThemeIdRef.current);
      setTheme(reloaded);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - use ref

  return {
    theme,
    loading,
    error,
    switchTheme,
    reloadTheme,
    currentThemeId,
  };
}
