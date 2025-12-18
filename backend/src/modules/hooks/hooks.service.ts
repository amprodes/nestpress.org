/**
 * NestPress Hook Service
 * Central registry and executor for all hooks (actions, filters, AI hooks)
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  HookType,
  HookMetadata,
  RegisteredHook,
  ActionHandler,
  FilterHandler,
  HookHandler,
  HookContext,
  ActionOptions,
  FilterOptions,
  AIHookOptions,
  AIHookConfig,
  ActionResult,
  FilterResult,
  TransformationStep,
  HookError,
  HookStats,
  LifecycleHook,
} from './interfaces';

@Injectable()
export class HooksService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HooksService.name);
  
  // Hook registries
  private readonly actions = new Map<string, RegisteredHook[]>();
  private readonly filters = new Map<string, RegisteredHook[]>();
  private readonly aiHooks = new Map<string, RegisteredHook[]>();
  
  // Statistics tracking
  private totalExecutions = 0;
  private totalExecutionTime = 0;
  private errorCount = 0;
  
  // Lifecycle state
  private isShuttingDown = false;

  async onModuleInit() {
    this.logger.log('🪝 NestPress Hook System initialized');
    await this.doAction(LifecycleHook.APP_INIT, { timestamp: new Date() });
  }

  async onModuleDestroy() {
    this.isShuttingDown = true;
    await this.doAction(LifecycleHook.APP_SHUTDOWN, { timestamp: new Date() });
    this.logger.log('🪝 NestPress Hook System shutdown complete');
  }

  // ============================================
  // Action Registration & Execution
  // ============================================

  /**
   * Register an action handler
   * Actions are hooks that execute code without modifying data
   */
  addAction<T = any>(
    hookName: string,
    handler: ActionHandler<T>,
    options: ActionOptions = {},
  ): string {
    const id = this.generateHookId(hookName, 'action');
    const { priority = 10, namespace, description, once = false, condition } = options;

    const metadata: HookMetadata = {
      name: hookName,
      type: 'action',
      priority,
      namespace,
      description,
      async: handler.constructor.name === 'AsyncFunction',
    };

    const registeredHook: RegisteredHook = {
      id,
      metadata,
      handler: once ? this.wrapOnceHandler(hookName, id, handler, 'action') : handler,
      enabled: true,
      executionCount: 0,
    };

    // Store condition if provided
    if (condition) {
      (registeredHook as any).condition = condition;
    }

    this.addToRegistry(this.actions, hookName, registeredHook);
    this.logger.debug(`Registered action: ${hookName} (priority: ${priority}, namespace: ${namespace || 'global'})`);

    return id;
  }

  /**
   * Remove an action handler by ID
   */
  removeAction(hookName: string, handlerId: string): boolean {
    return this.removeFromRegistry(this.actions, hookName, handlerId);
  }

  /**
   * Execute all handlers for an action
   */
  async doAction<T = any>(
    hookName: string,
    payload?: T,
    contextMeta?: Record<string, any>,
  ): Promise<ActionResult> {
    const startTime = performance.now();
    const context = this.createContext(hookName, 'action', contextMeta);
    const errors: HookError[] = [];
    let handlersExecuted = 0;

    const handlers = this.actions.get(hookName) || [];
    const sortedHandlers = this.sortByPriority(handlers);

    for (const hook of sortedHandlers) {
      if (!hook.enabled) continue;

      // Check condition if exists
      if ((hook as any).condition) {
        const shouldRun = await (hook as any).condition(context);
        if (!shouldRun) continue;
      }

      try {
        const handlerStart = performance.now();
        await (hook.handler as ActionHandler<T>)(payload as T, context);
        const handlerTime = performance.now() - handlerStart;

        hook.executionCount++;
        hook.lastExecuted = new Date();
        hook.averageExecutionTime = hook.averageExecutionTime
          ? (hook.averageExecutionTime + handlerTime) / 2
          : handlerTime;

        handlersExecuted++;
      } catch (error) {
        this.errorCount++;
        errors.push({
          handlerId: hook.id,
          error: error as Error,
          timestamp: new Date(),
          recovered: true,
        });
        this.logger.error(`Error in action handler ${hook.id}: ${error}`);
      }
    }

    const executionTime = performance.now() - startTime;
    this.totalExecutions++;
    this.totalExecutionTime += executionTime;

    return {
      hookName,
      handlersExecuted,
      executionTime,
      errors,
      context,
    };
  }

  /**
   * Check if an action has any handlers
   */
  hasAction(hookName: string): boolean {
    const handlers = this.actions.get(hookName);
    return handlers ? handlers.some(h => h.enabled) : false;
  }

  // ============================================
  // Filter Registration & Execution
  // ============================================

  /**
   * Register a filter handler
   * Filters transform data through a pipeline
   */
  addFilter<T = any, R = T>(
    hookName: string,
    handler: FilterHandler<T, R>,
    options: FilterOptions = {},
  ): string {
    const id = this.generateHookId(hookName, 'filter');
    const { priority = 10, namespace, description, once = false, stopOnNull = false } = options;

    const metadata: HookMetadata = {
      name: hookName,
      type: 'filter',
      priority,
      namespace,
      description,
      async: handler.constructor.name === 'AsyncFunction',
    };

    const registeredHook: RegisteredHook = {
      id,
      metadata,
      handler: once ? this.wrapOnceHandler(hookName, id, handler, 'filter') : handler,
      enabled: true,
      executionCount: 0,
    };

    // Store stopOnNull option
    (registeredHook as any).stopOnNull = stopOnNull;

    this.addToRegistry(this.filters, hookName, registeredHook);
    this.logger.debug(`Registered filter: ${hookName} (priority: ${priority}, namespace: ${namespace || 'global'})`);

    return id;
  }

  /**
   * Remove a filter handler by ID
   */
  removeFilter(hookName: string, handlerId: string): boolean {
    return this.removeFromRegistry(this.filters, hookName, handlerId);
  }

  /**
   * Apply all filter handlers to transform a value
   */
  async applyFilters<T = any>(
    hookName: string,
    value: T,
    contextMeta?: Record<string, any>,
  ): Promise<FilterResult<T>> {
    const startTime = performance.now();
    const context = this.createContext(hookName, 'filter', contextMeta);
    const errors: HookError[] = [];
    const transformations: TransformationStep<T>[] = [];
    const originalValue = value;
    let currentValue = value;
    let handlersExecuted = 0;

    const handlers = this.filters.get(hookName) || [];
    const sortedHandlers = this.sortByPriority(handlers);

    for (const hook of sortedHandlers) {
      if (!hook.enabled) continue;

      const inputValue = currentValue;

      try {
        const handlerStart = performance.now();
        currentValue = await (hook.handler as FilterHandler<T>)(currentValue, context);
        const handlerTime = performance.now() - handlerStart;

        // Check stopOnNull
        if ((hook as any).stopOnNull && currentValue === null) {
          this.logger.debug(`Filter chain stopped at ${hook.id} due to null value`);
          break;
        }

        transformations.push({
          handlerId: hook.id,
          namespace: hook.metadata.namespace,
          priority: hook.metadata.priority,
          inputValue,
          outputValue: currentValue,
          executionTime: handlerTime,
        });

        hook.executionCount++;
        hook.lastExecuted = new Date();
        hook.averageExecutionTime = hook.averageExecutionTime
          ? (hook.averageExecutionTime + handlerTime) / 2
          : handlerTime;

        handlersExecuted++;
      } catch (error) {
        this.errorCount++;
        errors.push({
          handlerId: hook.id,
          error: error as Error,
          timestamp: new Date(),
          recovered: true,
        });
        this.logger.error(`Error in filter handler ${hook.id}: ${error}`);
        // Continue with current value on error
      }
    }

    const executionTime = performance.now() - startTime;
    this.totalExecutions++;
    this.totalExecutionTime += executionTime;

    return {
      hookName,
      originalValue,
      finalValue: currentValue,
      handlersExecuted,
      executionTime,
      transformations,
      errors,
      context,
    };
  }

  /**
   * Check if a filter has any handlers
   */
  hasFilter(hookName: string): boolean {
    const handlers = this.filters.get(hookName);
    return handlers ? handlers.some(h => h.enabled) : false;
  }

  // ============================================
  // AI Hook Registration & Execution
  // ============================================

  /**
   * Register an AI-powered hook handler
   */
  addAIHook<T = any, R = T>(
    hookName: string,
    handler: FilterHandler<T, R>,
    options: AIHookOptions,
  ): string {
    const id = this.generateHookId(hookName, 'ai');
    const { 
      priority = 10, 
      namespace, 
      description, 
      aiTask,
      model = 'gemini-3-pro-preview',
      fallbackOnError = true,
      cacheResults = true,
      cacheTTL = 3600,
    } = options;

    const aiConfig: AIHookConfig = {
      task: aiTask,
      model,
      fallbackOnError,
      cacheResults,
      cacheTTL,
    };

    const metadata: HookMetadata = {
      name: hookName,
      type: 'ai',
      priority,
      namespace,
      description,
      async: true, // AI hooks are always async
      aiConfig,
    };

    const registeredHook: RegisteredHook = {
      id,
      metadata,
      handler,
      enabled: true,
      executionCount: 0,
    };

    this.addToRegistry(this.aiHooks, hookName, registeredHook);
    this.logger.debug(`Registered AI hook: ${hookName} (task: ${aiTask}, model: ${model})`);

    return id;
  }

  /**
   * Remove an AI hook handler by ID
   */
  removeAIHook(hookName: string, handlerId: string): boolean {
    return this.removeFromRegistry(this.aiHooks, hookName, handlerId);
  }

  /**
   * Apply AI hooks to transform a value
   */
  async applyAIHooks<T = any>(
    hookName: string,
    value: T,
    contextMeta?: Record<string, any>,
  ): Promise<FilterResult<T>> {
    const startTime = performance.now();
    const context = this.createContext(hookName, 'ai', contextMeta);
    const errors: HookError[] = [];
    const transformations: TransformationStep<T>[] = [];
    const originalValue = value;
    let currentValue = value;
    let handlersExecuted = 0;

    const handlers = this.aiHooks.get(hookName) || [];
    const sortedHandlers = this.sortByPriority(handlers);

    for (const hook of sortedHandlers) {
      if (!hook.enabled) continue;

      const inputValue = currentValue;
      const aiConfig = hook.metadata.aiConfig!;

      try {
        const handlerStart = performance.now();
        currentValue = await (hook.handler as FilterHandler<T>)(currentValue, context);
        const handlerTime = performance.now() - handlerStart;

        transformations.push({
          handlerId: hook.id,
          namespace: hook.metadata.namespace,
          priority: hook.metadata.priority,
          inputValue,
          outputValue: currentValue,
          executionTime: handlerTime,
          aiProcessed: true,
        });

        hook.executionCount++;
        hook.lastExecuted = new Date();
        hook.averageExecutionTime = hook.averageExecutionTime
          ? (hook.averageExecutionTime + handlerTime) / 2
          : handlerTime;

        handlersExecuted++;
      } catch (error) {
        this.errorCount++;
        errors.push({
          handlerId: hook.id,
          error: error as Error,
          timestamp: new Date(),
          recovered: aiConfig.fallbackOnError,
        });

        if (!aiConfig.fallbackOnError) {
          throw error;
        }

        this.logger.error(`Error in AI hook handler ${hook.id}: ${error}`);
        // Continue with current value on error if fallback enabled
      }
    }

    const executionTime = performance.now() - startTime;
    this.totalExecutions++;
    this.totalExecutionTime += executionTime;

    return {
      hookName,
      originalValue,
      finalValue: currentValue,
      handlersExecuted,
      executionTime,
      transformations,
      errors,
      context,
    };
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Get all registered hooks for a given name
   */
  getHooks(hookName: string): RegisteredHook[] {
    return [
      ...(this.actions.get(hookName) || []),
      ...(this.filters.get(hookName) || []),
      ...(this.aiHooks.get(hookName) || []),
    ];
  }

  /**
   * Get all registered hook names
   */
  getAllHookNames(): string[] {
    const names = new Set<string>();
    this.actions.forEach((_, key) => names.add(key));
    this.filters.forEach((_, key) => names.add(key));
    this.aiHooks.forEach((_, key) => names.add(key));
    return Array.from(names);
  }

  /**
   * Enable a specific hook handler
   */
  enableHook(handlerId: string): boolean {
    return this.setHookEnabled(handlerId, true);
  }

  /**
   * Disable a specific hook handler
   */
  disableHook(handlerId: string): boolean {
    return this.setHookEnabled(handlerId, false);
  }

  /**
   * Get hook statistics
   */
  getStats(): HookStats {
    const hooksByNamespace: Record<string, number> = {};
    const executionData: Array<{ name: string; count: number; avgTime: number }> = [];

    const processRegistry = (registry: Map<string, RegisteredHook[]>) => {
      registry.forEach((hooks, hookName) => {
        hooks.forEach(hook => {
          const ns = hook.metadata.namespace || 'global';
          hooksByNamespace[ns] = (hooksByNamespace[ns] || 0) + 1;
          
          if (hook.executionCount > 0) {
            executionData.push({
              name: `${hookName}:${hook.id}`,
              count: hook.executionCount,
              avgTime: hook.averageExecutionTime || 0,
            });
          }
        });
      });
    };

    processRegistry(this.actions);
    processRegistry(this.filters);
    processRegistry(this.aiHooks);

    const sortedByCount = [...executionData].sort((a, b) => b.count - a.count);
    const sortedByTime = [...executionData].sort((a, b) => b.avgTime - a.avgTime);

    let actionCount = 0;
    let filterCount = 0;
    let aiCount = 0;

    this.actions.forEach(hooks => actionCount += hooks.length);
    this.filters.forEach(hooks => filterCount += hooks.length);
    this.aiHooks.forEach(hooks => aiCount += hooks.length);

    return {
      totalHooks: actionCount + filterCount + aiCount,
      actionHooks: actionCount,
      filterHooks: filterCount,
      aiHooks: aiCount,
      totalExecutions: this.totalExecutions,
      averageExecutionTime: this.totalExecutions > 0 
        ? this.totalExecutionTime / this.totalExecutions 
        : 0,
      errorRate: this.totalExecutions > 0 
        ? this.errorCount / this.totalExecutions 
        : 0,
      hooksByNamespace,
      mostExecutedHooks: sortedByCount.slice(0, 10).map(h => ({ name: h.name, count: h.count })),
      slowestHooks: sortedByTime.slice(0, 10).map(h => ({ name: h.name, avgTime: h.avgTime })),
    };
  }

  /**
   * Clear all hooks (useful for testing)
   */
  clearAll(): void {
    this.actions.clear();
    this.filters.clear();
    this.aiHooks.clear();
    this.totalExecutions = 0;
    this.totalExecutionTime = 0;
    this.errorCount = 0;
    this.logger.warn('All hooks cleared');
  }

  /**
   * Remove all hooks registered by a specific namespace (plugin)
   */
  async removeByNamespace(namespace: string): Promise<number> {
    let removed = 0;
    const registries = [
      { name: 'actions', registry: this.actions },
      { name: 'filters', registry: this.filters },
      { name: 'aiHooks', registry: this.aiHooks },
    ];

    for (const { registry } of registries) {
      for (const [hookName, hooks] of registry.entries()) {
        const original = hooks.length;
        const filtered = hooks.filter(h => h.metadata.namespace !== namespace);
        removed += original - filtered.length;
        
        if (filtered.length === 0) {
          registry.delete(hookName);
        } else if (filtered.length !== original) {
          registry.set(hookName, filtered);
        }
      }
    }

    if (removed > 0) {
      this.logger.log(`Removed ${removed} hook(s) from namespace: ${namespace}`);
    }

    return removed;
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private generateHookId(hookName: string, type: HookType): string {
    return `${type}_${hookName}_${uuidv4().substring(0, 8)}`;
  }

  private createContext(
    hookName: string,
    hookType: HookType,
    metadata?: Record<string, any>,
  ): HookContext {
    return {
      hookName,
      hookType,
      timestamp: new Date(),
      requestId: metadata?.requestId,
      userId: metadata?.userId,
      metadata,
    };
  }

  private addToRegistry(
    registry: Map<string, RegisteredHook[]>,
    hookName: string,
    hook: RegisteredHook,
  ): void {
    const existing = registry.get(hookName) || [];
    existing.push(hook);
    registry.set(hookName, existing);
  }

  private removeFromRegistry(
    registry: Map<string, RegisteredHook[]>,
    hookName: string,
    handlerId: string,
  ): boolean {
    const hooks = registry.get(hookName);
    if (!hooks) return false;

    const index = hooks.findIndex(h => h.id === handlerId);
    if (index === -1) return false;

    hooks.splice(index, 1);
    return true;
  }

  private sortByPriority(hooks: RegisteredHook[]): RegisteredHook[] {
    return [...hooks].sort((a, b) => a.metadata.priority - b.metadata.priority);
  }

  private setHookEnabled(handlerId: string, enabled: boolean): boolean {
    const registries = [this.actions, this.filters, this.aiHooks];

    for (const registry of registries) {
      for (const hooks of registry.values()) {
        const hook = hooks.find(h => h.id === handlerId);
        if (hook) {
          hook.enabled = enabled;
          return true;
        }
      }
    }

    return false;
  }

  private wrapOnceHandler<T>(
    hookName: string,
    handlerId: string,
    handler: HookHandler,
    type: 'action' | 'filter',
  ): HookHandler {
    let executed = false;
    
    return async (payload: T, context: HookContext) => {
      if (executed) return type === 'filter' ? payload : undefined;
      
      executed = true;
      const result = await (handler as any)(payload, context);
      
      // Auto-remove after execution
      if (type === 'action') {
        this.removeAction(hookName, handlerId);
      } else {
        this.removeFilter(hookName, handlerId);
      }
      
      return result;
    };
  }
}
