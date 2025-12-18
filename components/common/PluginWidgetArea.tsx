/**
 * Plugin Widget Area Component
 * WordPress equivalent: dynamic_sidebar()
 * 
 * Renders widgets registered by plugins in specified locations
 */

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';

interface WidgetOptions {
  id?: string;
  title: string;
  description?: string;
  location: string;
  component?: string;
  render?: (props: any) => React.ReactNode;
  props?: Record<string, any>;
  priority?: number;
}

interface PluginWidgetAreaProps {
  location: 'sidebar' | 'footer' | 'header' | 'before-content' | 'after-content' | string;
  className?: string;
}

/**
 * PluginWidgetArea Component
 * Displays widgets from active plugins at a specific location
 */
export const PluginWidgetArea: React.FC<PluginWidgetAreaProps> = ({ location, className = '' }) => {
  const [widgets, setWidgets] = useState<WidgetOptions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWidgets();
  }, [location]);

  const loadWidgets = async () => {
    try {
      const allWidgets = await api.plugins.getWidgets();
      
      // Filter widgets for this location and sort by priority
      const locationWidgets = allWidgets
        .filter((w: WidgetOptions) => w.location === location)
        .sort((a: WidgetOptions, b: WidgetOptions) => (a.priority || 10) - (b.priority || 10));
      
      setWidgets(locationWidgets);
    } catch (error) {
      console.error('Failed to load plugin widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="plugin-widget-area-loading">Loading widgets...</div>;
  }

  if (widgets.length === 0) {
    return null;
  }

  return (
    <div className={`plugin-widget-area plugin-widget-area-${location} ${className}`}>
      {widgets.map((widget, index) => (
        <div key={widget.id || index} className="plugin-widget" data-location={location}>
          {widget.title && (
            <div className="plugin-widget-title">
              <h3>{widget.title}</h3>
              {widget.description && (
                <p className="plugin-widget-description">{widget.description}</p>
              )}
            </div>
          )}
          <div className="plugin-widget-content">
            {widget.render ? (
              widget.render(widget.props || {})
            ) : (
              <div className="plugin-widget-placeholder">
                Widget: {widget.title}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Hook to check if a widget location has registered widgets
 * WordPress equivalent: is_active_sidebar()
 */
export const useHasWidgets = (location: string): boolean => {
  const [hasWidgets, setHasWidgets] = useState(false);

  useEffect(() => {
    const checkWidgets = async () => {
      try {
        const allWidgets = await api.plugins.getWidgets();
        const locationWidgets = allWidgets.filter((w: WidgetOptions) => w.location === location);
        setHasWidgets(locationWidgets.length > 0);
      } catch (error) {
        console.error('Failed to check widgets:', error);
      }
    };

    checkWidgets();
  }, [location]);

  return hasWidgets;
};

export default PluginWidgetArea;
