/**
 * NestPress Hook Decorators
 * Declarative hook registration using TypeScript decorators
 */

import { SetMetadata } from '@nestjs/common';
import { ActionOptions, FilterOptions, AIHookOptions } from '../interfaces';

// Metadata keys
export const HOOK_ACTION_METADATA = 'nestpress:hook:action';
export const HOOK_FILTER_METADATA = 'nestpress:hook:filter';
export const HOOK_AI_METADATA = 'nestpress:hook:ai';
export const HOOK_HANDLERS_METADATA = 'nestpress:hook:handlers';

// ============================================
// Hook Handler Metadata Types
// ============================================

export interface ActionHandlerMetadata {
  hookName: string;
  methodName: string;
  options: ActionOptions;
}

export interface FilterHandlerMetadata {
  hookName: string;
  methodName: string;
  options: FilterOptions;
}

export interface AIHookHandlerMetadata {
  hookName: string;
  methodName: string;
  options: AIHookOptions;
}

export type HookHandlerMetadata = 
  | { type: 'action'; data: ActionHandlerMetadata }
  | { type: 'filter'; data: FilterHandlerMetadata }
  | { type: 'ai'; data: AIHookHandlerMetadata };

// ============================================
// Action Decorator
// ============================================

/**
 * Register a method as an action handler
 * 
 * @example
 * ```typescript
 * @OnAction('post:before_save', { priority: 10 })
 * async validatePost(post: Post): Promise<void> {
 *   // Validation logic
 * }
 * ```
 */
export function OnAction(hookName: string, options: ActionOptions = {}): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const handlers: HookHandlerMetadata[] = 
      Reflect.getMetadata(HOOK_HANDLERS_METADATA, target.constructor) || [];
    
    handlers.push({
      type: 'action',
      data: {
        hookName,
        methodName: String(propertyKey),
        options,
      },
    });
    
    Reflect.defineMetadata(HOOK_HANDLERS_METADATA, handlers, target.constructor);
    SetMetadata(HOOK_ACTION_METADATA, { hookName, options })(target, propertyKey, descriptor);
    
    return descriptor;
  };
}

// ============================================
// Filter Decorator
// ============================================

/**
 * Register a method as a filter handler
 * 
 * @example
 * ```typescript
 * @OnFilter('post:content_filter', { priority: 20 })
 * async addTableOfContents(content: string, context: HookContext): Promise<string> {
 *   return `<nav class="toc">...</nav>${content}`;
 * }
 * ```
 */
export function OnFilter(hookName: string, options: FilterOptions = {}): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const handlers: HookHandlerMetadata[] = 
      Reflect.getMetadata(HOOK_HANDLERS_METADATA, target.constructor) || [];
    
    handlers.push({
      type: 'filter',
      data: {
        hookName,
        methodName: String(propertyKey),
        options,
      },
    });
    
    Reflect.defineMetadata(HOOK_HANDLERS_METADATA, handlers, target.constructor);
    SetMetadata(HOOK_FILTER_METADATA, { hookName, options })(target, propertyKey, descriptor);
    
    return descriptor;
  };
}

// ============================================
// AI Hook Decorator
// ============================================

/**
 * Register a method as an AI-powered hook handler
 * 
 * @example
 * ```typescript
 * @AIHook('post:before_publish', { 
 *   aiTask: 'seo_optimize',
 *   model: 'gemini-3-pro-preview',
 *   fallbackOnError: true 
 * })
 * async optimizeSEO(post: Post, context: HookContext): Promise<Post> {
 *   // AI-powered SEO optimization
 *   return optimizedPost;
 * }
 * ```
 */
export function AIHook(hookName: string, options: AIHookOptions): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const handlers: HookHandlerMetadata[] = 
      Reflect.getMetadata(HOOK_HANDLERS_METADATA, target.constructor) || [];
    
    handlers.push({
      type: 'ai',
      data: {
        hookName,
        methodName: String(propertyKey),
        options,
      },
    });
    
    Reflect.defineMetadata(HOOK_HANDLERS_METADATA, handlers, target.constructor);
    SetMetadata(HOOK_AI_METADATA, { hookName, options })(target, propertyKey, descriptor);
    
    return descriptor;
  };
}

// ============================================
// Class Decorator for Hook Provider
// ============================================

/**
 * Mark a class as a hook provider
 * Classes with this decorator will have their hook handlers auto-registered
 * 
 * @example
 * ```typescript
 * @HookProvider({ namespace: 'seo-plugin' })
 * @Injectable()
 * export class SEOHooks {
 *   @OnFilter('post:seo_filter')
 *   async optimizeSEO(post: Post): Promise<Post> { ... }
 * }
 * ```
 */
export function HookProvider(options: { namespace?: string; description?: string } = {}): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata('nestpress:hook:provider', options, target);
    return target;
  };
}

// ============================================
// Utility function to get hook handlers from a class
// ============================================

export function getHookHandlers(target: any): HookHandlerMetadata[] {
  return Reflect.getMetadata(HOOK_HANDLERS_METADATA, target) || [];
}

export function isHookProvider(target: any): boolean {
  return Reflect.hasMetadata('nestpress:hook:provider', target);
}

export function getHookProviderOptions(target: any): { namespace?: string; description?: string } {
  return Reflect.getMetadata('nestpress:hook:provider', target) || {};
}
