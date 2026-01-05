/**
 * Theme Functions (WordPress functions.php equivalent)
 * NestPress Default Theme
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
    editorStylesheet: 'assets/css/editor-style.css',
    
    // Featured images (WordPress add_theme_support('post-thumbnails'))
    postThumbnails: true,
    thumbnailSizes: [
      { name: 'thumbnail', width: 150, height: 150, crop: true },
      { name: 'medium', width: 300, height: 300, crop: false },
      { name: 'large', width: 1024, height: 1024, crop: false },
      { name: 'full', width: 0, height: 0, crop: false },
    ],
    
    // HTML5 support (WordPress add_theme_support('html5'))
    html5: ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'script', 'style'],
    
    // Custom logo (WordPress add_theme_support('custom-logo'))
    customLogo: {
      height: 100,
      width: 400,
      flexWidth: true,
      flexHeight: true,
    },
    
    // Block editor features
    alignWide: true,
    editorStyles: true,
    responsiveEmbeds: true,
  };
};

/**
 * Block Styles (WordPress register_block_style() equivalent)
 * Provides custom styling variations for blocks
 */
export const blockStyles: Record<string, Array<{ name: string; label: string; inlineStyle?: string }>> = {
  'core/button': [
    { name: 'default', label: 'Default' },
    { name: 'outline', label: 'Outline', inlineStyle: '.is-style-outline { border: 2px solid currentColor; background: transparent; }' },
    { name: 'squared', label: 'Squared', inlineStyle: '.is-style-squared { border-radius: 0; }' },
  ],
  'core/quote': [
    { name: 'default', label: 'Default' },
    { name: 'large', label: 'Large' },
  ],
  'core/image': [
    { name: 'default', label: 'Default' },
    { name: 'rounded', label: 'Rounded', inlineStyle: '.is-style-rounded img { border-radius: 9999px; }' },
  ],
};

/**
 * Pattern Categories (WordPress register_block_pattern_category() equivalent)
 */
export const patternCategories = [
  { name: 'hero', label: 'Hero' },
  { name: 'featured', label: 'Featured' },
  { name: 'call-to-action', label: 'Call to Action' },
  { name: 'testimonials', label: 'Testimonials' },
];

/**
 * Enqueue Assets (WordPress wp_enqueue_style/script equivalent)
 * Returns styles and scripts to load for the theme
 */
export const enqueueAssets = () => {
  return {
    styles: [
      {
        handle: 'default-style',
        src: 'style.css',
        dependencies: [],
        version: '1.0.0',
      },
      {
        handle: 'default-global-styles',
        src: 'assets/css/global-styles.css',
        dependencies: [],
        version: '1.0.0',
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
  'default/format': {
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
  
  const styleId = 'default-block-styles';
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
