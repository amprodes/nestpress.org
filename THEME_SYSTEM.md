# NestPress Theme System

## Overview

NestPress has a powerful theme system that lets you create custom themes just like WordPress, but with modern React/TypeScript and dynamic loading.

## 🚀 Features

- **Dynamic Loading**: Themes load at runtime without rebuilding the app
- **Hot Swappable**: Switch themes instantly
- **TypeScript**: Full type safety for theme development
- **Modern Stack**: React 19 components with hooks
- **WordPress-like**: Familiar template structure (index, single, page, archive, etc.)
- **ZIP Installation**: Upload and install themes via admin panel

## 📁 Theme Structure

```
themes/
└── your-theme-name/
    ├── theme.json          # Theme metadata
    ├── index.tsx           # Main entry point
    └── templates/
        ├── index.tsx       # Homepage template
        ├── single.tsx      # Single post template
        ├── page.tsx        # Page template
        ├── archive.tsx     # Blog archive template
        ├── category.tsx    # Category template
        ├── search.tsx      # Search results template
        └── 404.tsx         # Not found template
```

## 🎨 Creating a Theme

### 1. Create theme.json

```json
{
  "name": "My Awesome Theme",
  "slug": "my-awesome-theme",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "An amazing theme for NestPress",
  "thumbnail": "https://example.com/thumbnail.jpg",
  "features": [
    "Responsive Design",
    "Dark Mode",
    "SEO Optimized"
  ],
  "templates": [
    "index",
    "single",
    "page",
    "archive",
    "category",
    "search",
    "404"
  ],
  "settings": {
    "colors": {
      "primary": "#2563eb",
      "secondary": "#7c3aed",
      "background": "#ffffff",
      "text": "#1e293b"
    },
    "fonts": {
      "heading": "Inter, sans-serif",
      "body": "Inter, sans-serif"
    }
  },
  "requires": {
    "nestpress": ">=1.0.0",
    "react": ">=19.0.0"
  }
}
```

### 2. Create index.tsx (Main Entry)

```typescript
import React from 'react';
import { Post } from '../../../types';

export interface ThemeTemplateProps {
  data?: any;
  posts?: Post[];
  post?: Post;
  currentPage?: number;
  totalPages?: number;
}

// Export all templates
export { default as IndexTemplate } from './templates/index';
export { default as SingleTemplate } from './templates/single';
export { default as PageTemplate } from './templates/page';
export { default as ArchiveTemplate } from './templates/archive';
export { default as CategoryTemplate } from './templates/category';
export { default as SearchTemplate } from './templates/search';
export { default as NotFoundTemplate } from './templates/404';

export const theme = {
  name: 'My Awesome Theme',
  version: '1.0.0'
};
```

### 3. Create Template Components

Example: `templates/index.tsx` (Homepage)

```typescript
import React from 'react';
import { ThemeTemplateProps } from '../index';

const IndexTemplate: React.FC<ThemeTemplateProps> = ({ posts = [] }) => {
  return (
    <div className="my-theme">
      <header>
        <h1>Welcome to My Site</h1>
      </header>
      
      <main>
        {posts.map(post => (
          <article key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <a href={`/blog/${post.id}`}>Read More</a>
          </article>
        ))}
      </main>
      
      <footer>
        <p>© 2025 My Site</p>
      </footer>
    </div>
  );
};

export default IndexTemplate;
```

## 📦 Installing a Theme

### Method 1: Manual Installation

1. Copy your theme folder to `/themes/`
2. Restart the frontend dev server
3. Theme will be auto-discovered

### Method 2: ZIP Upload (Admin Panel)

1. Package your theme as a ZIP file:
   ```bash
   cd themes
   zip -r my-theme.zip my-theme/
   ```

2. In NestPress Admin:
   - Go to **Appearance → Themes**
   - Click **Upload Theme**
   - Select your ZIP file
   - Click **Install**

3. Activate the theme

### Method 3: API Upload

```bash
curl -X POST http://localhost:4000/api/v1/theme-manager/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "theme=@my-theme.zip"
```

## 🔥 Template Props Reference

### IndexTemplate (Homepage)
```typescript
{
  posts: Post[]           // Array of published posts
  currentPage?: number    // Current pagination page
  totalPages?: number     // Total number of pages
}
```

### SingleTemplate (Blog Post)
```typescript
{
  post: Post             // The post being displayed
}
```

### PageTemplate (Static Page)
```typescript
{
  post: Post             // The page being displayed
}
```

### ArchiveTemplate (Blog Listing)
```typescript
{
  posts: Post[]          // Array of posts
  currentPage?: number
  totalPages?: number
}
```

### CategoryTemplate
```typescript
{
  posts: Post[]          // Posts in this category
  data: {
    category: string     // Category name
  }
}
```

### SearchTemplate
```typescript
{
  posts: Post[]          // Search results
  data: {
    query: string        // Search query
  }
}
```

## 🎯 Post Object Structure

```typescript
interface Post {
  id: string;
  title: string;
  content: string;        // HTML content (already filtered)
  excerpt: string;
  author: string;
  date: string;          // ISO date string
  status: 'published' | 'draft' | 'trash';
  categories: string[];
  tags: string[];
  type: 'post' | 'page';
  featuredImage?: string;
}
```

## 🎨 Styling Your Theme

You can use:
- **Inline styles** (like the default theme)
- **CSS files** imported in your components
- **Tailwind CSS** (already available)
- **CSS-in-JS** libraries

Example with CSS file:

```typescript
// templates/index.tsx
import './styles.css';

const IndexTemplate: React.FC<ThemeTemplateProps> = ({ posts }) => {
  return <div className="index-template">...</div>;
};
```

## 🔌 Advanced Features

### Custom Navigation

```typescript
export function CustomNav() {
  return (
    <nav>
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
      <a href="/about">About</a>
      <a href="/admin">Admin</a>
    </nav>
  );
}

// Use in templates
<CustomNav />
```

### Using Hooks

```typescript
import { useState, useEffect } from 'react';

const IndexTemplate: React.FC<ThemeTemplateProps> = ({ posts }) => {
  const [darkMode, setDarkMode] = useState(false);
  
  return (
    <div className={darkMode ? 'dark' : 'light'}>
      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Dark Mode
      </button>
      {/* ... */}
    </div>
  );
};
```

## 🚀 Best Practices

1. **Keep it simple**: Templates should focus on presentation
2. **Type safety**: Use TypeScript interfaces
3. **Responsive**: Design mobile-first
4. **Performance**: Optimize images and lazy load content
5. **Accessibility**: Use semantic HTML and ARIA labels
6. **SEO**: Proper heading hierarchy, meta tags

## 📝 Example Themes

Check out the `/themes/default` folder for a complete working example.

## 🐛 Troubleshooting

**Theme not loading?**
- Check browser console for errors
- Verify `theme.json` is valid JSON
- Ensure all template exports match `templates` array in `theme.json`

**Styles not applying?**
- Check CSS import paths
- Ensure class names don't conflict

**ZIP install fails?**
- Verify ZIP structure (theme.json should be at root)
- Check slug is lowercase with hyphens only

## 🎉 That's It!

You now have a WordPress-like theme system with modern React and TypeScript. Build amazing themes and share them with the community!
