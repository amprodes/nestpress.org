/**
 * Plugin Name: SEO Toolkit
 * Plugin URI: https://nestpress.dev/plugins/seo-toolkit
 * Description: Comprehensive SEO optimization toolkit with AI-powered meta descriptions, OpenGraph support, XML sitemaps, and schema markup generation.
 * Version: 1.0.0
 * Author: NestPress Team
 * Author URI: https://nestpress.dev
 * License: GPL-2.0+
 * Text Domain: seo-toolkit
 * Requires at least: 1.0.0
 * Requires Node: 18.0.0
 */

// Note: Types are provided at runtime by the plugin loader
interface NestPressPlugin {
  metadata?: Record<string, string>;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  setup?: (api: any) => Promise<void>;
  registerHooks?: (api: any) => void;
  registerRoutes?: (api: any) => void;
  registerAdminMenu?: (api: any) => void;
  registerSettings?: (api: any) => void;
}

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  robots?: string;
  structuredData?: any;
}

/**
 * SEO Toolkit Plugin
 * Provides comprehensive SEO optimization for NestPress
 */
const SEOToolkit: NestPressPlugin = {
  metadata: {
    Name: 'SEO Toolkit',
    Version: '1.0.0',
    Description: 'Comprehensive SEO optimization for NestPress',
    Author: 'NestPress Team',
  },

  onActivate: async () => {
    console.log('🔍 SEO Toolkit activated!');
  },

  onDeactivate: async () => {
    console.log('SEO Toolkit deactivated');
  },

  setup: async (api: any) => {
    api.log('SEO Toolkit initialized');
  },

  registerHooks: (api: any) => {
    // Filter post content for SEO optimization
    api.addFilter('post:seo_filter', async (post: any) => {
      const seo: SEOData = post.seo || {};
      
      // Auto-generate meta description if not set
      if (!seo.description && post.content) {
        seo.description = post.content
          .replace(/<[^>]*>/g, '') // Strip HTML
          .substring(0, 160)
          .trim() + '...';
      }

      // Auto-generate title if not set
      if (!seo.title) {
        seo.title = post.title;
      }

      // Extract keywords from content if not set
      if (!seo.keywords || seo.keywords.length === 0) {
        seo.keywords = extractKeywords(post.content || '');
      }

      return { ...post, seo };
    }, 10);

    // Add structured data to posts
    api.addFilter('post:structured_data', async (post: any) => {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.seo?.description || post.excerpt,
        author: {
          '@type': 'Person',
          name: post.author,
        },
        datePublished: post.date,
        dateModified: post.updatedAt || post.date,
      };

      return { ...post, structuredData };
    }, 20);

    // Generate sitemap entries
    api.addFilter('sitemap:entries', async (entries: any[]) => {
      // Add additional sitemap logic here
      return entries;
    }, 10);

    // Add robots meta tag filter
    api.addFilter('page:robots_meta', async (robots: string, context: any) => {
      // Default robots directive
      if (!robots) {
        return 'index, follow';
      }
      return robots;
    }, 10);
  },

  registerSettings: (api: any) => {
    api.registerSetting('seo', 'seo_title_separator', {
      type: 'string',
      default: '|',
      description: 'Character used to separate title parts',
    });

    api.registerSetting('seo', 'seo_default_og_image', {
      type: 'string',
      default: '',
      description: 'Default Open Graph image URL',
    });

    api.registerSetting('seo', 'seo_enable_sitemap', {
      type: 'boolean',
      default: true,
      description: 'Enable XML sitemap generation',
    });

    api.registerSetting('seo', 'seo_enable_schema', {
      type: 'boolean',
      default: true,
      description: 'Enable Schema.org structured data',
    });
  },

  registerAdminMenu: (api: any) => {
    api.addMenuPage({
      pageTitle: 'SEO Settings',
      menuTitle: 'SEO',
      capability: 'manage_options',
      menuSlug: 'seo-toolkit',
      icon: '🔍',
      position: 80,
    });

    api.addSubmenuPage('seo-toolkit', {
      pageTitle: 'General Settings',
      menuTitle: 'General',
      capability: 'manage_options',
      menuSlug: 'seo-general',
    });

    api.addSubmenuPage('seo-toolkit', {
      pageTitle: 'Sitemap',
      menuTitle: 'Sitemap',
      capability: 'manage_options',
      menuSlug: 'seo-sitemap',
    });

    api.addSubmenuPage('seo-toolkit', {
      pageTitle: 'Social Media',
      menuTitle: 'Social',
      capability: 'manage_options',
      menuSlug: 'seo-social',
    });
  },
};

/**
 * Extract keywords from content
 */
function extractKeywords(content: string): string[] {
  // Simple keyword extraction - in production, use NLP
  const text = content.replace(/<[^>]*>/g, '').toLowerCase();
  const words = text.split(/\s+/);
  
  // Filter common words and get unique
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'is', 'are', 'was', 'were']);
  const keywords = words
    .filter(word => word.length > 3 && !stopWords.has(word))
    .slice(0, 10);
  
  return [...new Set(keywords)];
}

export default SEOToolkit;
