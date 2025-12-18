export enum PostStatus {
  PUBLISHED = 'Published',
  DRAFT = 'Draft',
  TRASH = 'Trash',
}

export interface Post {
  id: string;
  title: string;
  slug?: string; // URL-friendly slug (e.g., 'my-first-post')
  content: string;
  author: string;
  status: PostStatus;
  categories: string[];
  tags: string[];
  date: string; // ISO string
  excerpt: string;
  type: 'post' | 'page';
  templateId?: string; // Optional template override
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  sku: string;
  status: 'Active' | 'Draft' | 'Archived' | 'active' | 'draft' | 'archived';
  images: string[];
  vendor: string;
  category: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  total: number;
  status: 'Paid' | 'Pending' | 'Refunded';
  fulfillment: 'Fulfilled' | 'Unfulfilled' | 'Partial';
  date: string;
  itemsCount: number;
}

export interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  postTitle: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Spam';
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  active: boolean;
}

export interface PluginMenuItem {
  id: string;
  pluginSlug: string;
  pageTitle: string;
  menuTitle: string;
  capability: string;
  menuSlug: string;
  icon?: string;
  position?: number;
  component?: any;
}

export interface PluginSubMenuItem {
  id: string;
  pluginSlug: string;
  parentSlug: string;
  pageTitle: string;
  menuTitle: string;
  capability: string;
  menuSlug: string;
  position?: number;
  component?: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Administrator' | 'Editor' | 'Author' | 'Subscriber';
  posts: number;
}

// Theme/Template System
export interface Theme {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  thumbnail: string;
  features: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: 'boxed' | 'full-width';
}

// ============================================
// Template System (WordPress-like)
// ============================================

export type TemplateType = 
  | 'page'
  | 'post'
  | 'archive'
  | 'category'
  | 'tag'
  | 'author'
  | 'search'
  | 'home'
  | 'front-page'
  | '404'
  | 'header'
  | 'footer'
  | 'sidebar'
  | 'custom';

export type TemplateStatus = 'active' | 'draft' | 'inactive';

