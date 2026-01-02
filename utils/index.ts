/**
 * Utils Index
 * Re-export all utility functions for cleaner imports
 */

export * from './constants';
export * from './security';
export * from './validation';

// Re-export WordPress compatibility helpers from security.ts
// These will eventually be moved to wp.ts
export {
  getPostTitle,
  getPostSlug,
  getPostContent,
  getPostExcerpt,
  getPostDate,
  getPostType,
  getPostCategories,
  getPostTags,
  getPostAuthor,
  getPostStatusRaw,
  getPostStatusLabel,
  getPostId,
  hasWPFields
} from './security';
