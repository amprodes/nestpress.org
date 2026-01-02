# Default Pages Setup

## Overview
NestPress CMS now includes a database seeding system to create default pages (Home, About, Contact, Blog) with beautiful, pre-styled content.

## Features Added

### 1. Backend Seeding Service
**File:** `backend/src/modules/posts/seed.service.ts`
- Creates 4 default pages with rich HTML content
- Checks if pages already exist (won't duplicate)
- Pages are automatically published and ready to view
- Styled with inline CSS for immediate visual appeal

### 2. API Endpoint
**Endpoint:** `POST /api/v1/posts/seed/default-pages`
- **Auth Required:** Yes (Admin only)
- **Purpose:** Trigger creation of default pages
- **Response:** Success message or error

### 3. UI Integration
**Location:** Settings → System Tab → "Database Setup" section
- New "Seed Default Pages" button
- One-click initialization
- Shows success/error toast notifications

## Default Pages Created

### 1. Home Page
- Hero section with gradient background
- 3 feature cards (Fast & Modern, Theme System, Plugin Architecture)
- Call-to-action section
- Fully styled with inline CSS

### 2. About Page
- "Our Story" section
- "What Makes Us Different" feature list
- Community CTA with gradient background
- Professional layout

### 3. Contact Page
- Contact information cards (Email, Social, GitHub)
- Contact form placeholder
- Link to Plugins page for Contact Form plugin
- Clean, centered layout

### 4. Blog Page
- Blog posts listing placeholder
- "Create Post" CTA button
- Links to admin dashboard

## How to Use

### Option 1: Via Settings UI (Recommended)
1. Go to **Settings** → **System** tab
2. Find the "Database Setup" section
3. Click **"Seed Default Pages"** button
4. Wait for success notification
5. Click **"View Site"** in top-right to see your pages

### Option 2: Via API (For Developers)
```bash
# Get your auth token from localStorage: nestpress_access_token
TOKEN="your-access-token"

curl -X POST http://localhost:4000/api/v1/posts/seed/default-pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## Viewing Pages

### In Admin Dashboard
- Navigate to **Pages** → All Pages
- You should see: Home, About, Contact, Blog

### On Public Website
1. Click **"View Site"** button (top-right of admin)
2. Pages are accessible at:
   - `/` or `/home` - Home page
   - `/about` - About page
   - `/contact` - Contact page
   - `/blog` - Blog page

## Page Routing

Pages are automatically routed based on their title:
- Title: "Home" → URL: `/home` or `/`
- Title: "About" → URL: `/about`
- Title: "Contact" → URL: `/contact`
- Title: "Blog" → URL: `/blog`

## Customization

### Edit Page Content
1. Go to **Pages** → All Pages
2. Click on any page to edit
3. Modify content in the editor
4. Click **Update** to save

### Add New Pages
1. Go to **Pages** → Add New
2. Enter title and content
3. Publish
4. Page is automatically routed based on title

## Theme Compatibility

All default pages work with:
- ✅ Default theme
- ✅ All custom themes with `page.tsx` template
- ✅ Cloned WordPress themes (via AI Theme Factory)

The pages use the theme's `page.tsx` template which renders content with `dangerouslySetInnerHTML`, preserving all HTML and inline styles.

## Technical Details

### Page Structure
Each page is created as a `Post` entity with:
- `type: 'page'` (not 'post')
- `status: PostStatus.PUBLISHED`
- Rich HTML content with inline CSS
- SEO-friendly excerpts

### Database Check
The seeding service checks if pages exist before creating:
```typescript
const existingPages = await this.pagesService.findAll(1, 100);
if (existingPages.total > 0) {
  // Skip seeding
}
```

### Error Handling
- ✅ Checks backend connection
- ✅ Validates auth token
- ✅ Shows user-friendly error messages
- ✅ Prevents duplicate page creation

## Troubleshooting

### "Failed to create default pages"
**Solution:** Ensure backend is running on port 4000
```bash
cd backend && npm run start:dev
```

### "Unauthorized" Error
**Solution:** Make sure you're logged in as Admin
1. Logout and login again
2. Check your role in Users section

### Pages Don't Appear
**Solution:** Refresh the Pages list
1. Navigate away from Pages
2. Come back to Pages
3. Or refresh browser (Ctrl+R / Cmd+R)

### Styling Not Applied
**Solution:** Pages use inline CSS which works with all themes
- No additional CSS files needed
- Styles are embedded in HTML content
- Check browser console for any errors

## Future Enhancements

Potential improvements:
- [ ] Seed sample blog posts
- [ ] Add sample images/media
- [ ] Create sample menus
- [ ] Configure homepage settings
- [ ] Add sample widgets

## Files Modified

1. `backend/src/modules/posts/seed.service.ts` - NEW
2. `backend/src/modules/posts/posts.module.ts` - Updated
3. `backend/src/modules/posts/posts.controller.ts` - Updated  
4. `components/Settings.tsx` - Updated (added UI button)

---

**Created:** December 22, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
