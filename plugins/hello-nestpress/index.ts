/**
 * Plugin Name: Hello NestPress
 * Plugin URI: https://nestpress.dev/plugins/hello-nestpress
 * Description: A simple demonstration plugin showing the NestPress plugin system in action. Displays a welcome message in the admin dashboard.
 * Version: 1.0.0
 * Author: NestPress Team
 * Author URI: https://nestpress.dev
 * License: GPL-2.0+
 * Text Domain: hello-nestpress
 * Requires at least: 1.0.0
 * Requires Node: 18.0.0
 */

// Note: NestPressPlugin and PluginAPI types are provided at runtime
// This file is loaded dynamically by the plugin loader

interface NestPressPlugin {
  metadata?: Record<string, string>;
  init?: (api: any) => Promise<void>;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  setup?: (api: any) => Promise<void>;
  registerHooks?: (api: any) => void;
  registerRoutes?: (api: any) => void;
  registerAdminMenu?: (api: any) => void;
  registerSettings?: (api: any) => void;
}

// Array of quotes to display
const quotes = [
  "Hello, NestPress! 👋",
  "Building the future of content management.",
  "TypeScript makes plugins better!",
  "WordPress-like, but modern.",
  "Hooks, filters, and actions - oh my!",
  "Your content, your way.",
  "Powered by NestJS and React.",
  "Open source and loving it!",
];

/**
 * Get a random quote
 */
function getRandomQuote(): string {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Hello NestPress Plugin
 */
const HelloNestPress: NestPressPlugin = {
  metadata: {
    Name: 'Hello NestPress',
    Version: '1.0.0',
    Description: 'A simple example plugin demonstrating the NestPress plugin API.',
    Author: 'NestPress Team',
  },

  /**
   * Called when plugin is first loaded
   */
  init: async (api: any) => {
    api.log('Hello NestPress plugin initialized!');
  },

  /**
   * Called when plugin is activated
   */
  onActivate: async () => {
    console.log('🎉 Hello NestPress activated!');
  },

  /**
   * Called when plugin is deactivated
   */
  onDeactivate: async () => {
    console.log('👋 Hello NestPress deactivated!');
  },

  /**
   * Main setup - called when plugin is active
   */
  setup: async (api: any) => {
    // Register a frontend widget (WordPress register_widget)
    api.registerWidget('hello-widget', {
      title: 'Hello Widget',
      description: 'A friendly greeting widget from Hello NestPress',
      location: 'sidebar', // Can be: sidebar, footer, header, before-content, after-content
      priority: 10,
      props: {
        greeting: 'Welcome!',
        icon: '👋',
      },
      render: (props: any) => {
        return `
          <div class="hello-widget" style="padding: 1rem; background: #f0f9ff; border-radius: 0.5rem; margin-bottom: 1rem;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.125rem; font-weight: 600;">
              ${props.icon} ${props.greeting}
            </h3>
            <p style="margin: 0; color: #64748b;">
              This widget was added by the Hello NestPress plugin! 
              It demonstrates the WordPress-like widget system.
            </p>
          </div>
        `;
      },
    });

    api.log('Hello NestPress setup complete with widget registration!');
  },

  /**
   * Register hooks
   */
  registerHooks: (api: any) => {
    // ========================================
    // FEATURE 1: Content Filters
    // ========================================
    
    // Filter post content (WordPress the_content filter)
    api.addFilter('post:content_filter', async (content: string, context: any) => {
      // Add a friendly message at the end of posts
      const signature = `<div class="hello-nestpress-signature" style="margin-top: 2rem; padding: 1rem; background: #f0f9ff; border-left: 4px solid #3b82f6; font-style: italic;">
        👋 This post was enhanced by Hello NestPress plugin!
      </div>`;
      return content + signature;
    }, 100);

    // Filter post title (WordPress the_title filter)
    api.addFilter('post:title_filter', async (title: string, context: any) => {
      // Add emoji to titles
      return `✨ ${title}`;
    }, 10);

    // Filter post excerpt (WordPress the_excerpt filter)
    api.addFilter('post:excerpt_filter', async (excerpt: string, context: any) => {
      return excerpt + ' [Read more with Hello NestPress!]';
    }, 10);

    // ========================================
    // FEATURE 2: Asset Enqueueing
    // ========================================
    
    // Enqueue custom stylesheet (WordPress wp_enqueue_style)
    api.enqueueStyle(
      'hello-nestpress-style',
      'https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.10/src/styles.css',
      [],
      '1.0.0',
      'all'
    );

    // Enqueue custom script (WordPress wp_enqueue_script)
    api.enqueueScript(
      'hello-nestpress-script',
      'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js',
      [],
      '1.0.0',
      true // in footer
    );

    // ========================================
    // FEATURE 3: Admin Dashboard Widgets
    // ========================================
    
    api.addFilter('admin_dashboard_widgets', (widgets: any[]) => {
      return [
        ...widgets,
        {
          id: 'hello-nestpress',
          title: 'Hello NestPress',
          content: getRandomQuote(),
          position: 'side',
        },
      ];
    }, 10);

    // ========================================
    // FEATURE 4: Template Hooks / Actions
    // ========================================
    
    // Action on post publish
    api.addAction('post:after_publish', async (post: any) => {
      api.log(`🎉 Post published: ${post.title}`);
    }, 10);

    // Action on post create
    api.addAction('post:after_create', async (post: any) => {
      api.log(`📝 New post created: ${post.title}`);
    }, 10);
  },

  /**
   * Register admin menu items
   */
  registerAdminMenu: (api: any) => {
    api.addMenuPage({
      pageTitle: 'Hello NestPress',
      menuTitle: 'Hello',
      capability: 'manage_options',
      menuSlug: 'hello-nestpress',
      icon: '👋',
      position: 100,
    });

    // Register a menu item panel for the nav menu editor
    // This demonstrates how plugins can add custom item sources
    api.registerMenuItemPanel({
      id: 'hello-links',
      title: 'Hello Links',
      description: 'Quick links added by Hello NestPress plugin',
      items: [
        {
          id: 'hello-1',
          label: 'Plugin Homepage',
          url: 'https://nestpress.dev/plugins/hello-nestpress',
          description: 'Visit the plugin homepage',
        },
        {
          id: 'hello-2',
          label: 'Documentation',
          url: 'https://nestpress.dev/docs',
          description: 'Read the documentation',
        },
        {
          id: 'hello-3',
          label: 'Support Forum',
          url: 'https://nestpress.dev/support',
          description: 'Get help and support',
        },
      ],
      searchable: false,
    });
  },
};

export default HelloNestPress;
