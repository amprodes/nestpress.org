/**
 * Theme Entry Point
 * Exports all theme components for use by NestPress
 */

// Template Parts (re-export named exports)
export { Header } from './parts/Header';
export { Footer } from './parts/Footer';
export { Sidebar } from './parts/Sidebar';
export { PostMeta } from './parts/PostMeta';

// Templates (re-export with proper names expected by theme loader)
export { default as IndexTemplate } from './templates/index';
export { default as SingleTemplate } from './templates/single';
export { default as PageTemplate } from './templates/page';
export { default as PageWithSidebarTemplate } from './templates/page-with-sidebar';
export { default as ArchiveTemplate } from './templates/archive';
export { default as CategoryTemplate } from './templates/category';
export { default as SearchTemplate } from './templates/search';
export { default as NotFoundTemplate } from './templates/404';
