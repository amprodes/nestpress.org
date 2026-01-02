/**
 * NestPress Default Theme
 * Main entry point - exports all templates, parts, and patterns
 * WordPress-compatible structure with reusable components
 */

import React from 'react';
import { Post, Menu, MenuItem, Widget, HeaderSettings } from '../../types';

// Export Parts (Reusable Components)
export { Header } from './parts/Header';
export { Footer } from './parts/Footer';
export { Sidebar } from './parts/Sidebar';
export { PostMeta } from './parts/PostMeta';

// Export Patterns (Pre-built Layouts)
export { HeroBanner } from './patterns/HeroBanner';
export { PostsGrid } from './patterns/PostsGrid';
export { FeatureGrid } from './patterns/FeatureGrid';
export { CTA } from './patterns/CTA';

// Export Types
export type { HeaderProps } from './parts/Header';
export type { FooterProps } from './parts/Footer';
export type { SidebarProps } from './parts/Sidebar';
export type { PostMetaProps } from './parts/PostMeta';

/**
 * Helper function to get post permalink (slug or ID)
 * WordPress equivalent: get_permalink()
 */
export function getPostPermalink(post: Post): string {
  return `/blog/${post.slug || post.id}`;
}

export interface ThemeTemplateProps {
  data?: any;
  posts?: Post[];
  post?: Post;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // Appearance data
  menus?: Menu[];
  widgets?: Widget[];
  header?: HeaderSettings;
  primaryMenu?: Menu;
  footerMenu?: Menu;
  sidebarWidgets?: Widget[];
  footerWidgets?: Widget[];
  headerWidgets?: Widget[];
}

// Re-export parts as backward-compatible components
import { Header } from './parts/Header';
import { Footer } from './parts/Footer';

/**
 * SiteNav - Backward compatible wrapper for Header part
 * @deprecated Use <Header /> from parts/Header.tsx instead
 */
export const SiteNav: React.FC<{ primaryMenu?: Menu; header?: HeaderSettings }> = (props) => {
  return <Header {...props} />;
};

/**
 * SiteFooter - Backward compatible wrapper for Footer part
 * @deprecated Use <Footer /> from parts/Footer.tsx instead
 */
export const SiteFooter: React.FC<{ 
  footerMenu?: Menu; 
  footerWidgets?: Widget[];
  header?: HeaderSettings;
}> = (props) => {
  return <Footer {...props} />;
};

// Export all template components
export { default as IndexTemplate } from './templates/index';
export { default as SingleTemplate } from './templates/single';
export { default as PageTemplate } from './templates/page';
export { default as PageWithSidebarTemplate } from './templates/page-with-sidebar';
export { default as ArchiveTemplate } from './templates/archive';
export { default as CategoryTemplate } from './templates/category';
export { default as SearchTemplate } from './templates/search';
export { default as NotFoundTemplate } from './templates/404';
export { default as ShopTemplate } from './templates/shop';
export { default as CartTemplate } from './templates/cart';

// Theme metadata
export const theme = {
  name: 'NestPress Default',
  version: '1.0.0',
  author: 'NestPress Team'
};
