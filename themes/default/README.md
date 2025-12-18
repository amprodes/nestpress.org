# NestPress Default Theme

A modern, WordPress-compatible theme for NestPress CMS with reusable parts, patterns, and multiple style variations.

## 📁 Structure

```
default/
├── index.tsx                    # Main theme entry (exports all components)
├── theme.json                   # Theme configuration (WordPress-compatible)
├── screenshot.svg               # Theme thumbnail
│
├── parts/                       # Reusable template parts (WordPress template-parts/)
│   ├── Header.tsx              # Site header with navigation
│   ├── Footer.tsx              # Site footer with widgets
│   ├── Sidebar.tsx             # Sidebar with widgets
│   └── PostMeta.tsx            # Post metadata display
│
├── patterns/                    # Pre-built content patterns (WordPress patterns/)
│   ├── HeroBanner.tsx          # Hero section with CTA
│   ├── PostsGrid.tsx           # Post grid layout (2/3/4 columns)
│   ├── FeatureGrid.tsx         # Feature cards grid
│   └── CTA.tsx                 # Call-to-action section
│
├── templates/                   # Page templates (WordPress templates/)
│   ├── index.tsx               # Front page / Home
│   ├── single.tsx              # Single post
│   ├── page.tsx                # Static page
│   ├── page-with-sidebar.tsx  # Page with sidebar
│   ├── archive.tsx             # Blog archive
│   ├── category.tsx            # Category archive
│   ├── search.tsx              # Search results
│   └── 404.tsx                 # 404 error page
│
├── styles/                      # Style variations (WordPress styles/)
│   ├── onyx.json               # Dark theme variant
│   ├── mint.json               # Green theme variant
│   └── ocean.json              # Blue theme variant
│
└── assets/                      # Theme assets
    ├── css/                    # Stylesheets
    │   └── buttons.css         # Custom button styles
    ├── fonts/                  # Web fonts (empty - ready for fonts)
    └── images/                 # Theme images (empty - ready for images)
```

## 🎨 WordPress Comparison

### Template Hierarchy

| WordPress | NestPress | Description |
|-----------|-----------|-------------|
| `index.php` | `templates/index.tsx` | Front page / Home |
| `single.php` | `templates/single.tsx` | Single post |
| `page.php` | `templates/page.tsx` | Static page |
| `page-{slug}.php` | `templates/page-*.tsx` | Custom page templates |
| `archive.php` | `templates/archive.tsx` | Blog archive |
| `category.php` | `templates/category.tsx` | Category archive |
| `search.php` | `templates/search.tsx` | Search results |
| `404.php` | `templates/404.tsx` | 404 error page |

### Template Parts

| WordPress | NestPress | Description |
|-----------|-----------|-------------|
| `get_header()` | `<Header />` | Site header |
| `get_footer()` | `<Footer />` | Site footer |
| `get_sidebar()` | `<Sidebar />` | Sidebar widgets |
| `get_template_part()` | Import from `/parts/` | Reusable components |

### Patterns (Block Patterns)

| WordPress | NestPress | Description |
|-----------|-----------|-------------|
| `patterns/banner-hero.php` | `<HeroBanner />` | Hero banner |
| `patterns/posts-grid-3-col.php` | `<PostsGrid columns={3} />` | Post grid |
| `patterns/text-feature-grid-3-col.php` | `<FeatureGrid columns={3} />` | Feature grid |
| `patterns/cta-subscribe-centered.php` | `<CTA />` | Call to action |

### Style Variations

| WordPress | NestPress | Description |
|-----------|-----------|-------------|
| `styles/onyx.json` | `styles/onyx.json` | Dark theme |
| `styles/mint.json` | `styles/mint.json` | Green theme |
| `styles/ocean.json` | `styles/ocean.json` | Blue theme |

## 🚀 Usage

### Basic Template

```tsx
import React from 'react';
import { Header, Footer, ThemeTemplateProps } from '../index';

const MyTemplate: React.FC<ThemeTemplateProps> = ({ 
  primaryMenu,
  footerMenu,
  footerWidgets,
  header 
}) => {
  return (
    <div>
      <Header primaryMenu={primaryMenu} header={header} />
      
      {/* Your content here */}
      
      <Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
    </div>
  );
};

export default MyTemplate;
```

### Using Patterns

