/**
 * NestPress Plugins Service
 * High-level plugin management API
 */

import { Injectable, Logger } from '@nestjs/common';
import { PluginLoaderService } from './plugin-loader.service';
import { InstalledPlugin, ActivationResult } from './interfaces';

@Injectable()
export class PluginsService {
  private readonly logger = new Logger(PluginsService.name);

  constructor(private readonly pluginLoader: PluginLoaderService) {}

  /**
   * Get all plugins
   */
  async findAll(): Promise<InstalledPlugin[]> {
    return this.pluginLoader.getInstalledPlugins();
  }

  /**
   * Get active plugins only
   */
  async findActive(): Promise<InstalledPlugin[]> {
    return this.pluginLoader.getActivePlugins();
  }

  /**
   * Get a specific plugin by slug
   */
  async findOne(slug: string): Promise<InstalledPlugin | undefined> {
    return this.pluginLoader.getPlugin(slug);
  }

  /**
   * Activate a plugin
   */
  async activate(slug: string): Promise<ActivationResult> {
    return this.pluginLoader.activatePlugin(slug);
  }

  /**
   * Deactivate a plugin
   */
  async deactivate(slug: string): Promise<ActivationResult> {
    return this.pluginLoader.deactivatePlugin(slug);
  }

  /**
   * Delete a plugin
   */
  async delete(slug: string): Promise<ActivationResult> {
    return this.pluginLoader.deletePlugin(slug);
  }

  /**
   * Check if plugin is active
   */
  isActive(slug: string): boolean {
    return this.pluginLoader.isPluginActive(slug);
  }

  /**
   * Refresh plugin list (rescan plugins directory)
   */
  async refresh(): Promise<InstalledPlugin[]> {
    return this.pluginLoader.discoverPlugins();
  }

  /**
   * Get plugin statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withErrors: number;
  }> {
    const plugins = this.pluginLoader.getInstalledPlugins();
    return {
      total: plugins.length,
      active: plugins.filter(p => p.active).length,
      inactive: plugins.filter(p => !p.active).length,
      withErrors: plugins.filter(p => p.errorState).length,
    };
  }

  /**
   * Get dashboard widgets from active plugins
   */
  async getDashboardWidgets() {
    return this.pluginLoader.getDashboardWidgets();
  }

  /**
   * Get plugin file tree
   */
  async getPluginFiles(slug: string) {
    return this.pluginLoader.getPluginFiles(slug);
  }

  /**
   * Get plugin file content
   */
  async getFileContent(slug: string, filePath: string) {
    return this.pluginLoader.getPluginFileContent(slug, filePath);
  }

  /**
   * Update plugin file content
   */
  async updateFileContent(slug: string, filePath: string, content: string) {
    return this.pluginLoader.updatePluginFileContent(slug, filePath, content);
  }

  /**
   * Get plugin settings
   */
  async getSettings(slug: string): Promise<Record<string, any>> {
    return this.pluginLoader.getPluginSettings(slug);
  }

  /**
   * Update plugin settings
   */
  async updateSettings(slug: string, settings: Record<string, any>) {
    return this.pluginLoader.updatePluginSettings(slug, settings);
  }

  /**
   * Get admin menu items from active plugins
   */
  async getAdminMenuItems() {
    return this.pluginLoader.getAdminMenuItems();
  }

  /**
   * Get admin submenu items
   */
  async getAdminSubMenuItems(parentSlug?: string) {
    return this.pluginLoader.getAdminSubMenuItems(parentSlug);
  }

  /**
   * Get all plugin assets (styles and scripts) from active plugins
   * WordPress equivalent: wp_enqueue_scripts output
   */
  async getAssets() {
    return this.pluginLoader.getPluginAssets();
  }

  /**
   * Get all plugin widgets from active plugins
   * WordPress equivalent: $wp_registered_widgets
   */
  async getWidgets() {
    return this.pluginLoader.getPluginWidgets();
  }

  /**
   * Get menu item panels from active plugins
   * WordPress equivalent: nav menu metaboxes
   */
  async getMenuItemPanels() {
    return this.pluginLoader.getMenuItemPanels();
  }
}
