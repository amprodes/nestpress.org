/**
 * NestPress Hook System - Interfaces
 * WordPress-like hooks with TypeScript safety and AI integration
 */

// ============================================
// Core Hook Types
// ============================================

export type HookType = 'action' | 'filter' | 'ai';

export type HookPriority = number; // Lower = earlier execution (default: 10)

export interface HookMetadata {
  name: string;
  type: HookType;
  priority: HookPriority;
  namespace?: string;
  description?: string;
  async: boolean;
  aiConfig?: AIHookConfig;
}

export interface RegisteredHook {
  id: string;
  metadata: HookMetadata;
  handler: HookHandler;
  instance?: any; // Class instance for method handlers
  enabled: boolean;
  executionCount: number;
  lastExecuted?: Date;
  averageExecutionTime?: number;
}

// ============================================
// Hook Handlers
// ============================================

export type ActionHandler<T = any> = (payload: T, context: HookContext) => void | Promise<void>;
export type FilterHandler<T = any, R = T> = (value: T, context: HookContext) => R | Promise<R>;
export type HookHandler = ActionHandler | FilterHandler;

export interface HookContext {
  hookName: string;
  hookType: HookType;
  timestamp: Date;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// ============================================
// Hook Registration Options
// ============================================

export interface ActionOptions {
  priority?: HookPriority;
  namespace?: string;
  description?: string;
  once?: boolean; // Execute only once then auto-remove
  condition?: (context: HookContext) => boolean | Promise<boolean>;
}

export interface FilterOptions extends ActionOptions {
  stopOnNull?: boolean; // Stop filter chain if handler returns null
}

export interface AIHookOptions extends ActionOptions {
  aiTask: AITask;
  model?: string;
  fallbackOnError?: boolean;
  cacheResults?: boolean;
  cacheTTL?: number; // seconds
}

// ============================================
// AI Hook Configuration
// ============================================

export type AITask = 
  | 'content_enhance'
  | 'seo_optimize'
  | 'moderate_content'
  | 'translate'
  | 'summarize'
  | 'categorize'
  | 'image_alt'
  | 'sentiment_analysis'
  | 'keyword_extraction'
  | 'grammar_check'
  | 'readability_improve'
  | 'custom';

export interface AIHookConfig {
  task: AITask;
  model?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  fallbackOnError: boolean;
  cacheResults: boolean;
  cacheTTL: number;
}

// ============================================
// Hook Execution Results
// ============================================

export interface ActionResult {
  hookName: string;
  handlersExecuted: number;
  executionTime: number;
  errors: HookError[];
  context: HookContext;
}

export interface FilterResult<T> {
  hookName: string;
  originalValue: T;
  finalValue: T;
  handlersExecuted: number;
  executionTime: number;
  transformations: TransformationStep<T>[];
  errors: HookError[];
  context: HookContext;
}

export interface TransformationStep<T> {
  handlerId: string;
  namespace?: string;
  priority: number;
  inputValue: T;
  outputValue: T;
  executionTime: number;
  aiProcessed?: boolean;
}

export interface HookError {
  handlerId: string;
  error: Error;
  timestamp: Date;
  recovered: boolean;
}

// ============================================
// Lifecycle Hooks
// ============================================

export enum LifecycleHook {
  // Application Lifecycle
  APP_BOOTSTRAP = 'app:bootstrap',
  APP_INIT = 'app:init',
  APP_READY = 'app:ready',
  APP_SHUTDOWN = 'app:shutdown',
  
  // Database
  DATABASE_CONNECTING = 'database:connecting',
  DATABASE_CONNECTED = 'database:connected',
  DATABASE_DISCONNECTED = 'database:disconnected',
  DATABASE_ERROR = 'database:error',
  
  // Configuration
  CONFIG_LOADING = 'config:loading',
  CONFIG_LOADED = 'config:loaded',
  CONFIG_CHANGED = 'config:changed',
  
  // Plugins
  PLUGINS_LOADING = 'plugins:loading',
  PLUGINS_LOADED = 'plugins:loaded',
  PLUGIN_ACTIVATED = 'plugin:activated',
  PLUGIN_DEACTIVATED = 'plugin:deactivated',
  
  // Themes
  THEMES_LOADING = 'themes:loading',
  THEMES_LOADED = 'themes:loaded',
  THEME_ACTIVATED = 'theme:activated',
  
  // Authentication
  AUTH_INIT = 'auth:init',
  AUTH_LOGIN = 'auth:login',
  AUTH_LOGOUT = 'auth:logout',
  AUTH_REGISTER = 'auth:register',
  AUTH_PASSWORD_RESET = 'auth:password_reset',
  
