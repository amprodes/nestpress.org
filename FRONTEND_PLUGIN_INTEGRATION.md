# Frontend Plugin Integration Guide

## Current Status

### ✅ Backend Plugin System (Complete)
- Plugin loader with hook system
- Admin menu registration (add_menu_page, add_submenu_page)
- Hook execution (actions and filters)
- Plugin API with full WordPress compatibility

### ⚠️ Frontend Plugin Integration (Missing)

**Problem:** Plugins can register hooks on the backend, but frontend theme templates don't execute plugin filters/actions during rendering.

---

## What's Missing

### 1. Frontend Hook Execution in Templates

Templates currently render static content without applying plugin filters:

```tsx
// Current: templates/single.tsx
<div dangerouslySetInnerHTML={{ __html: post.content }} />
```

**Should be:**
```tsx
// With plugin filters
const filteredContent = await applyFilters('post:content', post.content);
<div dangerouslySetInnerHTML={{ __html: filteredContent }} />
```

### 2. Plugin Scripts/Styles Loading

Plugins need to inject custom CSS/JS into frontend pages:

```typescript
// Plugin API should support
api.enqueueStyle('my-plugin-css', '/plugins/my-plugin/style.css');
api.enqueueScript('my-plugin-js', '/plugins/my-plugin/script.js');
```

### 3. Plugin Frontend Components

Plugins should be able to register React components for frontend rendering:

```typescript
// Plugin registers widget
api.registerWidget('my-custom-widget', MyWidgetComponent);

// Theme renders it
<PluginWidgetArea location="sidebar" />
```

---

## Solution Architecture

### Backend Changes

#### 1. Add Frontend Asset Registration to Plugin API

**File:** `backend/src/modules/plugins/interfaces/plugin.interfaces.ts`

```typescript
export interface PluginAPI {
  // ... existing methods
  
  // Frontend asset loading
  enqueueStyle: (handle: string, src: string, deps?: string[], version?: string) => void;
  enqueueScript: (handle: string, src: string, deps?: string[], version?: string, inFooter?: boolean) => void;
  
  // Widget registration
  registerWidget: (id: string, component: any) => void;
  
  // Template hooks
  addTemplateHook: (templateType: string, position: string, callback: Function) => void;
}
```

#### 2. Store Frontend Assets in Plugin Loader

**File:** `backend/src/modules/plugins/plugin-loader.service.ts`

```typescript
@Injectable()
export class PluginLoaderService {
  private pluginStyles: Array<{plugin: string, handle: string, src: string}> = [];
  private pluginScripts: Array<{plugin: string, handle: string, src: string}> = [];
  private pluginWidgets: Map<string, any> = new Map();
  
  // Expose via API endpoint
  getPluginAssets(): { styles: any[], scripts: any[] } {
    return {
      styles: this.pluginStyles.filter(s => this.activePlugins.has(s.plugin)),
      scripts: this.pluginScripts.filter(s => this.activePlugins.has(s.plugin)),
    };
  }
  
  getPluginWidgets(): Map<string, any> {
    return this.pluginWidgets;
  }
}
```

#### 3. Add Assets Endpoint

**File:** `backend/src/modules/plugins/plugins.controller.ts`

```typescript
@Get('assets')
@Public()
async getAssets() {
  return this.pluginsService.getPluginAssets();
}

@Get('widgets')
@Public()
async getWidgets() {
  return this.pluginsService.getPluginWidgets();
}
```

### Frontend Changes

#### 1. Load Plugin Assets in WebsiteFrontend

**File:** `components/templates/WebsiteFrontend.tsx`

```tsx
const WebsiteFrontend: React.FC<Props> = ({ themeId }) => {
  const [pluginAssets, setPluginAssets] = useState<any>(null);
  
  useEffect(() => {
    // Load plugin assets
    pluginsApi.getAssets().then(assets => {
      setPluginAssets(assets);
      
      // Inject styles
      assets.styles.forEach(style => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = style.src;
        link.id = `plugin-style-${style.handle}`;
        document.head.appendChild(link);
      });
      
      // Inject scripts
      assets.scripts.forEach(script => {
        const scriptEl = document.createElement('script');
        scriptEl.src = script.src;
        scriptEl.id = `plugin-script-${script.handle}`;
        document.body.appendChild(scriptEl);
      });
    });
    
    return () => {
      // Cleanup on unmount
      pluginAssets?.styles.forEach(style => {
        document.getElementById(`plugin-style-${style.handle}`)?.remove();
      });
      pluginAssets?.scripts.forEach(script => {
        document.getElementById(`plugin-script-${script.handle}`)?.remove();
      });
    };
  }, [themeId]);
  
  // ... rest of component
};
```

#### 2. Add Hook Execution in Templates

**File:** `themes/default/templates/single.tsx`

```tsx
import { useNestPressFilteredValue } from '@/hooks/nestpress-hooks';

const SingleTemplate: React.FC<ThemeTemplateProps> = ({ post }) => {
  // Apply plugin filters to content
  const { value: filteredContent } = useNestPressFilteredValue(
    'post:content',
    post.content,
    { postId: post.id, postType: 'post' }
  );
  
  // Apply filters to title
  const { value: filteredTitle } = useNestPressFilteredValue(
    'post:title',
    post.title,
    { postId: post.id }
  );
  
  return (
    <article>
      <h1>{filteredTitle}</h1>
      <div dangerouslySetInnerHTML={{ __html: filteredContent }} />
    </article>
  );
};
```

#### 3. Create PluginWidgetArea Component

