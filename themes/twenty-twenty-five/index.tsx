/**
 * Twenty Twenty-Five
 * Converted from WordPress theme
 * 
 * NOTE: Templates and parts are .html files (WordPress block markup)
 * They are loaded and parsed at runtime by wordpress-block-renderer.tsx
 * This file only exports theme metadata and functions
 */

import React from 'react';
import { themeSetup, blockStyles, patternCategories } from './functions';

export interface ThemeTemplateProps {
  data?: any;
  posts?: any[];
  post?: any;
  currentPage?: number;
  totalPages?: number;
  primaryMenu?: any;
  footerMenu?: any;
  widgets?: any[];
  header?: any;
}

// Theme Functions (WordPress functions.php equivalent)
export { themeSetup, blockStyles, patternCategories, enqueueAssets } from './functions';

// Theme metadata with WordPress features
export const theme = {
  name: 'Twenty Twenty-Five',
  version: '1.4',
  author: 'the WordPress team',
  // WordPress theme features (from functions.php)
  supports: {
    postFormats: ['aside', 'audio', 'chat', 'gallery', 'image', 'link', 'quote', 'status', 'video'],
    editorStyle: true,
    blockStyles: true,
  },
};
