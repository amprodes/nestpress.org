/**
 * NestPress Hooks Controller
 * REST API for managing and monitoring hooks
 */

import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HooksService } from './hooks.service';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { HookStats, LifecycleHook, ContentHook, AIContentHook } from './interfaces';

@ApiTags('Hooks')
@Controller('hooks')
export class HooksController {
  constructor(private readonly hooksService: HooksService) {}

  // ============================================
  // Statistics & Monitoring
  // ============================================

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get hook system statistics' })
  @ApiResponse({
    status: 200,
    description: 'Hook statistics retrieved successfully',
  })
  getStats(): { success: boolean; data: HookStats; timestamp: string } {
    const stats = this.hooksService.getStats();
    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all registered hooks' })
  @ApiQuery({ name: 'type', required: false, enum: ['action', 'filter', 'ai'] })
  @ApiResponse({
    status: 200,
    description: 'List of all registered hooks',
  })
  listHooks(@Query('type') type?: 'action' | 'filter' | 'ai') {
    const allHookNames = this.hooksService.getAllHookNames();
    
    const hooks = allHookNames.map(name => {
      const handlers = this.hooksService.getHooks(name);
      const filteredHandlers = type 
        ? handlers.filter(h => h.metadata.type === type)
        : handlers;
      
      return {
        name,
        handlers: filteredHandlers.map(h => ({
          id: h.id,
          type: h.metadata.type,
          priority: h.metadata.priority,
          namespace: h.metadata.namespace,
          enabled: h.enabled,
          executionCount: h.executionCount,
          lastExecuted: h.lastExecuted,
          averageExecutionTime: h.averageExecutionTime,
          aiConfig: h.metadata.aiConfig,
        })),
      };
    }).filter(h => h.handlers.length > 0);

    return {
      success: true,
      data: hooks,
      total: hooks.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':hookName')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get details for a specific hook' })
  @ApiResponse({
    status: 200,
    description: 'Hook details retrieved successfully',
  })
  getHookDetails(@Param('hookName') hookName: string) {
    const handlers = this.hooksService.getHooks(hookName);
    
    return {
      success: true,
      data: {
        name: hookName,
        hasHandlers: handlers.length > 0,
        handlers: handlers.map(h => ({
          id: h.id,
          type: h.metadata.type,
          priority: h.metadata.priority,
          namespace: h.metadata.namespace,
          description: h.metadata.description,
          enabled: h.enabled,
          executionCount: h.executionCount,
          lastExecuted: h.lastExecuted,
          averageExecutionTime: h.averageExecutionTime,
          aiConfig: h.metadata.aiConfig,
        })),
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // Hook Management
  // ============================================

  @Patch(':handlerId/enable')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Enable a hook handler' })
  enableHook(@Param('handlerId') handlerId: string) {
    const success = this.hooksService.enableHook(handlerId);
    return {
      success,
      message: success ? 'Hook handler enabled' : 'Hook handler not found',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':handlerId/disable')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Disable a hook handler' })
  disableHook(@Param('handlerId') handlerId: string) {
    const success = this.hooksService.disableHook(handlerId);
    return {
      success,
      message: success ? 'Hook handler disabled' : 'Hook handler not found',
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // Manual Hook Execution (for testing/debugging)
  // ============================================

  @Post('test/action/:hookName')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Test execute an action hook' })
  async testAction(
    @Param('hookName') hookName: string,
    @Body() payload: any,
  ) {
    const result = await this.hooksService.doAction(hookName, payload, {
      testMode: true,
    });
    
    return {
      success: true,
      data: {
        hookName: result.hookName,
        handlersExecuted: result.handlersExecuted,
        executionTime: result.executionTime,
        errors: result.errors.map(e => ({
          handlerId: e.handlerId,
          error: e.error.message,
          recovered: e.recovered,
        })),
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Post('test/filter/:hookName')
  @ApiBearerAuth('JWT-auth')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Test execute a filter hook' })
  async testFilter(
    @Param('hookName') hookName: string,
    @Body() body: { value: any },
  ) {
    const result = await this.hooksService.applyFilters(hookName, body.value, {
      testMode: true,
    });
    
    return {
      success: true,
      data: {
        hookName: result.hookName,
        originalValue: result.originalValue,
        finalValue: result.finalValue,
        handlersExecuted: result.handlersExecuted,
        executionTime: result.executionTime,
        transformations: result.transformations.map(t => ({
          handlerId: t.handlerId,
          priority: t.priority,
          executionTime: t.executionTime,
          aiProcessed: t.aiProcessed,
        })),
        errors: result.errors.map(e => ({
          handlerId: e.handlerId,
          error: e.error.message,
          recovered: e.recovered,
        })),
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // Available Hooks Reference
  // ============================================

  @Get('reference/lifecycle')
  @Public()
  @ApiOperation({ summary: 'Get list of available lifecycle hooks' })
  getLifecycleHooks() {
    return {
      success: true,
      data: Object.entries(LifecycleHook).map(([key, value]) => ({
        name: key,
        hookName: value,
        description: this.getHookDescription(value),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('reference/content')
  @Public()
  @ApiOperation({ summary: 'Get list of available content hooks' })
  getContentHooks() {
    return {
      success: true,
      data: Object.entries(ContentHook).map(([key, value]) => ({
        name: key,
        hookName: value,
        description: this.getHookDescription(value),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('reference/ai')
  @Public()
  @ApiOperation({ summary: 'Get list of available AI hooks' })
  getAIHooks() {
    return {
      success: true,
      data: Object.entries(AIContentHook).map(([key, value]) => ({
        name: key,
        hookName: value,
        description: this.getHookDescription(value),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private getHookDescription(hookName: string): string {
    const descriptions: Record<string, string> = {
      // Lifecycle
      'app:bootstrap': 'Fired when the application starts bootstrapping',
      'app:init': 'Fired when the application initializes',
      'app:ready': 'Fired when the application is fully ready',
      'app:shutdown': 'Fired when the application is shutting down',
      'database:connected': 'Fired when database connection is established',
      'config:loaded': 'Fired when configuration is loaded',
      'plugins:loaded': 'Fired when all plugins are loaded',
      'auth:init': 'Fired when authentication system initializes',
      'request:start': 'Fired at the start of each HTTP request',
      'request:end': 'Fired at the end of each HTTP request',
      
      // Content
      'post:before_create': 'Fired before a post is created',
      'post:after_create': 'Fired after a post is created',
      'post:before_publish': 'Fired before a post is published',
      'post:content_filter': 'Filter to transform post content',
      'post:seo_filter': 'Filter to optimize post SEO',
      'comment:spam_check': 'Action to check comment for spam',
      'media:after_upload': 'Fired after media is uploaded',
      
      // AI
      'ai:content_enhance': 'AI-powered content enhancement',
      'ai:seo_optimize': 'AI-powered SEO optimization',
      'ai:moderate_content': 'AI-powered content moderation',
      'ai:summarize': 'AI-powered text summarization',
      'ai:categorize': 'AI-powered content categorization',
    };

    return descriptions[hookName] || 'No description available';
  }
}