  // Request Lifecycle
  REQUEST_START = 'request:start',
  REQUEST_AUTH = 'request:auth',
  REQUEST_VALIDATED = 'request:validated',
  REQUEST_END = 'request:end',
  REQUEST_ERROR = 'request:error',
}

// ============================================
// Content Hooks
// ============================================

export enum ContentHook {
  // Posts
  POST_BEFORE_CREATE = 'post:before_create',
  POST_AFTER_CREATE = 'post:after_create',
  POST_BEFORE_UPDATE = 'post:before_update',
  POST_AFTER_UPDATE = 'post:after_update',
  POST_BEFORE_DELETE = 'post:before_delete',
  POST_AFTER_DELETE = 'post:after_delete',
  POST_BEFORE_PUBLISH = 'post:before_publish',
  POST_AFTER_PUBLISH = 'post:after_publish',
  POST_CONTENT_FILTER = 'post:content_filter',
  POST_EXCERPT_FILTER = 'post:excerpt_filter',
  POST_TITLE_FILTER = 'post:title_filter',
  POST_SEO_FILTER = 'post:seo_filter',
  
  // Pages
  PAGE_BEFORE_CREATE = 'page:before_create',
  PAGE_AFTER_CREATE = 'page:after_create',
  PAGE_BEFORE_UPDATE = 'page:before_update',
  PAGE_AFTER_UPDATE = 'page:after_update',
  PAGE_CONTENT_FILTER = 'page:content_filter',
  
  // Products
  PRODUCT_BEFORE_CREATE = 'product:before_create',
  PRODUCT_AFTER_CREATE = 'product:after_create',
  PRODUCT_BEFORE_UPDATE = 'product:before_update',
  PRODUCT_AFTER_UPDATE = 'product:after_update',
  PRODUCT_PRICE_FILTER = 'product:price_filter',
  PRODUCT_DESCRIPTION_FILTER = 'product:description_filter',
  PRODUCT_INVENTORY_CHANGE = 'product:inventory_change',
  
  // Orders
  ORDER_BEFORE_CREATE = 'order:before_create',
  ORDER_AFTER_CREATE = 'order:after_create',
  ORDER_STATUS_CHANGE = 'order:status_change',
  ORDER_PAYMENT_COMPLETE = 'order:payment_complete',
  ORDER_FULFILLED = 'order:fulfilled',
  
  // Comments
  COMMENT_BEFORE_CREATE = 'comment:before_create',
  COMMENT_AFTER_CREATE = 'comment:after_create',
  COMMENT_BEFORE_APPROVE = 'comment:before_approve',
  COMMENT_CONTENT_FILTER = 'comment:content_filter',
  COMMENT_SPAM_CHECK = 'comment:spam_check',
  
  // Media
  MEDIA_BEFORE_UPLOAD = 'media:before_upload',
  MEDIA_AFTER_UPLOAD = 'media:after_upload',
  MEDIA_PROCESS = 'media:process',
  MEDIA_DELETE = 'media:delete',
  
  // Users
  USER_BEFORE_CREATE = 'user:before_create',
  USER_AFTER_CREATE = 'user:after_create',
  USER_BEFORE_UPDATE = 'user:before_update',
  USER_AFTER_UPDATE = 'user:after_update',
  USER_ROLE_CHANGE = 'user:role_change',
}

// ============================================
// AI Content Hooks
// ============================================

export enum AIContentHook {
  AI_CONTENT_ENHANCE = 'ai:content_enhance',
  AI_SEO_OPTIMIZE = 'ai:seo_optimize',
  AI_MODERATE_CONTENT = 'ai:moderate_content',
  AI_TRANSLATE = 'ai:translate',
  AI_SUMMARIZE = 'ai:summarize',
  AI_CATEGORIZE = 'ai:categorize',
  AI_IMAGE_ALT = 'ai:image_alt',
  AI_SENTIMENT = 'ai:sentiment',
  AI_KEYWORDS = 'ai:keywords',
  AI_GRAMMAR = 'ai:grammar',
  AI_READABILITY = 'ai:readability',
}

// ============================================
// Hook Statistics
// ============================================

export interface HookStats {
  totalHooks: number;
  actionHooks: number;
  filterHooks: number;
  aiHooks: number;
  totalExecutions: number;
  averageExecutionTime: number;
  errorRate: number;
  hooksByNamespace: Record<string, number>;
  mostExecutedHooks: Array<{ name: string; count: number }>;
  slowestHooks: Array<{ name: string; avgTime: number }>;
}

// ============================================
// Plugin Hook Registration
// ============================================

export interface PluginHookRegistration {
  pluginId: string;
  pluginName: string;
  hooks: RegisteredHook[];
}