```tsx
import { HeroBanner, PostsGrid, FeatureGrid, CTA } from '../index';

// Hero Banner
<HeroBanner 
  title="Welcome"
  subtitle="Your subtitle here"
  ctaText="Get Started"
  ctaUrl="/blog"
/>

// Posts Grid (2/3/4 columns)
<PostsGrid 
  posts={posts}
  columns={3}
  showExcerpt={true}
  showMeta={true}
/>

// Feature Grid
<FeatureGrid 
  features={[
    { icon: '🚀', title: 'Fast', description: 'Lightning fast' }
  ]}
  columns={3}
/>

// Call to Action
<CTA 
  title="Subscribe"
  description="Get updates"
  showEmailForm={true}
/>
```

### Using Parts

```tsx
import { Header, Footer, Sidebar, PostMeta } from '../index';

// Header
<Header 
  primaryMenu={primaryMenu}
  header={header}
  siteName="My Site"
  tagline="My tagline"
/>

// Sidebar
<Sidebar 
  widgets={sidebarWidgets}
  recentPosts={posts}
  categories={categories}
/>

// Post Meta
<PostMeta 
  post={post}
  showAuthor={true}
  showDate={true}
  showCategories={true}
  showTags={true}
/>

// Footer
<Footer 
  footerMenu={footerMenu}
  footerWidgets={footerWidgets}
  header={header}
/>
```

## 🎨 Customization

### theme.json

The `theme.json` file uses WordPress theme.json schema v3:

```json
{
  "$schema": "https://schemas.wp.org/wp/6.7/theme.json",
  "version": 3,
  "settings": {
    "color": {
      "palette": [
        { "color": "#FFFFFF", "name": "Base", "slug": "base" },
        { "color": "#1e293b", "name": "Contrast", "slug": "contrast" }
      ]
    },
    "layout": {
      "contentSize": "645px",
      "wideSize": "1340px"
    },
    "spacing": {
      "spacingSizes": [
        { "name": "Small", "size": "30px", "slug": "40" }
      ]
    },
    "typography": {
      "fontFamilies": [
        { "name": "Inter", "slug": "inter", "fontFamily": "Inter, sans-serif" }
      ]
    }
  }
}
```

### CSS Variables

The theme automatically generates CSS variables from `theme.json`:

```css
/* Colors */
var(--wp--preset--color--base)
var(--wp--preset--color--contrast)
var(--wp--preset--color--accent-1)

/* Spacing */
var(--wp--preset--spacing--40)  /* Small */
var(--wp--preset--spacing--50)  /* Regular */
var(--wp--preset--spacing--60)  /* Large */

/* Typography */
var(--wp--preset--font-family--inter)
var(--wp--preset--font-size--medium)
```

## 📝 Creating Custom Templates

1. **Create template file** in `templates/`:
```tsx
// templates/my-custom-template.tsx
import React from 'react';
import { Header, Footer, ThemeTemplateProps } from '../index';

const MyCustomTemplate: React.FC<ThemeTemplateProps> = (props) => {
  return (
    <div>
      <Header {...props} />
      {/* Custom content */}
      <Footer {...props} />
    </div>
  );
};

export default MyCustomTemplate;
```

2. **Add to theme.json**:
```json
{
  "customTemplates": [
    {
      "name": "my-custom-template",
      "title": "My Custom Template",
      "postTypes": ["page", "post"]
    }
  ]
}
```

## 🎨 Creating Style Variations

1. **Create style file** in `styles/`:
```json
{
  "version": 3,
  "title": "My Style",
  "slug": "my-style",
  "settings": {
    "color": {
      "palette": [
        { "color": "#CUSTOM", "name": "Custom Color", "slug": "custom" }
      ]
    }
  }
}
```

## 📦 Features

- ✅ **WordPress-Compatible Structure** - Familiar WordPress theme patterns
- ✅ **Reusable Parts** - Header, Footer, Sidebar, PostMeta components
- ✅ **Pre-built Patterns** - Hero, PostsGrid, FeatureGrid, CTA
- ✅ **Multiple Style Variations** - Onyx, Mint, Ocean (more coming)
- ✅ **Responsive Design** - Mobile-first, fluid typography
- ✅ **Accessibility** - Semantic HTML, ARIA labels
- ✅ **TypeScript** - Full type safety
- ✅ **CSS Variables** - Dynamic theming support

## 🔧 Development

```bash
# The theme loads dynamically - no build required
# Just edit files and refresh browser

# Theme is located at:
# /themes/default/
```

## 📚 Documentation

- [Theme System Documentation](../../../THEME_SYSTEM.md)
- [WordPress Features](../../../WORDPRESS_FEATURES.md)
- [Copilot Instructions](../../../.github/copilot-instructions.md)

## 📄 License

MIT License - Same as NestPress CMS
