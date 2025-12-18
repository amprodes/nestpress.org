/**
 * NestPress Plugins Module
 * WordPress-compatible plugin system for NestJS
 */

import { Module, Global } from '@nestjs/common';
import { PluginsService } from './plugins.service';
import { PluginsController } from './plugins.controller';
import { PluginLoaderService } from './plugin-loader.service';
import { HooksModule } from '../hooks/hooks.module';
import { SystemConfigModule } from '../system-config/system-config.module';

@Global()
@Module({
  imports: [HooksModule, SystemConfigModule],
  controllers: [PluginsController],
  providers: [PluginsService, PluginLoaderService],
  exports: [PluginsService, PluginLoaderService],
})
export class PluginsModule {}
