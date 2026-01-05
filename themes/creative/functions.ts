/**
 * Theme Functions (WordPress functions.php equivalent)
 */

const formatToString = (format: string): string => {
  const formats: Record<string, string> = {
    aside: 'Aside', audio: 'Audio', chat: 'Chat', gallery: 'Gallery',
    image: 'Image', link: 'Link', quote: 'Quote', status: 'Status', video: 'Video',
  };
  return formats[format] || format;
};

export const themeSetup = () => ({
  postFormats: ['aside', 'audio', 'chat', 'gallery', 'image', 'link', 'quote', 'status', 'video'],
  editorStylesheet: 'assets/css/editor-style.css',
  postThumbnails: true,
  html5: ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption'],
  alignWide: true,
  editorStyles: true,
});

export const blockStyles: Record<string, Array<{ name: string; label: string }>> = {
  'core/button': [{ name: 'default', label: 'Default' }, { name: 'outline', label: 'Outline' }],
  'core/quote': [{ name: 'default', label: 'Default' }, { name: 'large', label: 'Large' }],
};

export const patternCategories = [
  { name: 'hero', label: 'Hero' },
  { name: 'featured', label: 'Featured' },
];

export const enqueueAssets = () => ({
  styles: [
    { handle: 'creative-style', src: 'style.css', dependencies: [], version: '1.0.0' },
    { handle: 'creative-global-styles', src: 'assets/css/global-styles.css', dependencies: [], version: '1.0.0' },
  ],
  scripts: [],
});

export const blockBindings = {
  'creative/format': {
    label: 'Post format name',
    getValueCallback: (post: any) => {
      const format = post?.format || 'standard';
      return format !== 'standard' ? formatToString(format) : '';
    },
  },
};