export interface TemplateSettings {
  layout: 'full-width' | 'boxed' | 'sidebar-left' | 'sidebar-right' | 'no-sidebar';
  containerWidth?: string;
  showHeader: boolean;
  showFooter: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  showSidebar: boolean;
  sidebarTemplate?: string;
  sidebarPosition?: 'left' | 'right';
  showTitle: boolean;
  titlePosition?: 'above' | 'in-content' | 'hidden';
  showFeaturedImage: boolean;
  featuredImagePosition?: 'above-title' | 'below-title' | 'background' | 'hidden';
  showMeta: boolean;
  showAuthor: boolean;
  showDate: boolean;
  showCategories: boolean;
  showTags: boolean;
  showComments: boolean;
  customCss?: string;
  bodyClass?: string;
  containerClass?: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: TemplateType;
  status: TemplateStatus;
  content: string;
  settings: TemplateSettings;
  parent?: string;
  isDefault: boolean;
  assignedPages?: string[];
  assignedPosts?: string[];
  thumbnail?: string;
  version: string;
  author: string;
  themeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatePart {
  id: string;
  name: string;
  slug: string;
  area: 'header' | 'footer' | 'sidebar' | 'general';
  content: string;
  isDefault: boolean;
  themeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateAssignment {
  id: string;
  templateId: string;
  contentType: 'page' | 'post' | 'product' | 'category' | 'tag';
  contentId?: string;
  priority: number;
  createdAt: string;
}

export interface SiteSettings {
  // General Settings
  siteName: string;
  tagline: string;
  siteUrl: string;
  adminEmail?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  weekStartsOn?: number;
  language?: string;
  logo?: string;
  favicon?: string;
  
  // Writing Settings
  defaultPostCategory?: string;
  defaultPostFormat?: string;
  
  // Reading Settings
  homepageType?: 'posts' | 'page';
  homepageId?: string;
  postsPageId?: string;
  postsPerPage?: number;
  feedItemsCount?: number;
  feedShowSummary?: boolean;
  discourageCrawlers?: boolean;
  
  // Discussion Settings
  commentsEnabled?: boolean;
  commentRegistration?: boolean;
  commentModeration?: boolean;
  commentWhitelist?: boolean;
  commentMaxLinks?: number;
  commentThreading?: boolean;
  commentThreadDepth?: number;
  commentPagination?: boolean;
  commentsPerPage?: number;
  commentsSortOrder?: 'asc' | 'desc';
  emailOnComment?: boolean;
  emailOnModeration?: boolean;
  avatarsEnabled?: boolean;
  avatarRating?: string;
  defaultAvatar?: string;
  
  // Media Settings
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  mediumWidth?: number;
  mediumHeight?: number;
  largeWidth?: number;
  largeHeight?: number;
  embedAutoWidth?: boolean;
  embedMaxWidth?: number;
  mediaFolderByDate?: boolean;
  
  // Permalinks
  permalinkStructure?: string;
  categoryBase?: string;
  tagBase?: string;
  
  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
    twitterHandle?: string;
    googleAnalyticsId?: string;
    structuredData: boolean;
  };
  
  // Social
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  
  // Footer
  footer: {
    copyright: string;
    showPoweredBy: boolean;
  };
  
  // Privacy
  privacyPolicyPage?: string;
  showPrivacyPolicy?: boolean;
  allowCommentCookies?: boolean;
  
  // System (read-only)
  version?: string;
  phpVersion?: string;
  databaseVersion?: string;
}

// ============================================
// Configuration Wizard System (Building Block)
// ============================================

// Service Provider Types - Extensible registry pattern
export type DatabaseProvider = 'firebase' | 'mongodb' | 'dynamodb' | 'supabase' | 'planetscale' | 'none';
export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'cohere' | 'none';
export type PaymentProvider = 'stripe' | 'paypal' | 'square' | 'none';
export type StorageProvider = 'firebase-storage' | 's3' | 'cloudinary' | 'local' | 'none';
export type AuthProvider = 'firebase-auth' | 'auth0' | 'clerk' | 'supabase-auth' | 'none';
export type EmailProvider = 'sendgrid' | 'mailgun' | 'ses' | 'resend' | 'none';

// Base service configuration interface - all providers extend this
export interface ServiceConfigBase {
  provider: string;
  enabled: boolean;
  configured: boolean;
  lastUpdated?: string;
}

// Database Configurations
export interface FirebaseConfig extends ServiceConfigBase {
  provider: 'firebase';
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

export interface MongoDBConfig extends ServiceConfigBase {
  provider: 'mongodb';
  connectionString?: string;
  databaseName?: string;
  useAtlas?: boolean;
}

export interface DynamoDBConfig extends ServiceConfigBase {
  provider: 'dynamodb';
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  tableName?: string;
}

export interface SupabaseConfig extends ServiceConfigBase {
  provider: 'supabase';
  url?: string;
  anonKey?: string;
  serviceRoleKey?: string;
}

export type DatabaseConfig = FirebaseConfig | MongoDBConfig | DynamoDBConfig | SupabaseConfig | ServiceConfigBase;

// AI Provider Configurations
export interface GeminiConfig extends ServiceConfigBase {
  provider: 'gemini';
  apiKey?: string;
  model?: string;
}

export interface OpenAIConfig extends ServiceConfigBase {
  provider: 'openai';
  apiKey?: string;
  organizationId?: string;
  model?: string;
}

export interface AnthropicConfig extends ServiceConfigBase {
  provider: 'anthropic';
  apiKey?: string;
  model?: string;
}

export type AIConfig = GeminiConfig | OpenAIConfig | AnthropicConfig | ServiceConfigBase;

// Payment Provider Configurations
export interface StripeConfig extends ServiceConfigBase {
  provider: 'stripe';
  publishableKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  testMode?: boolean;
}

export interface PayPalConfig extends ServiceConfigBase {
  provider: 'paypal';
  clientId?: string;
  clientSecret?: string;
  sandbox?: boolean;
}

export interface SquareConfig extends ServiceConfigBase {
  provider: 'square';
  applicationId?: string;
  accessToken?: string;
  locationId?: string;
  sandbox?: boolean;
}

export type PaymentConfig = StripeConfig | PayPalConfig | SquareConfig | ServiceConfigBase;

// Storage Configuration
export interface S3Config extends ServiceConfigBase {
  provider: 's3';
  bucketName?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface CloudinaryConfig extends ServiceConfigBase {
  provider: 'cloudinary';
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
}

export type StorageConfig = S3Config | CloudinaryConfig | ServiceConfigBase;

// Master Configuration Object
export interface SystemConfig {
  initialized: boolean;
  setupCompletedAt?: string;
  database: DatabaseConfig;
  ai: AIConfig;
  payment: PaymentConfig;
  storage: StorageConfig;
  // Extensible - add more service categories here
}

// Wizard Step Definition - Building block for wizard UI
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  completed: boolean;
  category: 'database' | 'ai' | 'payment' | 'storage' | 'auth' | 'email' | 'custom';
}

// Wizard State
export interface WizardState {
  currentStep: number;
  steps: WizardStep[];
  isComplete: boolean;
  skippedSteps: string[];
}

// App Mode - determines which UI to show
export type AppMode = 'setup' | 'admin' | 'website';

export enum ViewState {
  DASHBOARD = 'dashboard',
  
