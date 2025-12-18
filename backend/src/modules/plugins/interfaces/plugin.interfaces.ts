/**
 * NestPress Plugin Interfaces
 * WordPress-compatible plugin metadata and types
 * 
 * Plugin Header Format (like WordPress):
 * /**
 *  * Plugin Name: My Plugin
 *  * Plugin URI: https://example.com/my-plugin
 *  * Description: A short description of the plugin.
 *  * Version: 1.0.0
 *  * Author: Author Name
 *  * Author URI: https://example.com
 *  * License: GPL-2.0+
 *  * Text Domain: my-plugin
 *  * Requires at least: 1.0.0
 *  * Requires PHP: 8.0 (maps to Node.js version for us)
 *  *\/
 */

/**
 * Plugin metadata parsed from plugin header
 * Mirrors WordPress get_plugin_data() return structure
 */
export interface PluginData {
  // Core fields (WordPress standard)
  Name: string;
  PluginURI: string;
  Version: string;
  Description: string;
  Author: string;
  AuthorURI: string;
  TextDomain: string;
  DomainPath: string;
  Network: boolean;
  RequiresWP: string; // RequiresNP in our case
  RequiresNode: string; // RequiresPHP equivalent
  UpdateURI: string;
  RequiresPlugins: string[];
  
  // Computed fields
  Title: string; // Name with optional link
  AuthorName: string; // Author without link
  
  // NestPress additions
  Slug: string;
  File: string; // Main plugin file path
  BasePath: string; // Plugin directory path
}

/**
 * Installed plugin with runtime state
 */
export interface InstalledPlugin extends PluginData {
  id: string;
  active: boolean;
  activatedAt?: Date;
  deactivatedAt?: Date;
  errorState?: PluginError;
  
  // Capabilities
  capabilities: PluginCapability[];
  
  // Hook registrations from this plugin
  registeredHooks: string[];
  registeredFilters: string[];
  
  // Stats
  hookExecutions: number;
  lastError?: string;
}

/**
 * Plugin capability flags
 */
export type PluginCapability = 
  | 'content-filter'
  | 'admin-menu'
  | 'settings-page'
  | 'widget'
  | 'shortcode'
  | 'rest-api'
  | 'database'
  | 'media'
  | 'ai-integration'
  | 'ecommerce'
  | 'seo'
  | 'security'
  | 'caching'
  | 'analytics';

/**
 * Plugin activation/deactivation hooks
 */
export interface PluginLifecycleHooks {
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onUpgrade?: (oldVersion: string, newVersion: string) => Promise<void>;
}

/**
 * Plugin entry point interface
 * What a plugin's index.ts must export
 */
export interface NestPressPlugin extends PluginLifecycleHooks {
  /**
   * Plugin metadata (can be auto-extracted from header comment)
   */
  metadata?: Partial<PluginData>;
  
  /**
   * Initialize the plugin
   * Called when plugin is loaded (before activation check)
   */
  init?: (api: PluginAPI) => void | Promise<void>;
  
  /**
   * Main plugin setup
   * Called only when plugin is active
   */
  setup?: (api: PluginAPI) => void | Promise<void>;
  
  /**
   * Register hooks
   * Called to register all actions and filters
   */
  registerHooks?: (api: PluginAPI) => void;
  
  /**
   * Register REST API routes
   */
  registerRoutes?: (api: PluginAPI) => void;
  
  /**
   * Register admin menu items
   */
  registerAdminMenu?: (api: PluginAPI) => void;
  
  /**
   * Register settings
   */
  registerSettings?: (api: PluginAPI) => void;
  
  /**
   * Register shortcodes
   */
  registerShortcodes?: (api: PluginAPI) => void;
  
  /**
   * Register widgets
   */
  registerWidgets?: (api: PluginAPI) => void;
}

/**
 * Plugin API provided to plugins
 * This is the interface plugins use to interact with NestPress
 */
export interface PluginAPI {
  // Hook System (WordPress add_action/add_filter equivalent)
  addAction: (hookName: string, callback: Function, priority?: number) => string;
  addFilter: (hookName: string, callback: Function, priority?: number) => string;
  removeAction: (hookName: string, handlerId: string) => boolean;
  removeFilter: (hookName: string, handlerId: string) => boolean;
  doAction: (hookName: string, ...args: any[]) => Promise<void>;
  applyFilters: <T>(hookName: string, value: T, ...args: any[]) => Promise<T>;
  hasAction: (hookName: string) => boolean;
  hasFilter: (hookName: string) => boolean;
  
  // Shortcode System
  addShortcode: (tag: string, callback: ShortcodeCallback) => void;
  removeShortcode: (tag: string) => void;
  doShortcode: (content: string) => string;
  
  // Options API (like WordPress get_option/update_option)
  getOption: <T>(key: string, defaultValue?: T) => Promise<T | undefined>;
  updateOption: <T>(key: string, value: T) => Promise<void>;
  deleteOption: (key: string) => Promise<boolean>;
  
  // Database Access
  query: <T>(collection: string, query: any) => Promise<T[]>;
  findOne: <T>(collection: string, id: string) => Promise<T | null>;
  create: <T>(collection: string, data: Partial<T>) => Promise<T>;
  update: <T>(collection: string, id: string, data: Partial<T>) => Promise<T>;
  delete: (collection: string, id: string) => Promise<boolean>;
  
