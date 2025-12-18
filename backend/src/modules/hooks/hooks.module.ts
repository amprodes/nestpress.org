/**
 * NestPress Hooks Module
 * WordPress-like hook system with TypeScript and AI integration
 */

import { Module, Global } from '@nestjs/common';
import { HooksService } from './hooks.service';
import { HookExplorerService } from './hook-explorer.service';
import { HooksController } from './hooks.controller';
import { AIHooksService } from './ai-hooks.service';
import { ContentFiltersService } from './content-filters.service';

@Global()
@Module({
  controllers: [HooksController],
  providers: [HooksService, HookExplorerService, AIHooksService, ContentFiltersService],
  exports: [HooksService, AIHooksService],
})
export class HooksModule {}
