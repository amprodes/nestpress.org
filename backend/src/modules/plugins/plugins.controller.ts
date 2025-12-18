/**
 * NestPress Plugins Controller
 * REST API for plugin management
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  All,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PluginsService } from './plugins.service';
import { PluginLoaderService } from './plugin-loader.service';
import { InstalledPlugin, ActivationResult } from './interfaces';
import { Public } from '../../common/decorators/public.decorator';

@Controller('plugins')
@Public() // Allow public access for development
export class PluginsController {
  private readonly logger = new Logger(PluginsController.name);

  constructor(
    private readonly pluginsService: PluginsService,
    private readonly pluginLoaderService: PluginLoaderService,
  ) {}

  /**
   * GET /api/v1/plugins
   * List all installed plugins
   */
  @Get()
  async findAll(): Promise<InstalledPlugin[]> {
    return this.pluginsService.findAll();
  }

  /**
   * GET /api/v1/plugins/active
   * List active plugins only
   */
  @Get('active')
  async findActive(): Promise<InstalledPlugin[]> {
    return this.pluginsService.findActive();
  }

  /**
   * GET /api/v1/plugins/stats
   * Get plugin statistics
   */
  @Get('stats')
  async getStats() {
    return this.pluginsService.getStats();
  }

  /**
   * GET /api/v1/plugins/widgets/dashboard
   * Get dashboard widgets from active plugins
   */
  @Get('widgets/dashboard')
  async getDashboardWidgets() {
    return this.pluginsService.getDashboardWidgets();
  }

  /**
   * GET /api/v1/plugins/:slug
   * Get a specific plugin
   */
  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<InstalledPlugin | undefined> {
    return this.pluginsService.findOne(slug);
  }

  /**
   * POST /api/v1/plugins/:slug/activate
   * Activate a plugin
   */
  @Post(':slug/activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Param('slug') slug: string): Promise<ActivationResult> {
    return this.pluginsService.activate(slug);
  }

  /**
   * GET /api/v1/plugins/:slug/activate/stream
   * Activate a plugin with SSE progress streaming
   */
  @Get(':slug/activate/stream')
  @Public()
  async activateWithProgress(
    @Param('slug') slug: string,
    @Res() res: any,
  ): Promise<void> {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendProgress = (message: string) => {
      res.write(`data: ${JSON.stringify({ message })}\n\n`);
    };

    try {
      sendProgress('Starting plugin activation...');
      
      // Subscribe to progress events
      const hookId = `activation-stream-${slug}-${Date.now()}`;
      const progressHandler = (data: any) => {
        if (data.slug === slug) {
          sendProgress(data.message);
        }
      };
      
      this.pluginLoaderService['hooksService'].addAction(
        'plugin_activation_progress',
        progressHandler,
        { namespace: hookId }
      );

      // Activate plugin
      const result = await this.pluginsService.activate(slug);

      if (result.success) {
        sendProgress('Plugin activated successfully!');
        res.write(`data: ${JSON.stringify({ success: true, done: true })}\n\n`);
      } else {
        sendProgress(`Error: ${result.message}`);
        res.write(`data: ${JSON.stringify({ success: false, error: result.message, done: true })}\n\n`);
      }
    } catch (error) {
      sendProgress(`Error: ${error.message}`);
      res.write(`data: ${JSON.stringify({ success: false, error: error.message, done: true })}\n\n`);
    } finally {
      res.end();
    }
  }

  /**
   * POST /api/v1/plugins/:slug/deactivate
   * Deactivate a plugin
   */
  @Post(':slug/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('slug') slug: string): Promise<ActivationResult> {
    return this.pluginsService.deactivate(slug);
  }

  /**
   * DELETE /api/v1/plugins/:slug
   * Delete a plugin
   */
  @Delete(':slug')
  async delete(@Param('slug') slug: string): Promise<ActivationResult> {
    return this.pluginsService.delete(slug);
  }

  /**
   * POST /api/v1/plugins/refresh
   * Refresh plugin list (rescan directory)
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(): Promise<InstalledPlugin[]> {
    return this.pluginsService.refresh();
  }

  /**
   * POST /api/v1/plugins/upload
   * Upload and install a plugin from ZIP file
   * TODO: Implement ZIP extraction and plugin installation
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPlugin(@UploadedFile() file: any) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }
    // TODO: Implement plugin extraction and installation
    return { success: false, message: 'Plugin upload not yet implemented', filename: file.originalname };
  }

  /**
   * GET /api/v1/plugins/:slug/files
   * Get plugin file tree (for editor)
   */
  @Get(':slug/files')
  async getFiles(@Param('slug') slug: string) {
    return this.pluginsService.getPluginFiles(slug);
  }

  /**
   * GET /api/v1/plugins/:slug/files/content
   * Get content of a specific plugin file
   */
  @Get(':slug/files/content')
  async getFileContent(
    @Param('slug') slug: string,
    @Query('path') path: string,
  ) {
    return this.pluginsService.getFileContent(slug, path);
  }

  /**
   * PUT /api/v1/plugins/:slug/files/content
   * Update content of a specific plugin file
   */
  @Put(':slug/files/content')
  async updateFileContent(
    @Param('slug') slug: string,
    @Body() body: { path: string; content: string },
  ) {
    return this.pluginsService.updateFileContent(slug, body.path, body.content);
  }

  /**
   * GET /api/v1/plugins/:slug/settings
   * Get plugin settings
   */
  @Get(':slug/settings')
  async getSettings(@Param('slug') slug: string) {
    return this.pluginsService.getSettings(slug);
  }

  /**
   * PUT /api/v1/plugins/:slug/settings
   * Update plugin settings
   */
  @Put(':slug/settings')
  async updateSettings(
    @Param('slug') slug: string,
    @Body() settings: Record<string, any>,
  ) {
    return this.pluginsService.updateSettings(slug, settings);
  }

  /**
   * GET /api/v1/plugins/admin-menu
   * Get admin menu items from active plugins
   * WordPress equivalent: Items added via add_menu_page()
   */
  @Get('admin-menu')
  async getAdminMenu() {
    return this.pluginsService.getAdminMenuItems();
  }

  /**
   * GET /api/v1/plugins/admin-menu/:parentSlug
   * Get admin submenu items for a parent menu
   * WordPress equivalent: Items added via add_submenu_page()
   */
  @Get('admin-menu/:parentSlug')
  async getAdminSubMenu(@Param('parentSlug') parentSlug: string) {
    return this.pluginsService.getAdminSubMenuItems(parentSlug);
  }

  /**
   * GET /api/v1/plugins/assets
   * Get all enqueued styles and scripts from active plugins
   * WordPress equivalent: Output of wp_enqueue_scripts action
   */
  @Get('assets')
  async getAssets() {
    return this.pluginsService.getAssets();
  }

  /**
   * GET /api/v1/plugins/widgets
   * Get all registered widgets from active plugins
   * WordPress equivalent: $wp_registered_widgets
   */
  @Get('widgets')
  async getWidgets() {
    return this.pluginsService.getWidgets();
  }

  /**
   * GET /api/v1/plugins/menu-item-panels
   * Get menu item panels from active plugins for nav menu editor
   * WordPress equivalent: nav menu metaboxes
   */
  @Get('menu-item-panels')
  @Public()
  async getMenuItemPanels() {
    return this.pluginsService.getMenuItemPanels();
  }

  /**
   * Dynamic plugin route handler
   * Handles all plugin-registered routes: /api/v1/plugins/{slug}/**
   * This enables plugins to register custom API endpoints dynamically
   */
  @All(':slug/*')
  @Public()
  async handlePluginRoute(
    @Param('slug') slug: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    const method = req.method;
    const subPath = req.params[0];
    const fullPath = `/plugins/${slug}/${subPath}`;
    
    this.logger.log(`Plugin route request: ${method} ${fullPath}`);
    
    try {
      const handled = await this.pluginLoaderService.executePluginRoute(
        method,
        fullPath,
        req,
        res,
      );

      if (!handled) {
        return res.status(404).json({
          success: false,
          message: `Plugin route not found: ${method} ${fullPath}`,
        });
      }
    } catch (error) {
      this.logger.error(`Plugin route error: ${error}`);
      return res.status(500).json({
        success: false,
        message: 'Plugin route execution failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
}
