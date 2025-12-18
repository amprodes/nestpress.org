# WordPress-like Features & Data Seeding

## Overview

NestPress now has a complete WordPress-like system with:
- ✅ Content filtering pipeline (wpautop, wptexturize, shortcodes, etc.)
- ✅ Template hierarchy (front-page → single → page → archive → 404)
- ✅ The Loop component with template tags
- ✅ Beautiful, styled templates with proper CSS
- ✅ **Demo data seeding** for immediate testing

## Quick Start

### 1. Seed Demo Data

**Option A: Automatic Seeding (Recommended)**
Add to your `backend/.env`:
```env
SEED_DATA=true
```
Then restart the backend. Demo data will be seeded automatically on startup.

**Option B: Manual Seeding via API**
```bash
# Login as admin first
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@nestpress.com", "password": "admin123"}'

# Seed data (requires admin token)
curl -X POST http://localhost:4000/api/v1/database/seed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. View Your Site

Navigate to:
- **Frontend**: `http://localhost:3001/` (home page with hero section)
- **Blog Archive**: `http://localhost:3001/blog`
- **Single Post**: `http://localhost:3001/blog/getting-started-with-nestpress`
- **About Page**: `http://localhost:3001/about`
- **Contact Page**: `http://localhost:3001/contact`
- **Admin Dashboard**: `http://localhost:3001/admin`

### 3. Demo Credentials

```
Admin:
- Email: admin@nestpress.com
- Password: admin123

Editor:
- Email: editor@nestpress.com
- Password: editor123

Author:
- Email: author@nestpress.com
- Password: author123
```

## What Gets Seeded

### Users (3)
- **Admin User** - Full site access
- **Jane Editor** - Content management
- **John Author** - Blog writer

### Pages (3)
- **Home** - Beautiful hero section with features grid
- **About** - Company information with tech stack
- **Contact** - Contact form and information

### Blog Posts (5)
- "Getting Started with NestPress" - Comprehensive intro guide
- "Understanding the WordPress-like Hook System" - Technical deep-dive
- "Building Your First Custom Template" - Development tutorial
- "AI-Powered Content Enhancement" - AI features guide
- "Multi-Database Support Explained" - Architecture overview

Each post includes:
- Featured images from Unsplash
- Proper formatting with headings, lists, code blocks
- Categories and tags
- View counts and likes
- Published dates

### Products (3)
- **NestPress Pro License** - $99 (featured)
- **Custom Theme Development** - $499 (featured)
- **AI Content Bundle** - $29

## Template System

### Active Templates

1. **FrontPageTemplate** (`/`)
   - Hero section with gradient background
   - Feature cards grid
   - Call-to-action button

2. **SingleTemplate** (`/blog/:slug`)
   - Large featured image
   - Full content with formatting
   - Post navigation
   - Category and tag display

3. **ArchiveTemplate** (`/blog`)
   - Post listing with excerpts
   - Featured images
   - Pagination
   - Archive header

4. **PageTemplate** (`/:slug`)
   - Clean, centered layout
   - Full-width content
   - Optimized for reading

5. **CategoryTemplate** (`/category/:slug`)
   - Category-specific archive
   - Category description

6. **SearchTemplate** (`/search`)
   - Search results display
   - Result count
   - "No results" message

7. **NotFoundTemplate** (`/404`)
   - Large 404 display
   - Helpful links
   - Search form

### Template Hierarchy

Routes automatically select the best template:

```
Route: /                    → FrontPageTemplate
Route: /about               → PageTemplate
Route: /blog                → ArchiveTemplate
Route: /blog/my-post        → SingleTemplate
Route: /category/tutorials  → CategoryTemplate
Route: /404                 → NotFoundTemplate
Route: (fallback)           → IndexTemplate
```

## Content Filters

All content passes through WordPress-like filters:

