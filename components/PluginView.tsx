import React, { useEffect, useState } from 'react';
import { useCMS } from '../contexts/CMSContext';

interface PluginViewProps {
  pluginSlug: string;
}

/**
 * Dynamic Plugin View Loader
 * 
 * Loads and renders plugin admin components dynamically based on the plugin slug.
 * When a plugin registers an admin menu via registerAdminMenu(), the component
 * path is stored in the menu metadata. This component lazy-loads that component
 * and renders it within the admin layout.
 * 
 * Example plugin registration:
 * ```typescript
 * registerAdminMenu: (api) => {
 *   api.addSubmenuPage('appearance', {
 *     menuTitle: '🤖 AI Theme Factory',
 *     menuSlug: 'ai-theme-factory',
 *     component: 'ThemeFactoryAdminPage', // Component name in plugin folder
 *   });
 * }
 * ```
 */
const PluginView: React.FC<PluginViewProps> = ({ pluginSlug }) => {
  const { pluginMenuItems } = useCMS();
  const [PluginComponent, setPluginComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPluginComponent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Find the plugin menu item that matches this slug
        const menuItem = pluginMenuItems.find((item: any) => item.menuSlug === pluginSlug);
        
        if (!menuItem) {
          setError(`Plugin menu item not found for slug: ${pluginSlug}`);
          setLoading(false);
          return;
        }

        console.log('[PluginView] Loading plugin component:', {
          slug: pluginSlug,
          component: menuItem.component,
          menuItem
        });

        // Extract plugin slug from menu item
        const pluginId = menuItem.pluginSlug;
        const componentName = menuItem.component;

        if (!componentName) {
          setError(`No component specified for plugin: ${pluginSlug}`);
          setLoading(false);
          return;
        }

        // Dynamically import the plugin's component
        // Plugin structure: plugins/{pluginSlug}/components/{ComponentName}.tsx
        const componentPath = `/plugins/${pluginId}/components/${componentName}.tsx`;
        
        console.log('[PluginView] Attempting to load:', componentPath);

        try {
          const module = await import(
            /* @vite-ignore */
            componentPath + `?t=${Date.now()}`
          );

          if (module.default) {
            setPluginComponent(() => module.default);
            console.log('[PluginView] Successfully loaded plugin component');
          } else {
            setError(`Plugin component does not have a default export: ${componentPath}`);
          }
        } catch (importError: any) {
          console.error('[PluginView] Failed to load plugin component:', importError);
          
          // Try alternative path: plugins/{pluginId}/{ComponentName}.tsx
          const altPath = `/plugins/${pluginId}/${componentName}.tsx`;
          console.log('[PluginView] Trying alternative path:', altPath);
          
          try {
            const altModule = await import(
              /* @vite-ignore */
              altPath + `?t=${Date.now()}`
            );
            
            if (altModule.default) {
              setPluginComponent(() => altModule.default);
              console.log('[PluginView] Successfully loaded from alternative path');
            } else {
              setError(`Plugin component does not have a default export: ${altPath}`);
            }
          } catch (altError: any) {
            setError(`Failed to load plugin component. Tried:\n1. ${componentPath}\n2. ${altPath}\n\nError: ${importError.message || importError}`);
          }
        }
      } catch (err: any) {
        console.error('[PluginView] Error loading plugin:', err);
        setError(err.message || 'Unknown error loading plugin component');
      } finally {
        setLoading(false);
      }
    };

    loadPluginComponent();
  }, [pluginSlug, pluginMenuItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading plugin component...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <svg 
            className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Failed to Load Plugin Component
            </h3>
            <pre className="text-sm text-red-800 bg-red-100 p-4 rounded whitespace-pre-wrap font-mono">
              {error}
            </pre>
            <p className="mt-4 text-sm text-red-700">
              Please ensure the plugin component file exists and exports a default React component.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!PluginComponent) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <svg 
            className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Plugin Component Not Found
            </h3>
            <p className="text-sm text-yellow-800">
              The plugin component could not be loaded. This may be a configuration issue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render the dynamically loaded plugin component
  return <PluginComponent />;
};

export default PluginView;
