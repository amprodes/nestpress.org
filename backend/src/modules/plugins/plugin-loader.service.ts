/**
 * NestPress Plugin Loader Service
 * Discovers, parses, and loads plugins from /plugins directory
 * Mirrors WordPress plugin loading behavior
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  PluginData,
  InstalledPlugin,
  NestPressPlugin,
  PluginAPI,
  PLUGIN_HEADERS,
  DEFAULT_PLUGIN_DATA,
  PluginCapability,
  ActivationResult,
  AdminMenuItem,
  AdminSubMenuItem,
  PluginAsset,
  WidgetOptions,
} from './interfaces';
import { HooksService } from '../hooks/hooks.service';
import { SystemConfigService } from '../system-config/system-config.service';

interface PluginRoute {
  method: string;
  path: string;
  handler: Function;
  pluginSlug: string;
  options?: any;
}

@Injectable()
export class PluginLoaderService implements OnModuleInit {
  private readonly logger = new Logger(PluginLoaderService.name);
  private readonly pluginsPath: string;
  private loadedPlugins = new Map<string, NestPressPlugin>();
  private installedPlugins = new Map<string, InstalledPlugin>();
  private activePlugins = new Set<string>();
  private pluginAPIs = new Map<string, PluginAPI>();
  private adminMenuItems: AdminMenuItem[] = [];
  private adminSubMenuItems: AdminSubMenuItem[] = [];
  private pluginAssets: PluginAsset[] = [];
  private pluginWidgets: WidgetOptions[] = [];
  private menuItemPanels: any[] = [];
  private pluginRoutes: PluginRoute[] = [];

  constructor(
    private readonly hooksService: HooksService,
    private readonly systemConfigService: SystemConfigService,
  ) {
    // Plugins directory at project root
    this.pluginsPath = path.join(process.cwd(), '..', 'plugins');
  }

  async onModuleInit() {
    await this.discoverPlugins();
    await this.loadActivePlugins();
    this.logger.log(`🔌 Plugin system initialized: ${this.installedPlugins.size} plugins discovered, ${this.activePlugins.size} active`);
  }

  /**
   * Discover all plugins in the /plugins directory
   * WordPress equivalent: get_plugins()
   */
  async discoverPlugins(): Promise<InstalledPlugin[]> {
    this.installedPlugins.clear();

    if (!fs.existsSync(this.pluginsPath)) {
      this.logger.warn(`Plugins directory not found: ${this.pluginsPath}`);
      fs.mkdirSync(this.pluginsPath, { recursive: true });
      return [];
    }

    const entries = fs.readdirSync(this.pluginsPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Plugin in its own folder: /plugins/my-plugin/index.ts
        const pluginDir = path.join(this.pluginsPath, entry.name);
        const mainFile = this.findMainPluginFile(pluginDir);
        
        if (mainFile) {
          const plugin = await this.parsePluginFile(mainFile, entry.name);
          if (plugin) {
            // Initialize InstalledPlugin fields
            const installedPlugin: InstalledPlugin = {
              ...plugin,
              id: plugin.Slug,
              active: false,
              capabilities: [],
              registeredHooks: [],
              registeredFilters: [],
              hookExecutions: 0,
            };
            this.installedPlugins.set(plugin.Slug, installedPlugin);
          }
        }
      } else if (entry.isFile() && this.isPluginFile(entry.name)) {
        // Single file plugin: /plugins/hello.ts
        const pluginFile = path.join(this.pluginsPath, entry.name);
        const slug = path.basename(entry.name, path.extname(entry.name));
        const plugin = await this.parsePluginFile(pluginFile, slug);
        if (plugin) {
          // Initialize InstalledPlugin fields
          const installedPlugin: InstalledPlugin = {
            ...plugin,
            id: plugin.Slug,
            active: false,
            capabilities: [],
            registeredHooks: [],
            registeredFilters: [],
            hookExecutions: 0,
          };
          this.installedPlugins.set(plugin.Slug, installedPlugin);
        }
      }
    }

    // Load active plugins list from storage
    await this.loadActivePluginsList();

    return Array.from(this.installedPlugins.values());
  }

  /**
   * Find the main plugin file in a plugin directory
   */
  private findMainPluginFile(pluginDir: string): string | null {
    // Check for index.ts/js first
    const indexFiles = ['index.ts', 'index.js', 'plugin.ts', 'plugin.js'];
    for (const file of indexFiles) {
      const filePath = path.join(pluginDir, file);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }

    // Check for file matching directory name
    const dirName = path.basename(pluginDir);
    const matchingFiles = [`${dirName}.ts`, `${dirName}.js`];
    for (const file of matchingFiles) {
      const filePath = path.join(pluginDir, file);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }

    return null;
  }

  /**
   * Check if a file is a plugin file
   */
  private isPluginFile(filename: string): boolean {
    return filename.endsWith('.ts') || filename.endsWith('.js');
  }

  /**
   * Parse plugin file header to extract metadata
   * WordPress equivalent: get_plugin_data()
   */
  async parsePluginFile(filePath: string, slug: string): Promise<PluginData | null> {
    try {
      // Read first 8KB of file (WordPress standard)
      const fd = fs.openSync(filePath, 'r');
      const buffer = Buffer.alloc(8192);
      fs.readSync(fd, buffer, 0, 8192, 0);
      fs.closeSync(fd);
      
      const content = buffer.toString('utf-8');
      const pluginData = this.parsePluginHeader(content);

      if (!pluginData.Name) {
        // No valid plugin header found
        this.logger.debug(`No plugin header found in ${filePath}`);
        return null;
      }

      // Add computed fields
      pluginData.Slug = slug;
      pluginData.File = filePath;
      pluginData.BasePath = path.dirname(filePath);
      pluginData.Title = pluginData.Name;
      pluginData.AuthorName = pluginData.Author;

      // If no text domain, use slug
      if (!pluginData.TextDomain) {
        pluginData.TextDomain = slug;
      }

      return pluginData;
    } catch (error) {
      this.logger.error(`Failed to parse plugin file ${filePath}: ${error}`);
      return null;
    }
  }

  /**
   * Parse plugin header comments
   * Extracts metadata from JSDoc-style comments at the top of the file
   */
  private parsePluginHeader(content: string): PluginData {
    const pluginData: PluginData = { ...DEFAULT_PLUGIN_DATA };

    // Match JSDoc comment block at start of file
    const commentMatch = content.match(/^\/\*\*[\s\S]*?\*\//);
    if (!commentMatch) {
      return pluginData;
    }

    const comment = commentMatch[0];

    // Parse each header
    for (const [key, header] of Object.entries(PLUGIN_HEADERS)) {
      const regex = new RegExp(`\\*\\s*${header}:\\s*(.+)$`, 'mi');
      const match = comment.match(regex);
      if (match) {
        const value = match[1].trim();
        if (key === 'Network') {
          (pluginData as any)[key] = value.toLowerCase() === 'true';
        } else if (key === 'RequiresPlugins') {
          (pluginData as any)[key] = value.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          (pluginData as any)[key] = value;
        }
      }
    }

    return pluginData;
  }

  /**
   * Load active plugins list from persistent storage
   */
  private async loadActivePluginsList(): Promise<void> {
    const activePluginsFile = path.join(this.pluginsPath, '.active-plugins.json');
    
    if (fs.existsSync(activePluginsFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(activePluginsFile, 'utf-8'));
        this.activePlugins = new Set(data.active || []);
        
        // Update installed plugins with active state
        for (const [slug, plugin] of this.installedPlugins) {
          (plugin as InstalledPlugin).active = this.activePlugins.has(slug);
          (plugin as InstalledPlugin).id = slug;
          (plugin as InstalledPlugin).capabilities = [];
          (plugin as InstalledPlugin).registeredHooks = [];
          (plugin as InstalledPlugin).registeredFilters = [];
          (plugin as InstalledPlugin).hookExecutions = 0;
        }
      } catch (error) {
        this.logger.error('Failed to load active plugins list:', error);
      }
    }
  }

  /**
   * Save active plugins list to persistent storage
   */
  private async saveActivePluginsList(): Promise<void> {
    const activePluginsFile = path.join(this.pluginsPath, '.active-plugins.json');
    
    try {
      fs.writeFileSync(activePluginsFile, JSON.stringify({
        active: Array.from(this.activePlugins),
        updatedAt: new Date().toISOString(),
      }, null, 2));
    } catch (error) {
      this.logger.error('Failed to save active plugins list:', error);
    }
  }

  /**
   * Load and initialize all active plugins
   */
  async loadActivePlugins(): Promise<void> {
    for (const slug of this.activePlugins) {
      const plugin = this.installedPlugins.get(slug);
      if (plugin) {
        await this.loadPlugin(slug);
      }
    }
  }

  /**
   * Load a single plugin
   */
  async loadPlugin(slug: string): Promise<boolean> {
    const pluginData = this.installedPlugins.get(slug);
    if (!pluginData) {
      this.logger.error(`Plugin not found: ${slug}`);
      return false;
    }

    try {
      let plugin: NestPressPlugin;
      
      // Check if it's a TypeScript file
      if (pluginData.File.endsWith('.ts')) {
        // Use require with ts-node (already registered by NestJS)
        // Clear require cache to allow hot reloading
        delete require.cache[require.resolve(pluginData.File)];
        
        // Register ts-node if not already (for plugin files outside src)
        try {
          require('ts-node').register({
            transpileOnly: true,
            compilerOptions: {
              module: 'commonjs',
              target: 'es2017',
              esModuleInterop: true,
            },
          });
        } catch (e) {
          // ts-node might already be registered
        }
        
        const pluginModule = require(pluginData.File);
        plugin = pluginModule.default || pluginModule;
      } else {
        // JavaScript file - use dynamic import
        const pluginModule = await import(pluginData.File);
        plugin = pluginModule.default || pluginModule;
      }

      // Create plugin API
      const api = this.createPluginAPI(slug, pluginData);
      this.pluginAPIs.set(slug, api);

      // Initialize plugin
      if (plugin.init) {
        await plugin.init(api);
      }

      // Store loaded plugin
      this.loadedPlugins.set(slug, plugin);

      // If active, run setup
      if (this.activePlugins.has(slug)) {
        await this.setupPlugin(slug);
      }

      this.logger.log(`✅ Plugin loaded: ${pluginData.Name} v${pluginData.Version}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to load plugin ${slug}: ${error}`);
      (pluginData as InstalledPlugin).errorState = {
        code: 'LOAD_ERROR',
        message: error.message,
        timestamp: new Date(),
        stack: error.stack,
        recoverable: true,
      };
      return false;
    }
  }

  /**
   * Setup an active plugin (register hooks, routes, etc.)
   */
  private async setupPlugin(slug: string): Promise<void> {
    const plugin = this.loadedPlugins.get(slug);
    const api = this.pluginAPIs.get(slug);
    
    if (!plugin || !api) return;

    // Clear existing menu items to prevent duplicates on re-activation
    this.clearPluginMenuItems(slug);

    try {
      // Call setup method
      if (plugin.setup) {
        await plugin.setup(api);
      }

      // Register hooks
      if (plugin.registerHooks) {
        plugin.registerHooks(api);
      }

      // Register routes
      if (plugin.registerRoutes) {
        plugin.registerRoutes(api);
      }

      // Register admin menu
      if (plugin.registerAdminMenu) {
        plugin.registerAdminMenu(api);
      }

      // Register settings
      if (plugin.registerSettings) {
        plugin.registerSettings(api);
      }

      // Register shortcodes
      if (plugin.registerShortcodes) {
        plugin.registerShortcodes(api);
      }

      // Register widgets
      if (plugin.registerWidgets) {
        plugin.registerWidgets(api);
      }
    } catch (error) {
      this.logger.error(`Failed to setup plugin ${slug}: ${error}`);
    }
  }

  /**
   * Create the Plugin API for a specific plugin
   */
  private createPluginAPI(slug: string, pluginData: PluginData): PluginAPI {
    const plugin = this.installedPlugins.get(slug) as InstalledPlugin;

    return {
      // Hook System
      addAction: (hookName: string, callback: Function, priority = 10) => {
        const id = this.hooksService.addAction(hookName, callback as any, { 
          priority, 
          namespace: slug 
        });
        plugin.registeredHooks.push(id);
        return id;
      },
      
      addFilter: (hookName: string, callback: Function, priority = 10) => {
        const id = this.hooksService.addFilter(hookName, callback as any, { 
          priority, 
          namespace: slug 
        });
        plugin.registeredFilters.push(id);
        return id;
      },
      
      removeAction: (hookName: string, handlerId: string) => {
        return this.hooksService.removeAction(hookName, handlerId);
      },
      
      removeFilter: (hookName: string, handlerId: string) => {
        return this.hooksService.removeFilter(hookName, handlerId);
      },
      
      doAction: async (hookName: string, ...args: any[]) => {
        await this.hooksService.doAction(hookName, args[0], { plugin: slug });
      },
      
      applyFilters: async <T>(hookName: string, value: T, ...args: any[]) => {
        const result = await this.hooksService.applyFilters(hookName, value, { plugin: slug });
        return result.finalValue;
      },
      
      hasAction: (hookName: string) => this.hooksService.hasAction(hookName),
      hasFilter: (hookName: string) => this.hooksService.hasFilter(hookName),

      // Shortcode System
      addShortcode: (tag: string, callback) => {
        this.hooksService.addFilter(`shortcode_${tag}`, async (content: string, ctx: any) => {
          return callback(ctx.attrs || {}, content, tag);
        }, { namespace: slug });
      },
      
      removeShortcode: (tag: string) => {
        // Remove all handlers for this shortcode
      },
      
      doShortcode: (content: string) => {
        // Process shortcodes in content
        return content; // TODO: Implement shortcode processing
      },

      // Options API
      getOption: async <T>(key: string, defaultValue?: T) => {
        // TODO: Implement options storage
        return defaultValue;
      },
      
      updateOption: async <T>(key: string, value: T) => {
        // TODO: Implement options storage
      },
      
      deleteOption: async (key: string) => {
        // TODO: Implement options storage
        return true;
      },

      // Database Access
      query: async <T>(collection: string, query: any) => {
        // TODO: Implement database access
        return [] as T[];
      },
      
      findOne: async <T>(collection: string, id: string) => {
        // TODO: Implement database access
        return null;
      },
      
      create: async <T>(collection: string, data: Partial<T>) => {
        // TODO: Implement database access
        return data as T;
      },
      
      update: async <T>(collection: string, id: string, data: Partial<T>) => {
        // TODO: Implement database access
        return data as T;
      },
      
      delete: async (collection: string, id: string) => {
        // TODO: Implement database access
        return true;
      },

      // REST API Registration
      registerRoute: (method: string, path: string, handler: Function, options = {}) => {
        const fullPath = `/plugins/${slug}${path}`;
        const route: PluginRoute = {
          method: method.toUpperCase(),
          path: fullPath, // Prefix with /plugins/{slug}
          handler,
          pluginSlug: slug,
          options,
        };
        this.pluginRoutes.push(route);
        this.logger.log(`✓ Plugin ${slug} registered route: ${method.toUpperCase()} ${fullPath}`);
        this.logger.log(`   Total plugin routes now: ${this.pluginRoutes.length}`);
      },

      // Admin Menu
      addMenuPage: (options) => {
        const menuItem: AdminMenuItem = {
          id: `plugin-${slug}-${options.menuSlug}`,
          pluginSlug: slug,
          pageTitle: options.pageTitle,
          menuTitle: options.menuTitle,
          capability: options.capability,
          menuSlug: options.menuSlug,
          icon: options.icon,
          position: options.position || 100,
          component: options.component,
        };
        this.adminMenuItems.push(menuItem);
        this.hooksService.doAction('admin_menu_add', menuItem);
      },
      
      addSubmenuPage: (parentSlug: string, options) => {
        this.logger.log(`[${slug}] Adding submenu page: ${options?.menuTitle} under ${parentSlug}`);
        const subMenuItem: AdminSubMenuItem = {
          id: `plugin-${slug}-${options.menuSlug}`,
          pluginSlug: slug,
          parentSlug,
          pageTitle: options.pageTitle,
          menuTitle: options.menuTitle,
          capability: options.capability,
          menuSlug: options.menuSlug,
          position: options.position || 10,
          icon: options.icon,
          component: options.component,
        };
        this.adminSubMenuItems.push(subMenuItem);
        this.logger.log(`[${slug}] Submenu added. Total submenus: ${this.adminSubMenuItems.length}`);
        this.hooksService.doAction('admin_submenu_add', subMenuItem);
      },

      // Settings API
      registerSetting: (group: string, name: string, options) => {
        this.hooksService.doAction('register_setting', { group, name, ...options, plugin: slug });
      },
      
      addSettingsSection: (id, title, callback, page) => {
        this.hooksService.doAction('add_settings_section', { id, title, callback, page, plugin: slug });
      },
      
      addSettingsField: (id, title, callback, page, section) => {
        this.hooksService.doAction('add_settings_field', { id, title, callback, page, section, plugin: slug });
      },

      // Frontend Asset Loading
      enqueueStyle: (handle: string, src: string, deps: string[] = [], version: string = '1.0.0', media: string = 'all') => {
        const asset: PluginAsset = {
          handle: `${slug}-${handle}`,
          pluginSlug: slug,
          src,
          deps,
          version,
          media,
          type: 'style',
        };
        this.pluginAssets.push(asset);
        this.logger.log(`Plugin ${slug} enqueued style: ${handle}`);
      },

      enqueueScript: (handle: string, src: string, deps: string[] = [], version: string = '1.0.0', inFooter: boolean = true) => {
        const asset: PluginAsset = {
          handle: `${slug}-${handle}`,
          pluginSlug: slug,
          src,
          deps,
          version,
          inFooter,
          type: 'script',
        };
        this.pluginAssets.push(asset);
        this.logger.log(`Plugin ${slug} enqueued script: ${handle}`);
      },

      // Widget Registration
      registerWidget: (id: string, options: WidgetOptions) => {
        const widget: WidgetOptions = {
          ...options,
          title: options.title,
          location: options.location,
          priority: options.priority || 10,
        };
        this.pluginWidgets.push(widget);
        this.logger.log(`Plugin ${slug} registered widget: ${id} at ${options.location}`);
      },

      // Menu Item Panel Registration
      registerMenuItemPanel: (panel: any) => {
        this.menuItemPanels.push({ ...panel, pluginSlug: slug });
        this.logger.log(`Plugin ${slug} registered menu item panel: ${panel.title}`);
      },

      // Utilities
      pluginUrl: (subPath = '') => `/plugins/${slug}${subPath ? '/' + subPath : ''}`,
      pluginPath: (subPath = '') => path.join(pluginData.BasePath, subPath),
      log: ((message: string, level?: 'log' | 'warn' | 'error' | 'debug' | 'verbose') => {
        const logLevel = level || 'log';
        const logMethods: Record<string, (msg: string) => void> = {
          log: (msg) => this.logger.log(msg),
          warn: (msg) => this.logger.warn(msg),
          error: (msg) => this.logger.error(msg),
          debug: (msg) => this.logger.debug(msg),
          verbose: (msg) => this.logger.verbose(msg),
        };
        const logFn = logMethods[logLevel] || logMethods.log;
        logFn(`[${slug}] ${message}`);
      }) as PluginAPI['log'],

      // Event Emitter
      emit: (event: string, data?: any) => {
        this.hooksService.doAction(`plugin_${slug}_${event}`, data);
      },
      
      on: (event: string, callback: Function) => {
        this.hooksService.addAction(`plugin_${slug}_${event}`, callback as any, { namespace: slug });
      },
      
      off: (event: string, callback: Function) => {
        // TODO: Implement event removal
      },

      // System Configuration Access
      systemConfigService: this.systemConfigService,
    };
  }

  /**
   * Auto-install plugin dependencies from package.json
   * Checks if node_modules exists, if not runs npm install
   */
  private async ensurePluginDependencies(
    slug: string, 
    pluginPath: string,
    progressCallback?: (message: string) => void
  ): Promise<void> {
    const { spawn } = require('child_process');
    const packageJsonPath = path.join(pluginPath, 'package.json');
    const nodeModulesPath = path.join(pluginPath, 'node_modules');

    this.logger.log(`[${slug}] 📋 Checking package.json at: ${packageJsonPath}`);

    // Check if package.json exists
    if (!fs.existsSync(packageJsonPath)) {
      this.logger.log(`[${slug}] ✅ No package.json found - no dependencies to install`);
      progressCallback?.('No dependencies required');
      return; // No dependencies needed
    }

    this.logger.log(`[${slug}] ✅ Found package.json - checking node_modules...`);

    // Check if node_modules already exists
    if (fs.existsSync(nodeModulesPath)) {
      this.logger.log(`[${slug}] ✅ node_modules already exists - skipping installation`);
      progressCallback?.('Dependencies already installed');
      return;
    }

    // Install dependencies with progress streaming
    this.logger.log(`[${slug}] 🚀 STARTING NPM INSTALL in ${pluginPath}`);
    this.logger.log(`[${slug}] Running: npm install --production`);
    progressCallback?.('Installing dependencies...');
    
    return new Promise((resolve, reject) => {
      const npmProcess = spawn('npm', ['install', '--production'], {
        cwd: pluginPath,
        shell: true,
      });

      let output = '';
      
      npmProcess.stdout.on('data', (data: Buffer) => {
        const message = data.toString().trim();
        if (message) {
          this.logger.debug(`[${slug}] npm: ${message}`);
          progressCallback?.(message);
        }
        output += message;
      });

      npmProcess.stderr.on('data', (data: Buffer) => {
        const message = data.toString().trim();
        if (message && !message.includes('npm WARN')) {
          this.logger.warn(`[${slug}] npm warn: ${message}`);
        }
      });

      npmProcess.on('close', (code: number) => {
        if (code === 0) {
          this.logger.log(`[${slug}] ✅ Dependencies installed successfully`);
          progressCallback?.('Dependencies installed successfully');
          resolve();
        } else {
          const error = `npm install exited with code ${code}`;
          this.logger.error(`[${slug}] ${error}`);
          progressCallback?.(`Error: ${error}`);
          reject(new Error(error));
        }
      });

      npmProcess.on('error', (error: Error) => {
        this.logger.error(`[${slug}] Failed to spawn npm: ${error.message}`);
        progressCallback?.(`Error: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * Activate a plugin
   * WordPress equivalent: activate_plugin()
   */
  async activatePlugin(slug: string): Promise<ActivationResult> {
    const pluginData = this.installedPlugins.get(slug);
    
    if (!pluginData) {
      return {
        success: false,
        plugin: slug,
        message: 'Plugin not found',
        error: { code: 'NOT_FOUND', message: 'Plugin not found', timestamp: new Date(), recoverable: false },
      };
    }

    if (this.activePlugins.has(slug)) {
      return {
        success: true,
        plugin: slug,
        message: 'Plugin is already active',
      };
    }

    try {
      // Auto-install plugin dependencies if package.json exists
      const progressCallback = (message: string) => {
        this.logger.log(`[${slug}] 📦 ${message}`);
        this.hooksService.doAction('plugin_activation_progress', { slug, message });
      };
      
      this.logger.log(`[${slug}] 🔍 Checking for package.json dependencies...`);
      progressCallback('Checking dependencies...');
      await this.ensurePluginDependencies(slug, pluginData.BasePath, progressCallback);

      // Check dependencies
      const deps = pluginData.RequiresPlugins || [];
      for (const dep of deps) {
        if (!this.activePlugins.has(dep)) {
          return {
            success: false,
            plugin: slug,
            message: `Required plugin not active: ${dep}`,
            error: { code: 'DEPENDENCY_MISSING', message: `Required plugin: ${dep}`, timestamp: new Date(), recoverable: true },
          };
        }
      }

      // Load plugin if not already loaded
      if (!this.loadedPlugins.has(slug)) {
        const loaded = await this.loadPlugin(slug);
        if (!loaded) {
          return {
            success: false,
            plugin: slug,
            message: 'Failed to load plugin',
            error: (pluginData as InstalledPlugin).errorState,
          };
        }
      }

      // Call activation hook
      const plugin = this.loadedPlugins.get(slug);
      if (plugin?.onActivate) {
        await plugin.onActivate();
      }

      // Setup plugin
      await this.setupPlugin(slug);

      // Mark as active
      this.activePlugins.add(slug);
      (pluginData as InstalledPlugin).active = true;
      (pluginData as InstalledPlugin).activatedAt = new Date();

      // Save active plugins list
      await this.saveActivePluginsList();

      // Fire activation action
      await this.hooksService.doAction('activated_plugin', { slug, pluginData });

      this.logger.log(`✅ Plugin activated: ${pluginData.Name}`);

      return {
        success: true,
        plugin: slug,
        message: `Plugin ${pluginData.Name} activated successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to activate plugin ${slug}: ${error}`);
      return {
        success: false,
        plugin: slug,
        message: error.message,
        error: { code: 'ACTIVATION_ERROR', message: error.message, timestamp: new Date(), stack: error.stack, recoverable: true },
      };
    }
  }

  /**
   * Deactivate a plugin
   * WordPress equivalent: deactivate_plugin()
   */
  async deactivatePlugin(slug: string): Promise<ActivationResult> {
    const pluginData = this.installedPlugins.get(slug);
    
    if (!pluginData) {
      return {
        success: false,
        plugin: slug,
        message: 'Plugin not found',
      };
    }

    if (!this.activePlugins.has(slug)) {
      return {
        success: true,
        plugin: slug,
        message: 'Plugin is already inactive',
      };
    }

    try {
      // Call deactivation hook
      const plugin = this.loadedPlugins.get(slug);
      if (plugin?.onDeactivate) {
        await plugin.onDeactivate();
      }

      // Remove registered hooks/filters by namespace
      await this.hooksService.removeByNamespace(slug);

      // Clear plugin assets and widgets
      this.clearPluginAssets(slug);
      
      // Clear plugin menu items
      this.clearPluginMenuItems(slug);

      // Mark as inactive
      const installedPlugin = pluginData as InstalledPlugin;
      this.activePlugins.delete(slug);
      installedPlugin.active = false;
      installedPlugin.deactivatedAt = new Date();
      installedPlugin.registeredHooks = [];
      installedPlugin.registeredFilters = [];

      // Save active plugins list
      await this.saveActivePluginsList();

      // Fire deactivation action
      await this.hooksService.doAction('deactivated_plugin', { slug, pluginData });

      this.logger.log(`🔴 Plugin deactivated: ${pluginData.Name}`);

      return {
        success: true,
        plugin: slug,
        message: `Plugin ${pluginData.Name} deactivated successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to deactivate plugin ${slug}: ${error}`);
      return {
        success: false,
        plugin: slug,
        message: error.message,
      };
    }
  }

  /**
   * Delete a plugin
   * WordPress equivalent: delete_plugins()
   */
  async deletePlugin(slug: string): Promise<ActivationResult> {
    const pluginData = this.installedPlugins.get(slug);
    
    if (!pluginData) {
      return {
        success: false,
        plugin: slug,
        message: 'Plugin not found',
      };
    }

    // Must be deactivated first
    if (this.activePlugins.has(slug)) {
      await this.deactivatePlugin(slug);
    }

    try {
      // Call uninstall hook
      const plugin = this.loadedPlugins.get(slug);
      if (plugin?.onUninstall) {
        await plugin.onUninstall();
      }

      // Delete plugin files
      if (fs.existsSync(pluginData.BasePath)) {
        fs.rmSync(pluginData.BasePath, { recursive: true, force: true });
      }

      // Remove from registries
      this.installedPlugins.delete(slug);
      this.loadedPlugins.delete(slug);
      this.pluginAPIs.delete(slug);

      this.logger.log(`🗑️ Plugin deleted: ${pluginData.Name}`);

      return {
        success: true,
        plugin: slug,
        message: `Plugin ${pluginData.Name} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to delete plugin ${slug}: ${error}`);
      return {
        success: false,
        plugin: slug,
        message: error.message,
      };
    }
  }

  /**
   * Get all installed plugins
   */
  getInstalledPlugins(): InstalledPlugin[] {
    return Array.from(this.installedPlugins.values());
  }

  /**
   * Get admin menu items from active plugins
   * WordPress equivalent: Getting items added via add_menu_page()
   */
  getAdminMenuItems(): AdminMenuItem[] {
    // Filter by active plugins only
    return this.adminMenuItems
      .filter(item => this.activePlugins.has(item.pluginSlug))
      .sort((a, b) => (a.position || 100) - (b.position || 100));
  }

  /**
   * Get admin submenu items from active plugins
   * WordPress equivalent: Getting items added via add_submenu_page()
   */
  getAdminSubMenuItems(parentSlug?: string): AdminSubMenuItem[] {
    const items = this.adminSubMenuItems
      .filter(item => this.activePlugins.has(item.pluginSlug));
    
    if (parentSlug) {
      return items
        .filter(item => item.parentSlug === parentSlug)
        .sort((a, b) => (a.position || 10) - (b.position || 10));
    }
    
    return items.sort((a, b) => (a.position || 10) - (b.position || 10));
  }

  /**
   * Clear menu items when plugin is deactivated
   */
  private clearPluginMenuItems(slug: string): void {
    this.adminMenuItems = this.adminMenuItems.filter(item => item.pluginSlug !== slug);
    this.adminSubMenuItems = this.adminSubMenuItems.filter(item => item.pluginSlug !== slug);
  }

  /**
   * Get a specific plugin
   */
  getPlugin(slug: string): InstalledPlugin | undefined {
    return this.installedPlugins.get(slug);
  }

  /**
   * Get active plugins
   */
  getActivePlugins(): InstalledPlugin[] {
    return this.getInstalledPlugins().filter(p => p.active);
  }

  /**
   * Check if a plugin is active
   */
  isPluginActive(slug: string): boolean {
    return this.activePlugins.has(slug);
  }

  /**
   * Get dashboard widgets from active plugins
   */
  async getDashboardWidgets(): Promise<any[]> {
    try {
      const widgets = await this.hooksService.applyFilters(
        'admin_dashboard_widgets',
        [],
        { source: 'dashboard' }
      );
      return widgets.finalValue || [];
    } catch (error) {
      this.logger.error(`Failed to get dashboard widgets: ${error}`);
      return [];
    }
  }

  /**
   * Get plugin file tree (for editor)
   */
  async getPluginFiles(slug: string): Promise<{ files: any[] }> {
    const plugin = this.installedPlugins.get(slug);
    if (!plugin) {
      throw new Error(`Plugin ${slug} not found`);
    }

    const files = this.readDirectoryTree(plugin.BasePath, plugin.BasePath);
    return { files };
  }

  /**
   * Recursively read directory tree
   */
  private readDirectoryTree(dir: string, basePath: string): any[] {
    const result: any[] = [];
    
    if (!fs.existsSync(dir)) {
      return result;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.relative(basePath, fullPath);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and hidden directories
        if (item === 'node_modules' || item.startsWith('.')) {
          continue;
        }
        
        result.push({
          path: relativePath,
          name: item,
          isDirectory: true,
          children: this.readDirectoryTree(fullPath, basePath),
        });
      } else {
        // Only include TypeScript/JavaScript files
        if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
          result.push({
            path: relativePath,
            name: item,
            isDirectory: false,
          });
        }
      }
    }
    
    return result;
  }

  /**
   * Get plugin file content
   */
  async getPluginFileContent(slug: string, filePath: string): Promise<{ content: string }> {
    const plugin = this.installedPlugins.get(slug);
    if (!plugin) {
      throw new Error(`Plugin ${slug} not found`);
    }

    const fullPath = path.join(plugin.BasePath, filePath);
    
    // Security check: ensure path is within plugin directory
    if (!fullPath.startsWith(plugin.BasePath)) {
      throw new Error('Invalid file path');
    }

    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found');
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    return { content };
  }

  /**
   * Update plugin file content
   */
  async updatePluginFileContent(slug: string, filePath: string, content: string): Promise<{ success: boolean }> {
    const plugin = this.installedPlugins.get(slug);
    if (!plugin) {
      throw new Error(`Plugin ${slug} not found`);
    }

    const fullPath = path.join(plugin.BasePath, filePath);
    
    // Security check: ensure path is within plugin directory
    if (!fullPath.startsWith(plugin.BasePath)) {
      throw new Error('Invalid file path');
    }

    try {
      fs.writeFileSync(fullPath, content, 'utf-8');
      
      // If plugin is active, reload it
      if (this.activePlugins.has(slug)) {
        await this.deactivatePlugin(slug);
        await this.activatePlugin(slug);
      }
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to update file: ${error}`);
      throw new Error(`Failed to update file: ${error.message}`);
    }
  }

  /**
   * Get plugin settings
   */
  async getPluginSettings(slug: string): Promise<Record<string, any>> {
    const plugin = this.installedPlugins.get(slug);
    if (!plugin) {
      throw new Error(`Plugin ${slug} not found`);
    }

    // Load settings from plugin data directory
    const settingsPath = path.join(plugin.BasePath, '.nestpress', 'settings.json');
    
    if (fs.existsSync(settingsPath)) {
      try {
        const content = fs.readFileSync(settingsPath, 'utf-8');
        return JSON.parse(content);
      } catch (error) {
        this.logger.error(`Failed to read settings: ${error}`);
        return {};
      }
    }
    
    return {};
  }

  /**
   * Update plugin settings
   */
  async updatePluginSettings(slug: string, settings: Record<string, any>): Promise<{ success: boolean }> {
    const plugin = this.installedPlugins.get(slug);
    if (!plugin) {
      throw new Error(`Plugin ${slug} not found`);
    }

    const dataDir = path.join(plugin.BasePath, '.nestpress');
    const settingsPath = path.join(dataDir, 'settings.json');
    
    try {
      // Ensure .nestpress directory exists
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
      
      // Fire settings updated hook
      await this.hooksService.doAction(`plugin_settings_updated:${slug}`, { slug, settings });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to update settings: ${error}`);
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  }

  /**
   * Get all plugin assets (styles and scripts) from active plugins
   * WordPress equivalent: wp_enqueue_scripts action output
   */
  getPluginAssets(): PluginAsset[] {
    return this.pluginAssets.filter(asset => 
      this.activePlugins.has(asset.pluginSlug)
    );
  }

  /**
   * Get all plugin widgets from active plugins
   * WordPress equivalent: registered widgets
   */
  getPluginWidgets(): WidgetOptions[] {
    return this.pluginWidgets.filter(widget => {
      // Find which plugin registered this widget
      const plugin = Array.from(this.activePlugins).find(slug => {
        const widgetsForPlugin = this.pluginWidgets.filter(w => w === widget);
        return widgetsForPlugin.length > 0;
      });
      return plugin !== undefined;
    });
  }

  /**
   * Get menu item panels from active plugins
   * WordPress equivalent: nav menu metaboxes
   */
  getMenuItemPanels(): any[] {
    return this.menuItemPanels;
  }

  /**
   * Get all registered plugin routes
   */
  getPluginRoutes(): PluginRoute[] {
    return this.pluginRoutes.filter(route => 
      this.activePlugins.has(route.pluginSlug)
    );
  }

  /**
   * Match a route pattern (with :param support) against a path
   */
  private matchRoute(pattern: string, path: string): { match: boolean; params: Record<string, string> } {
    // Convert route pattern to regex
    // /plugins/ai-theme-factory/progress/:jobId -> /plugins/ai-theme-factory/progress/([^/]+)
    const paramNames: string[] = [];
    const regexPattern = pattern.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });
    
    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);
    
    if (!match) {
      return { match: false, params: {} };
    }
    
    // Extract params
    const params: Record<string, string> = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });
    
    return { match: true, params };
  }

  /**
   * Execute a plugin route handler
   */
  async executePluginRoute(method: string, path: string, req: any, res: any): Promise<boolean> {
    // Debug logging
    this.logger.log(`[executePluginRoute] Looking for: ${method} ${path}`);
    this.logger.log(`[executePluginRoute] Available routes: ${this.pluginRoutes.length}`);
    this.pluginRoutes.forEach(r => {
      this.logger.log(`  - ${r.method} ${r.path} (plugin: ${r.pluginSlug}, active: ${this.activePlugins.has(r.pluginSlug)})`);
    });
    
    // Find route with pattern matching support
    let matchedRoute: PluginRoute | null = null;
    let routeParams: Record<string, string> = {};
    
    for (const route of this.pluginRoutes) {
      if (route.method === method.toUpperCase()) {
        const { match, params } = this.matchRoute(route.path, path);
        this.logger.log(`[executePluginRoute] Testing route ${route.path} against ${path}: match=${match}`);
        if (match) {
          matchedRoute = route;
          routeParams = params;
          this.logger.log(`[executePluginRoute] ✓ Matched route: ${route.path}`);
          break;
        }
      }
    }

    if (!matchedRoute) {
      return false;
    }

    if (!this.activePlugins.has(matchedRoute.pluginSlug)) {
      this.logger.warn(`Route ${path} belongs to inactive plugin ${matchedRoute.pluginSlug}`);
      return false;
    }

    try {
      // Get plugin data for API creation
      const pluginData = this.installedPlugins.get(matchedRoute.pluginSlug);
      if (!pluginData) {
        this.logger.error(`Plugin data not found for ${matchedRoute.pluginSlug}`);
        return false;
      }
      
      // Create PluginAPI context for this route execution
      const api = this.createPluginAPI(matchedRoute.pluginSlug, pluginData);
      
      // Attach API to request so handlers can use it
      req.pluginAPI = api;
      
      // Merge route params into req.params
      req.params = { ...req.params, ...routeParams };
      
      await matchedRoute.handler(req, res);
      return true;
    } catch (error) {
      this.logger.error(`Error executing plugin route ${path}: ${error}`);
      throw error;
    }
  }

  /**
   * Clear assets and widgets for a specific plugin
   * Called during plugin deactivation
   */
  private clearPluginAssets(slug: string): void {
    // Remove assets
    this.pluginAssets = this.pluginAssets.filter(asset => asset.pluginSlug !== slug);
    
    // Remove widgets - need to track which plugin registered them
    // For now, we'll keep all widgets (will improve this in future)
    this.logger.log(`Cleared assets for plugin: ${slug}`);
  }
}