### Post Content Filters (in order)
1. **sanitizeContent** (priority 5) - XSS protection
2. **wpautop** (priority 10) - Auto paragraphs
3. **wptexturize** (priority 15) - Smart quotes: "quotes" → "quotes"
4. **convertSmilies** (priority 20) - :) → 😊
5. **doShortcode** (priority 25) - [gallery], [video], [embed]
6. **addLazyLoading** (priority 30) - `loading="lazy"` on images

### Supported Shortcodes

```html
[gallery ids="1,2,3"]
[video src="path/to/video.mp4"]
[embed]https://www.youtube.com/watch?v=VIDEO_ID[/embed]
[caption]Image with caption[/caption]
```

## The Loop

Use WordPress-like template tags:

```tsx
<Loop posts={posts}>
  {(post) => (
    <>
      <TheTitle post={post} link={true} />
      <TheFeaturedImage post={post} />
      <TheExcerpt post={post} length={40} />
      <TheMeta post={post} />
      <TheCategories post={post} />
      <TheTags post={post} />
      <ThePermalink post={post}>Read more →</ThePermalink>
    </>
  )}
</Loop>

<ThePagination 
  currentPage={1} 
  totalPages={5} 
  onPageChange={(page) => console.log(page)} 
/>
```

## Styling

All templates include comprehensive CSS in `components/templates/wordpress-template.css`:

- **Typography** - Beautiful heading hierarchy
- **Layout** - Responsive grid and flexbox
- **Components** - Styled buttons, cards, navigation
- **Utilities** - Pagination, meta display, featured images
- **Responsive** - Mobile-first design
- **Print** - Optimized print styles

## API Endpoints

### Data Seeding
```bash
POST /api/v1/database/seed        # Seed demo data (admin only)
DELETE /api/v1/database/seed      # Clear seeded data (admin only)
```

### Content Access
```bash
GET /api/v1/posts/published       # Get published posts (filtered)
GET /api/v1/posts/slug/:slug      # Get post by slug (filtered)
GET /api/v1/pages                 # Get all pages
GET /api/v1/pages/slug/:slug      # Get page by slug (filtered)
GET /api/v1/products              # Get products
```

## Customization

### Add Your Own Template

```tsx
// components/templates/CustomTemplate.tsx
export function CustomTemplate({ posts }: TemplateProps) {
  return (
    <div className="custom-template">
      <h1>My Custom Design</h1>
      <Loop posts={posts}>
        {(post) => <div>{post.title}</div>}
      </Loop>
    </div>
  );
}

// Register it
import { templateHierarchy } from '@/utils/templateHierarchy';
templateHierarchy.register('custom', CustomTemplate);
```

### Add Custom Filters

```typescript
// backend/src/modules/hooks/my-filters.service.ts
@HookProvider({ namespace: 'my-plugin' })
export class MyFiltersService {
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 50 })
  async myCustomFilter(content: string): Promise<string> {
    return content.toUpperCase(); // Example transformation
  }
}
```

## Next Steps

1. **Explore the admin dashboard** at `/admin`
2. **Create your first post** using the Post Editor
3. **Customize a theme** in Appearance → Themes
4. **Try AI features** for content enhancement
5. **Build a custom template** following the examples

## Differences from WordPress

| WordPress | NestPress |
|-----------|-----------|
| `/wp-admin/` | `/admin` |
| `/` (frontend) | `/` (same, but SPA) |
| `wp-content/themes/` | React components in `components/templates/` |
| `wp-content/plugins/` | Services with `@HookProvider` decorator |
| PHP `the_content()` | React `<TheContent post={post} />` |
| `have_posts()` / `the_post()` | `<Loop posts={posts}>` |
| MySQL database | MongoDB/Firebase/DynamoDB/Supabase |

## Troubleshooting

**No posts showing?**
- Check if data seeding ran: `SEED_DATA=true` in backend/.env
- Or manually seed via API endpoint

**Styles not loading?**
- Check `wordpress-template.css` is imported in `WebsiteFrontend.tsx`
- Clear browser cache

**Templates not rendering?**
- Check `registerDefaultTemplates()` is called
- Verify `templateRegistered` state is true

---

**🎉 You now have a fully functional WordPress-like CMS with modern tech!**
