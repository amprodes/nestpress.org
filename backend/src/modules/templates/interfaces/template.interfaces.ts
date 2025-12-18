/**
 * NestPress Template System - Interfaces
 * WordPress-like template hierarchy with TypeScript safety
 */

// ============================================
// Template Types (WordPress-like hierarchy)
// ============================================

export type TemplateType = 
  | 'page'           // Single page template
  | 'post'           // Single post template  
  | 'archive'        // Archive/listing template
  | 'category'       // Category archive
  | 'tag'            // Tag archive
  | 'author'         // Author archive
  | 'search'         // Search results
  | 'home'           // Homepage/blog index
  | 'front-page'     // Static front page
  | '404'            // Not found
  | 'header'         // Header partial
  | 'footer'         // Footer partial
  | 'sidebar'        // Sidebar partial
  | 'custom';        // Custom template

export type TemplateStatus = 'active' | 'draft' | 'inactive';

// ============================================
// Template Slot/Region System
// ============================================

export interface TemplateSlot {
  id: string;
  name: string;
  description?: string;
  type: 'content' | 'widget' | 'menu' | 'custom';
  allowedBlocks?: string[];  // Block types allowed in this slot
  defaultContent?: string;
}

// ============================================
// Template Block System (Gutenberg-like)
// ============================================

export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'image'
  | 'gallery'
  | 'list'
  | 'quote'
  | 'code'
  | 'html'
  | 'columns'
  | 'group'
  | 'cover'
  | 'button'
  | 'spacer'
  | 'separator'
  | 'post-title'
  | 'post-content'
  | 'post-excerpt'
  | 'post-featured-image'
  | 'post-meta'
  | 'post-author'
  | 'post-date'
  | 'post-categories'
  | 'post-tags'
  | 'post-navigation'
  | 'comments'
  | 'query-loop'
  | 'site-title'
  | 'site-tagline'
  | 'site-logo'
  | 'navigation'
  | 'search'
  | 'social-links'
  | 'widget-area'
  | 'template-part'
  | 'custom';

export interface TemplateBlock {
  id: string;
  type: BlockType;
  attributes: Record<string, any>;
  innerBlocks?: TemplateBlock[];
  order: number;
}

// ============================================
// Template Definition
// ============================================

export interface Template {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: TemplateType;
  status: TemplateStatus;
  
  // Template content
  content: string;           // Raw HTML/template content
  blocks?: TemplateBlock[];  // Block-based content (optional)
  
  // Template settings
  settings: TemplateSettings;
  
  // Template hierarchy
  parent?: string;           // Parent template ID for inheritance
  isDefault: boolean;        // Is this the default for its type
  
  // Associated content
  assignedPages?: string[];  // Page IDs using this template
  assignedPosts?: string[];  // Post IDs using this template
  
  // Metadata
  thumbnail?: string;
  version: string;
  author: string;
  themeId?: string;          // Associated theme
  
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSettings {
  // Layout
  layout: 'full-width' | 'boxed' | 'sidebar-left' | 'sidebar-right' | 'no-sidebar';
  containerWidth?: string;
  
  // Header/Footer
  showHeader: boolean;
  showFooter: boolean;
  headerTemplate?: string;   // Custom header template ID
  footerTemplate?: string;   // Custom footer template ID
  
  // Sidebar
  showSidebar: boolean;
  sidebarTemplate?: string;  // Custom sidebar template ID
  sidebarPosition?: 'left' | 'right';
  
  // Title
  showTitle: boolean;
  titlePosition?: 'above' | 'in-content' | 'hidden';
  
  // Featured Image
  showFeaturedImage: boolean;
  featuredImagePosition?: 'above-title' | 'below-title' | 'background' | 'hidden';
  
  // Meta
  showMeta: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showCategories: boolean;
  showTags: boolean;
  
  // Comments
  showComments: boolean;
  
  // Custom CSS
  customCss?: string;
  
  // Custom Classes
  bodyClass?: string;
  containerClass?: string;
}

// ============================================
// Template Part (Reusable Template Pieces)
// ============================================

export interface TemplatePart {
  id: string;
  name: string;
  slug: string;
  area: 'header' | 'footer' | 'sidebar' | 'general';
  content: string;
  blocks?: TemplateBlock[];
  isDefault: boolean;
  themeId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Template Assignment
// ============================================

export interface TemplateAssignment {
  id: string;
  templateId: string;
  contentType: 'page' | 'post' | 'product' | 'category' | 'tag';
  contentId?: string;        // Specific content ID or null for type-wide
  priority: number;          // Higher priority wins
  conditions?: TemplateCondition[];
  createdAt: string;
}

export interface TemplateCondition {
  type: 'category' | 'tag' | 'author' | 'date' | 'custom';
  operator: 'is' | 'is_not' | 'contains' | 'starts_with';
  value: string;
}

// ============================================
// DTOs
// ============================================

export interface CreateTemplateDto {
  name: string;
  slug?: string;
  description?: string;
  type: TemplateType;
  content: string;
  blocks?: TemplateBlock[];
  settings?: Partial<TemplateSettings>;
  parent?: string;
  isDefault?: boolean;
  themeId?: string;
}

export interface UpdateTemplateDto {
  name?: string;
  slug?: string;
  description?: string;
  status?: TemplateStatus;
  content?: string;
  blocks?: TemplateBlock[];
  settings?: Partial<TemplateSettings>;
  parent?: string;
  isDefault?: boolean;
  thumbnail?: string;
}

export interface AssignTemplateDto {
  templateId: string;
  contentType: 'page' | 'post' | 'product';
  contentIds: string[];
}

// ============================================
// Template Rendering Context
// ============================================

export interface TemplateRenderContext {
  template: Template;
  content?: any;             // Post, page, or product data
  site: {
    name: string;
    tagline: string;
    url: string;
    logo?: string;
  };
  theme: {
    colors: Record<string, string>;
    fonts: Record<string, string>;
  };
  user?: any;
  query?: {
    posts?: any[];
    pagination?: {
      page: number;
      totalPages: number;
      total: number;
    };
  };
  widgets?: Record<string, any[]>;
  menus?: Record<string, any[]>;
}

// ============================================
// Default Template Settings
// ============================================

export const DEFAULT_TEMPLATE_SETTINGS: TemplateSettings = {
  layout: 'no-sidebar',
  showHeader: true,
  showFooter: true,
  showSidebar: false,
  showTitle: true,
  titlePosition: 'in-content',
  showFeaturedImage: true,
  featuredImagePosition: 'above-title',
  showMeta: true,
  showAuthor: true,
  showDate: true,
  showCategories: true,
  showTags: true,
  showComments: true,
};