**File:** `components/common/PluginWidgetArea.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { pluginsApi } from '@/services/api';

interface Props {
  location: 'sidebar' | 'header' | 'footer' | 'content';
  className?: string;
}

export const PluginWidgetArea: React.FC<Props> = ({ location, className }) => {
  const [widgets, setWidgets] = useState<any[]>([]);
  
  useEffect(() => {
    pluginsApi.getWidgets().then(data => {
      const filtered = data.filter(w => w.location === location);
      setWidgets(filtered);
    });
  }, [location]);
  
  if (widgets.length === 0) return null;
  
  return (
    <div className={`plugin-widget-area widget-area-${location} ${className || ''}`}>
      {widgets.map((widget, i) => {
        const Component = widget.component;
        return <Component key={widget.id || i} {...widget.props} />;
      })}
    </div>
  );
};
```

---

## Implementation Priority

### Phase 1: Hook Execution (High Priority)
- [x] Backend hooks working
- [ ] Frontend hook execution in templates
- [ ] Apply filters to post content
- [ ] Apply filters to post titles
- [ ] Apply actions before/after content

### Phase 2: Asset Loading (Medium Priority)
- [ ] Plugin asset registration API
- [ ] Backend storage of styles/scripts
- [ ] Frontend asset injection
- [ ] Cleanup on plugin deactivation

### Phase 3: Widget System (Low Priority)
- [ ] Widget registration API
- [ ] Widget storage and retrieval
- [ ] PluginWidgetArea component
- [ ] Widget customization UI

---

## Example Plugin with Frontend Integration

```typescript
/**
 * Plugin Name: Content Enhancer
 * Description: Adds features to frontend content
 */

const ContentEnhancer = {
  registerHooks: (api) => {
    // Backend content filter
    api.addFilter('post:content_filter', async (content, ctx) => {
      // Add reading time
      const words = content.split(/\s+/).length;
      const minutes = Math.ceil(words / 200);
      return `<div class="reading-time">${minutes} min read</div>${content}`;
    }, 5);
  },
  
  setup: async (api) => {
    // Enqueue frontend assets
    api.enqueueStyle('content-enhancer-css', '/plugins/content-enhancer/style.css');
    api.enqueueScript('content-enhancer-js', '/plugins/content-enhancer/script.js', [], '1.0.0', true);
    
    // Register widget
    api.registerWidget('reading-progress', {
      location: 'content',
      component: 'ReadingProgressBar',
    });
  },
};

export default ContentEnhancer;
```

---

## Testing Frontend Integration

### 1. Test Hook Filters

```typescript
// Plugin adds content
api.addFilter('post:content', (content) => {
  return content + '<p>Added by plugin!</p>';
});

// Frontend template applies filter
const { value: filteredContent } = useNestPressFilteredValue('post:content', post.content);
// Should include "Added by plugin!"
```

### 2. Test Asset Loading

```typescript
// Plugin registers CSS
api.enqueueStyle('my-plugin', '/plugins/my-plugin/style.css');

// Frontend loads it
// Check: document.querySelector('link[href*="my-plugin/style.css"]')
```

### 3. Test Widget Rendering

```typescript
// Plugin registers widget
api.registerWidget('my-widget', MyComponent);

// Theme renders it
<PluginWidgetArea location="sidebar" />
// Should render MyComponent
```

---

## WordPress Feature Comparison

| Feature | WordPress | NestPress Backend | NestPress Frontend |
|---------|-----------|-------------------|-------------------|
| Content Filters | ✅ `apply_filters('the_content')` | ✅ Backend | ⚠️ TODO |
| Template Actions | ✅ `do_action('wp_head')` | ✅ Backend | ⚠️ TODO |
| Enqueue Scripts | ✅ `wp_enqueue_script()` | ⚠️ TODO | ⚠️ TODO |
| Enqueue Styles | ✅ `wp_enqueue_style()` | ⚠️ TODO | ⚠️ TODO |
| Widgets | ✅ `register_widget()` | ⚠️ TODO | ⚠️ TODO |
| Shortcodes | ✅ `add_shortcode()` | ✅ Backend | ⚠️ TODO |

---

## Next Steps

1. **Add useNestPressFilteredValue to templates** (Quick win)
   - Update all theme templates to use filtered values
   - Test with hello-nestpress plugin
   
2. **Implement asset loading** (Medium effort)
   - Add enqueueStyle/enqueueScript to Plugin API
   - Create assets endpoint
   - Load assets in WebsiteFrontend
   
3. **Create widget system** (Complex)
   - Widget registration API
   - PluginWidgetArea component
   - Widget customization UI in admin

---

## Files to Update

### Backend
- [ ] `backend/src/modules/plugins/interfaces/plugin.interfaces.ts` - Add asset methods
- [ ] `backend/src/modules/plugins/plugin-loader.service.ts` - Store assets/widgets
- [ ] `backend/src/modules/plugins/plugins.controller.ts` - Add endpoints
- [ ] `backend/src/modules/plugins/plugins.service.ts` - Service methods

### Frontend
- [ ] `themes/default/templates/*.tsx` - Add hook execution
- [ ] `components/templates/WebsiteFrontend.tsx` - Load plugin assets
- [ ] `components/common/PluginWidgetArea.tsx` - New component
- [ ] `services/api.ts` - Add getAssets, getWidgets

---

**Status:** Backend plugin system is complete. Frontend integration is the missing piece for 100% WordPress parity.

**Recommendation:** Start with hook execution in templates (Phase 1) as it's the highest priority and easiest to implement.
