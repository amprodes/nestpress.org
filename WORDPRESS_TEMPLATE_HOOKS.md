# WordPress-like Template Hooks in NestPress

NestPress implements WordPress template hooks to provide a familiar, extensible template system. This document explains how header, footer, and body hooks work.

## Overview

Just like WordPress, NestPress provides hooks that fire at specific points in the template rendering process:

| WordPress Function | NestPress Hook | Description |
|-------------------|----------------|-------------|
| `wp_head()` | `wp_head` action | Fires in `<head>` - add meta tags, styles, scripts |
| `wp_body_open()` | `wp_body_open` action | Fires after `<body>` tag (WordPress 5.2+) |
| `wp_footer()` | `wp_footer` action | Fires before `</body>` - add footer scripts, analytics |
| `body_class()` | `body_class` filter | Filters CSS classes applied to `<body>` element |

## Architecture

### Header Component
Located in `themes/{theme-slug}/index.tsx`:

```typescript
export function SiteNav({ primaryMenu, header }: { 
  primaryMenu?: Menu; 
  header?: HeaderSettings 
}) {
  const logoText = header?.logoText || 'NestPress';
  const bgColor = header?.backgroundColor || '#fff';
  const textColor = header?.textColor || '#1e293b';
  
  return (
    <nav style={{ background: bgColor, color: textColor }}>
      {/* Header content */}
    </nav>
  );
}
```

**Features:**
- Customizable via Appearance → Header settings
- Logo text, tagline, colors, height
- Sticky navigation option
- Menu integration (primary menu location)

### Footer Component
Located in `themes/{theme-slug}/index.tsx`:

```typescript
export function SiteFooter({ footerMenu, footerWidgets, header }: {
  footerMenu?: Menu;
  footerWidgets?: Widget[];
  header?: HeaderSettings;
}) {
  return (
    <footer>
      {/* Footer content */}
    </footer>
  );
}
```

**Features:**
- Footer menu integration (footer menu location)
- Widget areas (footer location)
- Branding and copyright
- Multi-column layout

### Body Classes
Auto-generated based on current page context (like WordPress `body_class()`):

```typescript
function getBodyClasses(route: string, currentPage?: Post, themeId?: string): string {
  const classes: string[] = [];
  
  // Theme
  if (themeId) classes.push(`theme-${themeId}`);
  
  // Page type
  if (route === '/') classes.push('home', 'front-page');
  if (route.match(/^\/blog\/[\w-]+$/)) classes.push('single', 'single-post');
  if (currentPage?.type === 'page') classes.push('page', `page-id-${currentPage.id}`);
  
  // Authentication
  const token = localStorage.getItem('nestpress_access_token');
  if (token) classes.push('logged-in');
  
  return classes.join(' ');
}
```

**Generated Classes:**
- `home`, `front-page` - Homepage
- `single`, `single-post`, `postid-123` - Single post
- `page`, `page-id-123`, `page-about` - Static page
- `archive`, `blog` - Blog archive
- `category`, `category-news` - Category archive
- `search`, `search-results` - Search results
- `error404` - 404 Not Found
- `logged-in` - User authenticated
- `theme-default` - Active theme

## WordPress Hooks Implementation

### wp_head Hook
Fires in document `<head>` for adding meta tags, styles, and scripts:

```typescript
// In WebsiteFrontend.tsx
useEffect(() => {
  // Execute wp_head action
  doAction('wp_head', {
    theme: effectiveThemeId,
    page: currentPage,
    route: window.location.pathname,
  });
  
  // Load plugin styles in <head>
  pluginAssets.styles.forEach((style) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = style.src;
    document.head.appendChild(link);
  });
}, [pluginAssets, doAction]);
```

**Plugin Usage:**
```typescript
// In plugin's registerHooks()
api.addAction('wp_head', (context) => {
  console.log('wp_head fired:', context);
  // Inject meta tags, analytics, etc.
});
```

### wp_body_open Hook
Fires immediately after `<body>` tag (WordPress 5.2+ feature):

```typescript
// In WebsiteFrontend.tsx
useEffect(() => {
  doAction('wp_body_open', {
    theme: effectiveThemeId,
    page: currentPage,
    route: window.location.pathname,
  });
}, [doAction, currentPage]);
```

**Plugin Usage:**
```typescript
api.addAction('wp_body_open', (context) => {
  console.log('wp_body_open fired:', context);
  // Inject skip-to-content links, screen reader helpers, etc.
});
```

### wp_footer Hook
Fires before `</body>` tag for footer scripts and widgets:

```typescript
// In WebsiteFrontend.tsx
useEffect(() => {
  doAction('wp_footer', {
    theme: effectiveThemeId,
    page: currentPage,
    route: window.location.pathname,
  });
  
  // Load plugin scripts in footer
  pluginAssets.scripts.forEach((script) => {
    if (script.inFooter) {
      const scriptEl = document.createElement('script');
      scriptEl.src = script.src;
      document.body.appendChild(scriptEl);
    }
  });
}, [pluginAssets, doAction]);
```