  // Content (CMS)
  POSTS_LIST = 'posts_list',
  POST_EDIT = 'post_edit',
  PAGES_LIST = 'pages_list',
  PAGE_EDIT = 'page_edit',
  MEDIA = 'media',
  COMMENTS = 'comments',
  
  // Commerce (Shopify)
  ORDERS = 'orders',
  PRODUCTS = 'products',
  PRODUCT_EDIT = 'product_edit',
  CUSTOMERS = 'customers',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  
  // Configuration
  APPEARANCE = 'appearance',
  APPEARANCE_MENUS = 'appearance_menus',
  APPEARANCE_WIDGETS = 'appearance_widgets',
  APPEARANCE_HEADER = 'appearance_header',
  THEME_PREVIEW = 'theme_preview',
  PLUGINS = 'plugins',
  PLUGIN_EDITOR = 'plugin_editor',
  USERS = 'users',
  TOOLS = 'tools',
  SETTINGS = 'settings',
}

export interface CMSContextType {
  posts: Post[];
  pages: Post[];
  comments: Comment[];
  plugins: Plugin[];
  pluginMenuItems: PluginMenuItem[];
  users: User[];
  products: Product[];
  orders: Order[];
  themes: Theme[];
  activeThemeId: string;
  siteSettings: SiteSettings;
  menus: Menu[];
  
  addPost: (post: Post) => void;
  updatePost: (idOrPost: string | Post, updates?: Partial<Post>) => void;
  deletePost: (id: string) => void;
  
  addProduct: (product: Product) => void;
  updateProduct: (idOrProduct: string | Product, updates?: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;

  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  setActiveTheme: (themeId: string) => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;

  // Menu management
  addMenu: (menu: Menu) => void;
  updateMenu: (menu: Menu) => void;
  deleteMenu: (id: string) => void;
  getMenuByLocation: (location: string) => Menu | undefined;
  
  // Plugin menu management
  refreshPluginMenuItems: () => Promise<void>;

  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  editingPostId: string | null;
  setEditingPostId: (id: string | null) => void;
  editingProductId: string | null;
  setEditingProductId: (id: string | null) => void;
  previewThemeId: string | null;
  setPreviewThemeId: (id: string | null) => void;
  currentUser: User;
}

// Appearance Types (WordPress-like)
export interface MenuItem {
  id: string;
  label: string;
  url: string;
  target: '_self' | '_blank';
  cssClass?: string;
  parentId?: string;
  order: number;
  icon?: string;
  title?: string; // Title attribute (tooltip)
  xfn?: string; // Link relationship (XFN)
  description?: string; // Item description
  pluginSlug?: string; // Plugin that created this item
  customFields?: Record<string, any>; // Plugin-specific custom fields
}

export interface Menu {
  id: string;
  name: string;
  slug: string;
  location: 'primary' | 'footer' | 'mobile' | 'custom';
  items: MenuItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Widget {
  id: string;
  type: 'text' | 'html' | 'menu' | 'search' | 'categories' | 'recent-posts' | 'custom';
  title: string;
  content: string;
  area: 'sidebar' | 'footer' | 'header' | 'custom';
  position: number;
  isActive: boolean;
  settings: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface HeaderSettings {
  logo?: string;
  logoText?: string;
  tagline?: string;
  showTagline?: boolean;
  backgroundColor?: string;
  textColor?: string;
  height?: number;
  sticky?: boolean;
  transparent?: boolean;
  customCss?: string;
  customHtml?: string;
}