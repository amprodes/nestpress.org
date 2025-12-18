/**
 * Dynamic Theme Loader
 * Loads themes from /themes folder at runtime
 * Supports hot-swapping without rebuild
 */

import React, { ComponentType } from 'react';

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
}

export interface LoadedTheme {
  metadata: ThemeMetadata;
  templates: Record<string, ComponentType<any>>;
}

class ThemeLoader {
  private loadedThemes: Map<string, LoadedTheme> = new Map();
  private activeThemeSlug: string | null = null;

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

      // Dynamically import theme entry point
      const themeModule = await import(
        /* @vite-ignore */
        `/themes/${slug}/index.tsx`
      );

      // Extract template components
      const templates: Record<string, ComponentType<any>> = {};
      
      // Get template list - prioritize old format for compatibility
      // For WordPress customTemplates, they're optional variations, not required
      const baseTemplateList = metadata.templates || 
        ['index', 'single', 'page', 'archive', 'category', 'search', '404']; // Core templates
      
      // Add custom templates from WordPress format (optional)
      const customTemplateList = metadata.customTemplates?.map(t => t.name) || [];
      const allTemplates = [...baseTemplateList, ...customTemplateList];
      
      for (const templateName of allTemplates) {
        // Convert template name to component name
        let componentName: string;
        if (templateName === '404') {
          componentName = 'NotFoundTemplate';
        } else if (templateName === 'front-page') {
          componentName = 'FrontPageTemplate';
        } else {
          // Handle hyphenated names: page-with-sidebar → PageWithSidebarTemplate
          const pascalCase = templateName
            .split('-')
            .map(part => this.capitalize(part))
            .join('');
          componentName = `${pascalCase}Template`;
        }
        
        // Try to load the template component
        if (themeModule[componentName]) {
          templates[templateName] = themeModule[componentName];
        } else {
          // Only warn for core templates, custom templates are optional
          if (baseTemplateList.includes(templateName)) {
            console.warn(`⚠️ Theme "${slug}" missing core template: ${componentName}`);
          }
        }
      }

      const loadedTheme: LoadedTheme = {
        metadata,
        templates,
      };

      // Cache the loaded theme
      this.loadedThemes.set(slug, loadedTheme);

      console.log(`✅ Theme loaded: ${metadata.name} v${metadata.version}`);
      return loadedTheme;
    } catch (error) {
      console.error(`❌ Failed to load theme "${slug}":`, error);
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
      console.error('Failed to discover themes:', error);
      return ['default'];
    }
  }

  /**
   * Set active theme
   */
  setActiveTheme(slug: string) {
    this.activeThemeSlug = slug;
    localStorage.setItem('active_theme', slug);
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
   * Get active theme slug
   */
  getActiveThemeSlug(): string {
    if (!this.activeThemeSlug) {
      this.activeThemeSlug = localStorage.getItem('active_theme') || 'default';
    }
    return this.activeThemeSlug;
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

  // Load theme function - defined before useEffect to avoid stale closure
  const loadTheme = React.useCallback(async (slug: string, forceReload: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear cache if loading a different theme to ensure fresh load
      if (forceReload || (currentThemeId && currentThemeId !== slug)) {
        console.log(`🔄 Clearing theme cache for switch from "${currentThemeId}" to "${slug}"`);
        themeLoader.clearCache();
      }
      
      const loadedTheme = await themeLoader.loadTheme(slug);
      themeLoader.setActiveTheme(slug);
      setTheme(loadedTheme);
      setCurrentThemeId(slug);
      console.log(`🎨 Theme switched to: ${slug}`, loadedTheme.metadata?.name);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load theme:', err);
      
      // Try fallback to default
      if (slug !== 'default') {
        console.log('Attempting fallback to default theme...');
        try {
          themeLoader.clearCache();
          const defaultTheme = await themeLoader.loadTheme('default');
          setTheme(defaultTheme);
          setCurrentThemeId('default');
        } catch {
          // Default also failed
        }
      }
    } finally {
      setLoading(false);
    }
  }, [currentThemeId]);

  // Load theme when themeIdOverride changes
  React.useEffect(() => {
    const themeToLoad = themeIdOverride || themeLoader.getActiveThemeSlug();
    
    console.log(`🔍 Theme effect triggered: requested="${themeToLoad}", current="${currentThemeId}"`);
    
    // Always reload if theme actually changed
    if (themeToLoad !== currentThemeId) {
      loadTheme(themeToLoad, true);
    }
  }, [themeIdOverride, loadTheme]);

  const switchTheme = React.useCallback(async (slug: string) => {
    await loadTheme(slug, true);
  }, [loadTheme]);

  const reloadTheme = React.useCallback(async () => {
    if (!currentThemeId) return;
    try {
      setLoading(true);
      themeLoader.clearCache();
      const reloaded = await themeLoader.loadTheme(currentThemeId);
      setTheme(reloaded);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentThemeId]);

  return {
    theme,
    loading,
    error,
    switchTheme,
    reloadTheme,
    currentThemeId,
  };
}
