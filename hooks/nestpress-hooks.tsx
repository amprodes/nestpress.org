/**
 * NestPress Frontend Hook System
 * WordPress-like hooks for React - actions, filters, and AI hooks
 */

import React, { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';

// ============================================
// Types
// ============================================

export type NestPressHookType = 'action' | 'filter';

export interface NestPressHookHandler<T = any, R = T> {
  (value: T, context: NestPressHookContext): R | Promise<R>;
}

export interface NestPressHookContext {
  hookName: string;
  hookType: NestPressHookType;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface NestPressRegisteredHook<T = any, R = T> {
  id: string;
  hookName: string;
  type: NestPressHookType;
  priority: number;
  handler: NestPressHookHandler<T, R>;
  namespace?: string;
}

export interface NestPressHookOptions {
  priority?: number;
  namespace?: string;
  once?: boolean;
}

// ============================================
// Hook Registry (Singleton)
// ============================================

class NestPressHookRegistry {
  private actions = new Map<string, NestPressRegisteredHook[]>();
  private filters = new Map<string, NestPressRegisteredHook[]>();
  private idCounter = 0;

  // Actions
  addAction<T = any>(
    hookName: string,
    handler: NestPressHookHandler<T, void>,
    options: NestPressHookOptions = {},
  ): string {
    const id = `np_action_${hookName}_${++this.idCounter}`;
    const { priority = 10, namespace, once = false } = options;

    const hook: NestPressRegisteredHook<T, void> = {
      id,
      hookName,
      type: 'action',
      priority,
      handler: once ? this.wrapOnce(hookName, id, handler, 'action') : handler,
      namespace,
    };

    const existing = this.actions.get(hookName) || [];
    existing.push(hook as NestPressRegisteredHook);
    this.actions.set(hookName, existing);

    return id;
  }

  removeAction(hookName: string, handlerId: string): boolean {
    const hooks = this.actions.get(hookName);
    if (!hooks) return false;

    const index = hooks.findIndex(h => h.id === handlerId);
    if (index === -1) return false;

    hooks.splice(index, 1);
    return true;
  }

  async doAction<T = any>(
    hookName: string,
    payload?: T,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const handlers = this.actions.get(hookName) || [];
    const sorted = this.sortByPriority(handlers);
    const context: NestPressHookContext = {
      hookName,
      hookType: 'action',
      timestamp: new Date(),
      metadata,
    };

    for (const hook of sorted) {
      try {
        await hook.handler(payload, context);
      } catch (error) {
        console.error(`[NestPress Hooks] Error in action handler ${hook.id}:`, error);
      }
    }
  }

  // Filters
  addFilter<T = any, R = T>(
    hookName: string,
    handler: NestPressHookHandler<T, R>,
    options: NestPressHookOptions = {},
  ): string {
    const id = `np_filter_${hookName}_${++this.idCounter}`;
    const { priority = 10, namespace, once = false } = options;

    const hook: NestPressRegisteredHook<T, R> = {
      id,
      hookName,
      type: 'filter',
      priority,
      handler: once ? this.wrapOnce(hookName, id, handler, 'filter') : handler,
      namespace,
    };

    const existing = this.filters.get(hookName) || [];
    existing.push(hook as NestPressRegisteredHook);
    this.filters.set(hookName, existing);

    return id;
  }

  removeFilter(hookName: string, handlerId: string): boolean {
    const hooks = this.filters.get(hookName);
    if (!hooks) return false;

    const index = hooks.findIndex(h => h.id === handlerId);
    if (index === -1) return false;

    hooks.splice(index, 1);
    return true;
  }

  async applyFilters<T = any>(
    hookName: string,
    value: T,
    metadata?: Record<string, any>,
  ): Promise<T> {
    const handlers = this.filters.get(hookName) || [];
    const sorted = this.sortByPriority(handlers);
    const context: NestPressHookContext = {
      hookName,
      hookType: 'filter',
      timestamp: new Date(),
      metadata,
    };

    let result = value;
    for (const hook of sorted) {
      try {
        result = await hook.handler(result, context);
      } catch (error) {
        console.error(`[NestPress Hooks] Error in filter handler ${hook.id}:`, error);
      }
    }

    return result;
  }

  // Utilities
  hasAction(hookName: string): boolean {
    return (this.actions.get(hookName)?.length || 0) > 0;
  }

  hasFilter(hookName: string): boolean {
    return (this.filters.get(hookName)?.length || 0) > 0;
  }

  getAllHooks(): { actions: string[]; filters: string[] } {
    return {
      actions: Array.from(this.actions.keys()),
      filters: Array.from(this.filters.keys()),
    };
  }

  getHookCount(hookName: string): number {
    return (this.actions.get(hookName)?.length || 0) + 
           (this.filters.get(hookName)?.length || 0);
  }

  clear(): void {
    this.actions.clear();
    this.filters.clear();
  }

  private sortByPriority(hooks: NestPressRegisteredHook[]): NestPressRegisteredHook[] {
    return [...hooks].sort((a, b) => a.priority - b.priority);
  }

  private wrapOnce<T, R>(
    hookName: string,
    handlerId: string,
    handler: NestPressHookHandler<T, R>,
    type: 'action' | 'filter',
  ): NestPressHookHandler<T, R> {
    let executed = false;
    return async (value: T, context: NestPressHookContext) => {
      if (executed) return value as unknown as R;
      executed = true;
      const result = await handler(value, context);
      if (type === 'action') {
        this.removeAction(hookName, handlerId);
      } else {
        this.removeFilter(hookName, handlerId);
      }
      return result;
    };
  }
}

// Singleton instance
export const nestPressHooks = new NestPressHookRegistry();

// ============================================
// React Context
// ============================================

interface NestPressHookContextValue {
  addAction: typeof nestPressHooks.addAction;
  removeAction: typeof nestPressHooks.removeAction;
  doAction: typeof nestPressHooks.doAction;
  addFilter: typeof nestPressHooks.addFilter;
  removeFilter: typeof nestPressHooks.removeFilter;
  applyFilters: typeof nestPressHooks.applyFilters;
  hasAction: typeof nestPressHooks.hasAction;
  hasFilter: typeof nestPressHooks.hasFilter;
}

const NestPressHookContext = createContext<NestPressHookContextValue | null>(null);

export const NestPressHookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: NestPressHookContextValue = {
    addAction: nestPressHooks.addAction.bind(nestPressHooks),
    removeAction: nestPressHooks.removeAction.bind(nestPressHooks),
    doAction: nestPressHooks.doAction.bind(nestPressHooks),
    addFilter: nestPressHooks.addFilter.bind(nestPressHooks),
    removeFilter: nestPressHooks.removeFilter.bind(nestPressHooks),
    applyFilters: nestPressHooks.applyFilters.bind(nestPressHooks),
    hasAction: nestPressHooks.hasAction.bind(nestPressHooks),
    hasFilter: nestPressHooks.hasFilter.bind(nestPressHooks),
  };

  return (
    <NestPressHookContext.Provider value={value}>
      {children}
    </NestPressHookContext.Provider>
  );
};

// ============================================
// React Hooks
// ============================================

/**
 * Access the NestPress hook system
 */
export function useNestPressHooks(): NestPressHookContextValue {
  const context = useContext(NestPressHookContext);
  if (!context) {
    // Return direct registry access if not in provider
    return {
      addAction: nestPressHooks.addAction.bind(nestPressHooks),
      removeAction: nestPressHooks.removeAction.bind(nestPressHooks),
      doAction: nestPressHooks.doAction.bind(nestPressHooks),
      addFilter: nestPressHooks.addFilter.bind(nestPressHooks),
      removeFilter: nestPressHooks.removeFilter.bind(nestPressHooks),
      applyFilters: nestPressHooks.applyFilters.bind(nestPressHooks),
      hasAction: nestPressHooks.hasAction.bind(nestPressHooks),
      hasFilter: nestPressHooks.hasFilter.bind(nestPressHooks),
    };
  }
  return context;
}

/**
 * Register an action handler that auto-cleans up on unmount
 */
export function useNestPressAction<T = any>(
  hookName: string,
  handler: NestPressHookHandler<T, void>,
  options: NestPressHookOptions = {},
  deps: any[] = [],
): void {
  const { addAction, removeAction } = useNestPressHooks();
  const handlerRef = useRef(handler);
  
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const wrappedHandler: NestPressHookHandler<T, void> = (value, context) => {
      return handlerRef.current(value, context);
    };

    const handlerId = addAction(hookName, wrappedHandler, options);

    return () => {
      removeAction(hookName, handlerId);
    };
  }, [hookName, ...deps]);
}

