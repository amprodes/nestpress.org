/**
 * Theme Functions (TypeScript)
 * WordPress functions.php equivalent
 * Auto-generated from Twenty Twenty-Five
 * 
 * NOTE: This is pure TypeScript (.ts), not React (.tsx)
 * WordPress functions.php contains utility functions, not components
 */

// Helper: Convert post format to display string
const formatToString = (format: string): string => {
  const formats: Record<string, string> = {
    aside: 'Aside',
    audio: 'Audio',
    chat: 'Chat',
    gallery: 'Gallery',
    image: 'Image',
    link: 'Link',
    quote: 'Quote',
    status: 'Status',
    video: 'Video',
  };
  return formats[format] || format;
};

/**
 * Theme Setup (WordPress after_setup_theme hook equivalent)
 * Defines theme supports and features
 */
export const themeSetup = () => {
  return {
    // Post formats support (WordPress add_theme_support('post-formats'))
    postFormats: ['aside', 'audio', 'chat', 'gallery', 'image', 'link', 'quote', 'status', 'video'],
    
    // Editor stylesheet (WordPress add_editor_style())
    editorStyle: 'assets/css/editor-style.css',
    
    // Theme supports (WordPress add_theme_support())
    supports: {
      alignWide: true,
      responsiveEmbeds: true,
      postThumbnails: true,
      customLogo: true,
      titleTag: true,
      html5: ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption'],
    },
  };
};

/**
 * Custom Block Styles (WordPress register_block_style() equivalent)
 * Defines custom styles for core blocks
 */
export const blockStyles: Record<string, Array<{ name: string; label: string; inlineStyle?: string }>> = {
  'core/list': [
    {
      name: 'checkmark-list',
      label: 'Checkmark',
      inlineStyle: `
        ul.is-style-checkmark-list {
          list-style-type: "✓";
        }
        ul.is-style-checkmark-list li {
          padding-inline-start: 1ch;
        }
      `,
    },
  ],
};

/**
 * Pattern Categories (WordPress register_block_pattern_category() equivalent)
 * Organizes block patterns into categories
 */
export const patternCategories = [
  {
    name: 'banner',
    label: 'Banner',
  },
  {
    name: 'about',
    label: 'About',
  },
  {
    name: 'featured',
    label: 'Featured',
  },
  {
    name: 'media',
    label: 'Media',
  },
  {
    name: 'twentytwentyfive_post-format',
    label: 'Twentytwentyfive Post-format',
  },
  {
    name: 'text',
    label: 'Text',
  },
  {
    name: 'contact',
    label: 'Contact',
  },
  {
    name: 'call-to-action',
    label: 'Call-to-action',
  },
  {
    name: 'footer',
    label: 'Footer',
  },
  {
    name: 'header',
    label: 'Header',
  },
  {
    name: 'gallery',
    label: 'Gallery',
  },
  {
    name: 'query',
    label: 'Query',
  },
  {
    name: 'twentytwentyfive_page',
    label: 'Twentytwentyfive Page',
  },
  {
    name: 'posts',
    label: 'Posts',
  },
  {
    name: 'services',
    label: 'Services',
  },
  {
    name: 'testimonials',
    label: 'Testimonials',
  },
];

/**
 * Enqueue Scripts and Styles (WordPress wp_enqueue_scripts hook equivalent)
 * Defines theme assets to load
 */
export const enqueueAssets = () => {
  return {
    styles: [
      {
        handle: 'twenty-twenty-five-style',
        src: 'style.css',
        dependencies: [],
        version: '1.4',
      },
      {
        handle: 'twenty-twenty-five-global-styles',
        src: 'assets/css/global-styles.css',
        dependencies: [],
        version: '1.4',
      },
      {
        handle: 'twenty-twenty-five-accessibility',
        src: 'assets/css/accessibility.css',
        dependencies: [],
        version: '1.4',
      },
    ],
    scripts: [],
  };
};

/**
 * Block Bindings (WordPress register_block_bindings_source() equivalent)
 * Provides dynamic content sources for blocks
 */
export const blockBindings = {
  'twentytwenty-five/format': {
    label: 'Post format name',
    getValueCallback: (post: any) => {
      const format = post?.format || 'standard';
      if (format && format !== 'standard') {
        return formatToString(format);
      }
      return '';
    },
  },
};

/**
 * Apply Custom Block Styles (WordPress wp_head hook equivalent)
 * Auto-injects custom block styles into the document
 */
export const applyBlockStyles = () => {
  if (typeof document === 'undefined') return;
  
  const styleId = 'twenty-twenty-five-block-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  
  let css = '';
  Object.entries(blockStyles).forEach(([blockType, styles]) => {
    styles.forEach((styleConfig) => {
      if (styleConfig.inlineStyle) {
        css += styleConfig.inlineStyle + '\n';
      }
    });
  });
  
  style.textContent = css;
  document.head.appendChild(style);
};

// Auto-apply block styles on client-side load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBlockStyles);
  } else {
    applyBlockStyles();
  }
}