  // REST API Registration
  registerRoute: (method: string, path: string, handler: Function, options?: RouteOptions) => void;
  
  // Admin Menu
  addMenuPage: (options: MenuPageOptions) => void;
  addSubmenuPage: (parentSlug: string, options: MenuPageOptions) => void;
  
  // Settings API
  registerSetting: (group: string, name: string, options: SettingOptions) => void;
  addSettingsSection: (id: string, title: string, callback: Function, page: string) => void;
  addSettingsField: (id: string, title: string, callback: Function, page: string, section: string) => void;
  
  // Frontend Asset Loading (WordPress wp_enqueue_style/wp_enqueue_script equivalent)
  enqueueStyle: (handle: string, src: string, deps?: string[], version?: string, media?: string) => void;
  enqueueScript: (handle: string, src: string, deps?: string[], version?: string, inFooter?: boolean) => void;
  
  // Widget Registration
  registerWidget: (id: string, options: WidgetOptions) => void;
  
  // Menu Item Panel Registration (for nav menu editor)
  registerMenuItemPanel: (panel: MenuItemPanel) => void;
  
  // Utilities
  pluginUrl: (path?: string) => string;
  pluginPath: (path?: string) => string;
  log: (message: string, level?: 'log' | 'warn' | 'error' | 'debug' | 'verbose') => void;
  
  // System Configuration (Database-backed settings)
  systemConfigService: any;
  
  // Event Emitter
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
}

/**
 * Shortcode callback signature
 */
export type ShortcodeCallback = (
  attrs: Record<string, string>,
  content: string,
  tag: string
) => string;

/**
 * Route options for plugin REST endpoints
 */
export interface RouteOptions {
  auth?: boolean;
  roles?: string[];
  rateLimit?: number;
  description?: string;
}

/**
 * Menu page options
 */
export interface MenuPageOptions {
  pageTitle: string;
  menuTitle: string;
  capability: string;
  menuSlug: string;
  icon?: string;
  position?: number;
  component?: any; // React component
}

/**
 * Menu item panel for navigation menu editor
 * Allows plugins to add custom item sources (like WooCommerce products)
 */
export interface MenuItemPanel {
  id: string;
  title: string;
  description?: string;
  items: MenuItemOption[];
  searchable?: boolean;
  viewModes?: ('most-recent' | 'view-all' | 'search')[];
}

/**
 * Menu item option in a panel
 */
export interface MenuItemOption {
  id: string;
  label: string;
  url: string;
  description?: string;
}

/**
 * Setting options
 */
export interface SettingOptions {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  default?: any;
  sanitizeCallback?: (value: any) => any;
  showInRest?: boolean;
}

/**
 * Widget options
 */
export interface WidgetOptions {
  title: string;
  description?: string;
  location: 'sidebar' | 'header' | 'footer' | 'content' | string;
  component?: any; // React component (for frontend)
  render?: (props: any) => any; // Render function
  props?: Record<string, any>;
  priority?: number;
}

/**
 * Plugin asset (CSS/JS file)
 */
export interface PluginAsset {
  handle: string;
  pluginSlug: string;
  src: string;
  deps: string[];
  version: string;
  media?: string; // For styles
  inFooter?: boolean; // For scripts
  type: 'style' | 'script';
}

/**
 * Plugin error state
 */
export interface PluginError {
  code: string;
  message: string;
  timestamp: Date;
  stack?: string;
  recoverable: boolean;
}

/**
 * Plugin activation result
 */
export interface ActivationResult {
  success: boolean;
  plugin: string;
  message: string;
  error?: PluginError;
}

/**
 * Admin menu item (top-level)
 * WordPress equivalent: add_menu_page() result
 */
export interface AdminMenuItem {
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

/**
 * Admin submenu item
 * WordPress equivalent: add_submenu_page() result
 */
export interface AdminSubMenuItem {
  id: string;
  pluginSlug: string;
  parentSlug: string;
  pageTitle: string;
  menuTitle: string;
  capability: string;
  menuSlug: string;
  position?: number;
  icon?: string;
  component?: any;
}

/**
 * Plugin header keys for parsing
 */
export const PLUGIN_HEADERS = {
  Name: 'Plugin Name',
  PluginURI: 'Plugin URI',
  Version: 'Version',
  Description: 'Description',
  Author: 'Author',
  AuthorURI: 'Author URI',
  TextDomain: 'Text Domain',
  DomainPath: 'Domain Path',
  Network: 'Network',
  RequiresWP: 'Requires at least',
  RequiresNode: 'Requires Node',
  UpdateURI: 'Update URI',
  RequiresPlugins: 'Requires Plugins',
  License: 'License',
  LicenseURI: 'License URI',
} as const;

/**
 * Default plugin data
 */
export const DEFAULT_PLUGIN_DATA: PluginData = {
  Name: '',
  PluginURI: '',
  Version: '1.0.0',
  Description: '',
  Author: '',
  AuthorURI: '',
  TextDomain: '',
  DomainPath: '',
  Network: false,
  RequiresWP: '1.0.0',
  RequiresNode: '18.0.0',
  UpdateURI: '',
  RequiresPlugins: [],
  Title: '',
  AuthorName: '',
  Slug: '',
  File: '',
  BasePath: '',
};