/**
 * Register a filter handler that auto-cleans up on unmount
 */
export function useNestPressFilter<T = any, R = T>(
  hookName: string,
  handler: NestPressHookHandler<T, R>,
  options: NestPressHookOptions = {},
  deps: any[] = [],
): void {
  const { addFilter, removeFilter } = useNestPressHooks();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const wrappedHandler: NestPressHookHandler<T, R> = (value, context) => {
      return handlerRef.current(value, context);
    };

    const handlerId = addFilter(hookName, wrappedHandler, options);

    return () => {
      removeFilter(hookName, handlerId);
    };
  }, [hookName, ...deps]);
}

/**
 * Apply filters to a value and get the result
 */
export function useNestPressFilteredValue<T = any>(
  hookName: string,
  initialValue: T,
  metadata?: Record<string, any>,
): { value: T; isFiltering: boolean } {
  const { applyFilters } = useNestPressHooks();
  const [value, setValue] = useState<T>(initialValue);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsFiltering(true);
    
    applyFilters(hookName, initialValue, metadata).then(result => {
      if (mounted) {
        setValue(result);
        setIsFiltering(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [hookName, initialValue]);

  return { value, isFiltering };
}

/**
 * Trigger an action and track loading state
 */
export function useNestPressActionTrigger<T = any>(
  hookName: string,
): {
  trigger: (payload?: T, metadata?: Record<string, any>) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
} {
  const { doAction } = useNestPressHooks();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const trigger = useCallback(async (payload?: T, metadata?: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      await doAction(hookName, payload, metadata);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [hookName, doAction]);

  return { trigger, isLoading, error };
}

// ============================================
// Pre-defined UI Hook Names
// ============================================

export const NestPressUIHooks = {
  // Editor hooks
  EDITOR_INIT: 'nestpress:editor:init',
  EDITOR_BEFORE_SAVE: 'nestpress:editor:before_save',
  EDITOR_AFTER_SAVE: 'nestpress:editor:after_save',
  EDITOR_CONTENT_FILTER: 'nestpress:editor:content_filter',
  EDITOR_TOOLBAR_ITEMS: 'nestpress:editor:toolbar_items',
  EDITOR_SIDEBAR_PANELS: 'nestpress:editor:sidebar_panels',
  
  // Dashboard hooks
  DASHBOARD_INIT: 'nestpress:dashboard:init',
  DASHBOARD_WIDGETS: 'nestpress:dashboard:widgets',
  DASHBOARD_STATS_FILTER: 'nestpress:dashboard:stats_filter',
  DASHBOARD_QUICK_ACTIONS: 'nestpress:dashboard:quick_actions',
  
  // Sidebar/Navigation hooks
  SIDEBAR_MENU_ITEMS: 'nestpress:sidebar:menu_items',
  SIDEBAR_FOOTER: 'nestpress:sidebar:footer',
  ADMIN_BAR_ITEMS: 'nestpress:admin_bar:items',
  
  // List/Table hooks
  LIST_COLUMNS: 'nestpress:list:columns',
  LIST_ROW_ACTIONS: 'nestpress:list:row_actions',
  LIST_BULK_ACTIONS: 'nestpress:list:bulk_actions',
  LIST_FILTERS: 'nestpress:list:filters',
  LIST_BEFORE_RENDER: 'nestpress:list:before_render',
  
  // Form hooks
  FORM_FIELDS: 'nestpress:form:fields',
  FORM_VALIDATION: 'nestpress:form:validation',
  FORM_BEFORE_SUBMIT: 'nestpress:form:before_submit',
  FORM_AFTER_SUBMIT: 'nestpress:form:after_submit',
  
  // Media hooks
  MEDIA_BEFORE_UPLOAD: 'nestpress:media:before_upload',
  MEDIA_AFTER_UPLOAD: 'nestpress:media:after_upload',
  MEDIA_GALLERY_ACTIONS: 'nestpress:media:gallery_actions',
  MEDIA_ITEM_ACTIONS: 'nestpress:media:item_actions',
  
  // Theme/Appearance hooks
  THEME_COLORS_FILTER: 'nestpress:theme:colors_filter',
  THEME_FONTS_FILTER: 'nestpress:theme:fonts_filter',
  THEME_CUSTOMIZER_PANELS: 'nestpress:theme:customizer_panels',
  
  // Settings hooks
  SETTINGS_TABS: 'nestpress:settings:tabs',
  SETTINGS_FIELDS: 'nestpress:settings:fields',
  SETTINGS_BEFORE_SAVE: 'nestpress:settings:before_save',
  
  // Commerce hooks
  PRODUCT_PRICE_FILTER: 'nestpress:product:price_filter',
  CART_ITEM_FILTER: 'nestpress:cart:item_filter',
  CHECKOUT_FIELDS: 'nestpress:checkout:fields',
  ORDER_STATUS_ACTIONS: 'nestpress:order:status_actions',
  
  // General UI hooks
  PAGE_TITLE_FILTER: 'nestpress:page:title_filter',
  HEADER_ACTIONS: 'nestpress:header:actions',
  FOOTER_CONTENT: 'nestpress:footer:content',
  MODAL_CONTENT: 'nestpress:modal:content',
  NOTIFICATION: 'nestpress:notification',
  
  // AI-related hooks
  AI_CONTENT_SUGGESTIONS: 'nestpress:ai:content_suggestions',
  AI_SEO_RECOMMENDATIONS: 'nestpress:ai:seo_recommendations',
  AI_IMAGE_ANALYSIS: 'nestpress:ai:image_analysis',
} as const;

// ============================================
// Utility Functions
// ============================================

/**
 * Create a scoped hook system for a plugin/module
 */
export function createNestPressScopedHooks(namespace: string) {
  return {
    addAction: <T = any>(
      hookName: string,
      handler: NestPressHookHandler<T, void>,
      options: Omit<NestPressHookOptions, 'namespace'> = {},
    ) => nestPressHooks.addAction(hookName, handler, { ...options, namespace }),

    addFilter: <T = any, R = T>(
      hookName: string,
      handler: NestPressHookHandler<T, R>,
      options: Omit<NestPressHookOptions, 'namespace'> = {},
    ) => nestPressHooks.addFilter(hookName, handler, { ...options, namespace }),

    doAction: nestPressHooks.doAction.bind(nestPressHooks),
    applyFilters: nestPressHooks.applyFilters.bind(nestPressHooks),
  };
}

/**
 * Batch register multiple hooks
 */
export function registerNestPressHooks(hooks: {
  actions?: Array<{ name: string; handler: NestPressHookHandler; options?: NestPressHookOptions }>;
  filters?: Array<{ name: string; handler: NestPressHookHandler; options?: NestPressHookOptions }>;
}): string[] {
  const ids: string[] = [];

  hooks.actions?.forEach(({ name, handler, options }) => {
    ids.push(nestPressHooks.addAction(name, handler, options));
  });

  hooks.filters?.forEach(({ name, handler, options }) => {
    ids.push(nestPressHooks.addFilter(name, handler, options));
  });

  return ids;
}

// Export convenient aliases
export {
  nestPressHooks as hooks,
  NestPressHookProvider as HookProvider,
  useNestPressHooks as useHooks,
  useNestPressAction as useAction,
  useNestPressFilter as useFilter,
  useNestPressFilteredValue as useFilteredValue,
  useNestPressActionTrigger as useActionTrigger,
  NestPressUIHooks as UIHooks,
};