**Plugin Usage:**
```typescript
api.addAction('wp_footer', (context) => {
  console.log('wp_footer fired:', context);
  // Inject analytics, chat widgets, etc.
});
```

### body_class Filter
Allows plugins to modify body CSS classes:

```typescript
// In WebsiteFrontend.tsx
useEffect(() => {
  const bodyClasses = getBodyClasses(route, currentPage, themeId);
  
  // Apply filter to allow plugins to modify
  applyFilters('body_class', bodyClasses).then((filtered) => {
    document.body.className = filtered;
  });
}, [currentPage, themeId]);
```

**Plugin Usage:**
```typescript
api.addFilter('body_class', (classes: string) => {
  // Add custom classes
  return classes + ' dark-mode premium-user';
}, 10);
```

## Complete Example: SEO Plugin

```typescript
// plugins/seo-toolkit/index.ts
const SEOPlugin: NestPressPlugin = {
  metadata: {
    Name: 'SEO Toolkit',
    Version: '1.0.0',
  },

  registerHooks: (api) => {
    // Inject SEO meta tags in <head>
    api.addAction('wp_head', (context) => {
      const metaTags = `
        <meta name="description" content="${context.page?.excerpt || 'NestPress CMS'}">
        <meta property="og:title" content="${context.page?.title || 'Home'}">
        <meta property="og:type" content="${context.page?.type || 'website'}">
        <link rel="canonical" href="${window.location.href}">
      `;
      
      const meta = document.createElement('div');
      meta.innerHTML = metaTags;
      Array.from(meta.children).forEach(child => {
        document.head.appendChild(child);
      });
    }, 5); // Priority 5 - runs early

    // Add SEO-specific body classes
    api.addFilter('body_class', (classes: string, context) => {
      const seoClasses = [];
      if (context.page?.categories?.includes('featured')) {
        seoClasses.push('featured-content');
      }
      return classes + ' ' + seoClasses.join(' ');
    }, 10);

    // Inject structured data in footer
    api.addAction('wp_footer', (context) => {
      if (context.page?.type === 'post') {
        const structuredData = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": context.page.title,
          "datePublished": context.page.date,
          "author": {
            "@type": "Person",
            "name": context.page.author
          }
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.body.appendChild(script);
      }
    }, 20); // Priority 20 - runs after other footer hooks
  },
};

export default SEOPlugin;
```

## Testing Template Hooks

### Test wp_head Hook
```typescript
// In browser console
window.addEventListener('load', () => {
  console.log('Checking wp_head execution...');
  console.log('Meta tags:', document.querySelectorAll('head meta').length);
  console.log('Plugin styles:', document.querySelectorAll('[id^="plugin-style-"]').length);
});
```

### Test body_class Filter
```typescript
// In browser console
console.log('Body classes:', document.body.className);
// Should see: "home front-page theme-default logged-in" (or similar)
```

### Test wp_footer Hook
```typescript
// In browser console
window.addEventListener('load', () => {
  console.log('Plugin scripts in footer:', 
    document.querySelectorAll('body [id^="plugin-script-"]').length);
});
```

## WordPress Compatibility

| Feature | WordPress | NestPress | Status |
|---------|-----------|-----------|--------|
| `get_header()` | ✅ | ✅ `<SiteNav>` component | ✅ |
| `get_footer()` | ✅ | ✅ `<SiteFooter>` component | ✅ |
| `wp_head()` | ✅ | ✅ `wp_head` action hook | ✅ |
| `wp_body_open()` | ✅ | ✅ `wp_body_open` action hook | ✅ |
| `wp_footer()` | ✅ | ✅ `wp_footer` action hook | ✅ |
| `body_class()` | ✅ | ✅ `body_class` filter hook | ✅ |
| `wp_enqueue_style()` | ✅ | ✅ Plugin asset loading | ✅ |
| `wp_enqueue_script()` | ✅ | ✅ Plugin asset loading | ✅ |

## Best Practices

1. **Use Priority Values**: Lower priority = earlier execution (5 before 10 before 20)
2. **Clean Up**: Remove elements on plugin deactivation if needed
3. **Check Context**: Verify `context.page` exists before using it
4. **Avoid Blocking**: Keep hook handlers fast, use async if needed
5. **Test Thoroughly**: Ensure hooks work across different page types

## Summary

NestPress provides a **complete WordPress-like template engine** with:

✅ **Header Component** - Customizable via Appearance → Header  
✅ **Footer Component** - With menus and widgets  
✅ **Body Classes** - Auto-generated like WordPress `body_class()`  
✅ **wp_head Hook** - Inject into `<head>`  
✅ **wp_body_open Hook** - Inject after `<body>`  
✅ **wp_footer Hook** - Inject before `</body>`  
✅ **Plugin Integration** - Full WordPress-like plugin system  

The implementation is **production-ready** and **WordPress-compatible** for developers familiar with WordPress theming.
