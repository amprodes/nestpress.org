# NestPress CMS - Copilot Instructions

## 🚀 Quick Reference (Start Here!)

### Project Architecture Overview
- **Monorepo structure**: Frontend (root) + Backend (`backend/` folder) + Shared plugins/themes
- **No workspace manager**: No Yarn workspaces, no npm workspaces - just two separate `package.json` files
- **Shared folders**: `/plugins` and `/themes` accessed by both frontend and backend
- **Build system**: Vite (frontend), NestJS CLI (backend) - independent builds
- **Port strategy**: Frontend=3000, Backend=4000 (not default ports!)

### Essential Commands
```bash
# First-time setup (run from project root)
npm install                        # Frontend dependencies
cd backend && npm install && cd .. # Backend dependencies
cp .env.example .env.local        # Frontend env
cp backend/.env.example backend/.env  # Backend env

# CRITICAL: Edit backend/.env to set:
PORT=4000                         # Backend port (defaults to 3000!)
CORS_ORIGINS=http://localhost:3000  # Allow frontend
DATABASE_PROVIDER=firebase        # Choose: firebase|mongodb|dynamodb|supabase
JWT_SECRET=change-this-in-production
# ...provider-specific keys

# Development (requires 2 separate terminals)
cd backend && npm run start:dev  # Terminal 1: Backend (port 4000)
npm run dev                       # Terminal 2: Frontend (port 3000)

# URLs
http://localhost:3000             # Admin dashboard
http://localhost:4000/api/v1      # Backend API
http://localhost:4000/docs        # Swagger API docs
```

### Critical Files (Read These First!)
- `types.ts` - ALL TypeScript interfaces (Post, Product, Theme, etc.)
- `contexts/CMSContext.tsx` - Global state + CRUD operations
- `contexts/AuthContext.tsx` - Authentication state + login/logout
- `services/api.ts` - API client with typed endpoints
- `components/common/DataTable.tsx` - Reusable table for all listing pages
- `components/common/DataCard.tsx` - **Unified card component for ALL admin views**
- `backend/src/modules/database/database.service.ts` - Multi-DB abstraction layer

### 🔥 Immediate Troubleshooting (Common Blockers)
```bash
# Backend won't start?
cd backend
cat .env | grep DATABASE_PROVIDER  # Must be set!
cat .env | grep JWT_SECRET          # Must exist!

# CORS errors?
cat backend/.env | grep CORS_ORIGINS  # Must include http://localhost:3000

# 401 on all API calls?
# Open browser console → localStorage.getItem('nestpress_access_token')
# If null, login again. If exists, check token is being sent in API headers.

# Themes not loading?
ls -la themes/                     # Themes must exist
cat vite.config.ts | grep fs.allow # Must include 'themes'

# Port conflict errors?
lsof -i :3000  # Check if frontend port taken
lsof -i :4000  # Check if backend port taken
# Kill with: kill -9 <PID>
```

### Quick Pattern Lookup

**Add new view:**
1. Update `ViewState` enum in `types.ts`
2. Add case in `App.tsx` switch statement
3. Add nav item in `components/Layout.tsx` (or as submenu under existing parent like Appearance)

**Add new API endpoint:**
1. Backend: Create DTO with `class-validator` decorators
2. Backend: Add controller method with `@ApiOperation()` + `@Public()` if public
3. Frontend: Add method to `services/api.ts`
4. Frontend: Map response in `CMSContext.tsx`

**Create plugin:**
1. New folder: `/plugins/{slug}/index.ts`
2. Export `NestPressPlugin` interface with lifecycle methods
3. Implement `registerHooks()` for filters/actions
4. Activate in admin UI (Appearance → Plugins)

**Create theme:**
1. New folder: `/themes/{slug}/`
2. Create `theme.json` + `index.tsx` + `templates/*.tsx`
3. Export `SiteNav`, `SiteFooter`, and all template components
4. Theme auto-appears in Appearance → Themes

**Debug issues:**
- Port conflicts? Frontend=3000, Backend=4000 (check `vite.config.ts`)
- CORS errors? Update `CORS_ORIGINS` in `backend/.env`
- 401 errors? Check `localStorage` for `nestpress_access_token`
- Hook not firing? Ensure `@HookProvider()` decorator and registered in module

---

## Quick Start (Critical Info)

**Architecture**: Full-stack TypeScript monorepo with frontend (React 19 + Vite) and backend (NestJS)  
**Navigation**: Enum-based view state (no React Router) - update `ViewState` in `types.ts` to add views  
**State**: React Context only (no Redux/Zustand) - `CMSContext` for data, `ConfigContext` for setup  
**Styling**: Tailwind CSS via CDN - no build step, use classes directly  
**API**: REST with JWT auth - global auth guard, use `@Public()` decorator for public routes  
**Ports**: Frontend 3000 (set in `vite.config.ts`), Backend 4000 (change `CORS_ORIGINS` if needed)  
**Theme System**: Runtime loading from `/themes` folder - use `/* @vite-ignore */` in dynamic imports  
**Critical Files**: `types.ts` (all interfaces), `CMSContext.tsx` (state + API), `services/api.ts` (API client)

## Project Overview

NestPress CMS is a full-stack headless CMS combining WordPress-like content management with Shopify-like e-commerce functionality. The project consists of:

- **Frontend**: React 19 admin dashboard built with Vite, TypeScript, and Tailwind CSS
- **Backend**: NestJS API with multi-database support, JWT authentication, and AI content generation
- **Hook System**: WordPress-like actions/filters with TypeScript safety and AI integration

The "Nest" in NestPress refers to the NestJS backend framework powering the API.

## Project Structure

```
nestpress-cms/
├── backend/                      # NestJS Backend API
│   ├── src/
│   │   ├── common/               # Shared utilities (guards, decorators, filters)
│   │   ├── config/               # Configuration modules (database, jwt, ai, payment)
│   │   ├── modules/              # Feature modules
│   │   │   ├── auth/             # JWT authentication
│   │   │   ├── users/            # User management
│   │   │   ├── posts/            # Blog posts
│   │   │   ├── pages/            # Static pages
│   │   │   ├── products/         # E-commerce products
│   │   │   ├── orders/           # Order management
│   │   │   ├── media/            # Media library
│   │   │   ├── themes/           # Theme system
│   │   │   ├── settings/         # Site settings
│   │   │   ├── ai/               # AI content generation
│   │   │   ├── hooks/            # WordPress-like hook system
│   │   │   └── database/         # Database abstraction (multi-provider)
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── components/                   # React components
├── contexts/                     # React contexts (CMS, Config)
├── hooks/                        # Custom React hooks + NestPress hook system
│   └── nestpress-hooks.ts        # Frontend hook utilities (actions/filters)
├── services/                     # Frontend services
├── utils/                        # Utility functions
└── package.json                  # Frontend dependencies
```

## Architecture

### State Management
- **Dual Context Pattern**: CMS state in `CMSContext.tsx`, configuration in `ConfigContext.tsx`
- Access CMS state with `useCMS()` hook, config with `useConfig()` hook
- **Menu System**: Fully integrated via `CMSContext` - use `menus`, `addMenu`, `updateMenu`, `deleteMenu`, `getMenuByLocation()` from `useCMS()`
- All context callbacks use `useCallback` for performance optimization
- Context values are memoized with `useMemo` to prevent unnecessary re-renders
- No external state library (Redux, Zustand) - keep it simple with React Context

### View Navigation
- Navigation is handled via `ViewState` enum in `types.ts`, not React Router
- `currentView` state in CMSContext controls which component renders in `App.tsx`
- `appMode` in ConfigContext determines: 'setup' | 'admin' | 'website'
- When adding new views: update `ViewState` enum → add case in `App.tsx` switch → add nav item in `Layout.tsx`
- **Fullscreen views** (like `THEME_PREVIEW`) render outside `Layout` - check `App.tsx` for pattern
- **Submenu pattern**: Appearance menu shows WordPress-style submenus (Themes, Menus, Widgets, Header) with collapsible parent

### Component Structure
```
App.tsx                           # Root + ErrorBoundary + view routing
├── contexts/
│   ├── CMSContext.tsx            # CMS state (posts, products, themes)
│   └── ConfigContext.tsx         # Setup wizard & system config
├── components/
│   ├── Layout.tsx                # Sidebar navigation + header
│   ├── ErrorBoundary.tsx         # Error catching & fallback UI
│   ├── wizard/                   # Setup wizard components
│   └── templates/                # Frontend theme/template system
├── hooks/                        # Custom React hooks
├── utils/                        # Utility functions
│   ├── constants.ts              # App-wide constants
│   ├── security.ts               # XSS prevention, sanitization
│   └── validation.ts             # Input validation helpers
└── services/
    └── geminiService.ts          # AI content generation
```

## Security Best Practices

### XSS Prevention
- **ALWAYS** use `sanitizeHTML()` from `utils/security.ts` before rendering user-generated HTML
- Use `sanitizeText()` for plain text inputs
- Use `sanitizeURL()` before rendering links
- Never use `dangerouslySetInnerHTML` with unsanitized content

### Input Validation
- Use validators from `utils/validation.ts` for all form inputs
- Validate API keys, emails, URLs before processing
- Use `safeJSONParse()` to prevent prototype pollution

### Rate Limiting
- AI services use `createRateLimiter()` to prevent abuse
- Default: 10 requests per minute for AI endpoints

### Secure Storage
- Use `secureStorage` wrapper for localStorage with expiration support
- Mask sensitive data with `maskSensitiveData()` for display

## Custom Hooks

Located in `hooks/index.ts`:
- `useDebounce` / `useDebouncedCallback` - Debounce values/functions
- `useLocalStorage` - Persist state with localStorage
- `useAsync` - Handle async operations with loading/error states
- `useToggle` - Boolean state toggle
- `useClickOutside` - Detect clicks outside element
- `useMediaQuery` - Responsive design
- `usePagination` - Pagination logic
- `useFilter` - Generic filtering with debounce

## Theme System (WordPress-like)

### How Themes Work
- Themes are loaded from the `/themes` folder at runtime (like WordPress)
- Each theme is a folder containing: `theme.json`, `index.tsx`, `templates/*.tsx`
- Backend scans `/themes` folder via `ThemesService.findAll()`
- Frontend loads theme components dynamically via `useTheme()` hook
- Theme switching is instant - no page reload needed

### Theme Folder Structure (WordPress-Compatible)
```
themes/{theme-name}/
├── theme.json                 # Theme metadata (WordPress theme.json v3 schema)
├── index.tsx                  # Main entry - exports all components
├── screenshot.svg             # Theme thumbnail
│
├── parts/                     # Reusable template parts (WordPress template-parts/)
│   ├── Header.tsx            # Site header with navigation
│   ├── Footer.tsx            # Site footer with widgets
│   ├── Sidebar.tsx           # Sidebar with widgets
│   └── PostMeta.tsx          # Post metadata display
│
├── patterns/                  # Pre-built content patterns (WordPress patterns/)
│   ├── HeroBanner.tsx        # Hero section with CTA
│   ├── PostsGrid.tsx         # Post grid layout (2/3/4 columns)
│   ├── FeatureGrid.tsx       # Feature cards grid
│   └── CTA.tsx               # Call-to-action section
│
├── templates/                 # Page templates (WordPress templates/)
│   ├── index.tsx             # Front page / Home
│   ├── single.tsx            # Single post
│   ├── page.tsx              # Static page
│   ├── page-with-sidebar.tsx # Page with sidebar
│   ├── archive.tsx           # Blog archive
│   ├── category.tsx          # Category archive
│   ├── search.tsx            # Search results
│   └── 404.tsx               # 404 error page
│
├── styles/                    # Style variations (WordPress styles/)
│   ├── onyx.json             # Dark theme variant
│   ├── mint.json             # Green theme variant
│   └── ocean.json            # Blue theme variant
│
└── assets/                    # Theme assets
    ├── css/                  # Stylesheets
    ├── fonts/                # Web fonts
    └── images/               # Theme images
```

### Adding New Themes
1. Create folder in `/themes/{theme-name}/`
2. Create `theme.json` with WordPress-compatible metadata (use theme.json v3 schema)
3. Create `index.tsx` to export all theme components
4. Create `parts/` folder with reusable components (Header, Footer, Sidebar, PostMeta)
5. Create `patterns/` folder with pre-built layouts (optional)
6. Create `templates/` folder with page templates (index, single, page, archive, etc.)
7. Create `styles/` folder with style variations (optional)
8. Create `assets/` folder for CSS, fonts, images (optional)
9. Theme auto-appears in Appearance → Themes via API

### Using Theme Parts (WordPress get_header/get_footer pattern)
```tsx
// Import reusable parts
import { Header, Footer, Sidebar, PostMeta } from '../index';

// Use in templates
<Header primaryMenu={primaryMenu} header={header} />
<Sidebar widgets={sidebarWidgets} recentPosts={posts} categories={categories} />
<PostMeta post={post} showAuthor showDate showCategories showTags />
<Footer footerMenu={footerMenu} footerWidgets={footerWidgets} header={header} />
```

### Using Theme Patterns (WordPress Block Patterns)
```tsx
// Import pre-built patterns
import { HeroBanner, PostsGrid, FeatureGrid, CTA } from '../index';

// Use in templates
<HeroBanner title="Welcome" subtitle="Your subtitle" ctaText="Get Started" ctaUrl="/blog" />
<PostsGrid posts={posts} columns={3} showExcerpt showMeta showFeaturedImage />
<FeatureGrid features={[...]} columns={3} heading="Features" />
<CTA title="Subscribe" description="Get updates" showEmailForm={true} />
```

### WordPress-like Settings System
- **Location**: `components/Settings.tsx` - comprehensive settings UI with 8 WordPress tabs
- **Tabs**: General, Writing, Reading, Discussion, Media, Permalinks, Privacy, System
- **Pattern**: Tab-based navigation with form sections, matches WordPress Settings exactly
- Access via `siteSettings` from `useCMS()`, update with `updateSiteSettings()`

**Settings Categories:**
- **General**: Site title, tagline, URL, admin email, timezone, date/time formats, language
- **Writing**: Default post category, post format
- **Reading**: Homepage type (posts/page), posts per page, RSS feeds, search engine visibility
- **Discussion**: Comments (enable/moderation/threading), email notifications, avatars
- **Media**: Image sizes (thumbnail/medium/large), embed settings, upload organization
- **Permalinks**: URL structure (plain/day-name/month-name/postname/custom), category/tag bases
- **Privacy**: Privacy policy page, comment cookies consent
- **System**: Read-only system info (version, Node.js, database provider)

**Implementation Pattern:**
```typescript
// Local state for form editing
const [localSettings, setLocalSettings] = useState<SiteSettings>(siteSettings);

// Update helper
const updateLocalSettings = (updates: Partial<SiteSettings>) => {
  setLocalSettings(prev => ({ ...prev, ...updates }));
};

// Save to context
const handleSave = async () => {
  await updateSiteSettings(localSettings);
};
```

## Menu System (WordPress-like)

### How Menus Work
- Fully functional admin interface at **Appearance → Menus**
- Menus managed via `CMSContext` - automatically synced with backend
- Support for multiple locations: primary (header), footer, mobile, custom
- Drag-and-drop reordering with visual feedback
- Each menu item has: label, URL, icon, target (same/new window), order

### Managing Menus in Admin
```typescript
// Access from CMSContext
const { menus, addMenu, updateMenu, deleteMenu, getMenuByLocation } = useCMS();

// Create menu
await addMenu({
  id: 'menu_id',
  name: 'Main Navigation',
  slug: 'main-navigation',
  location: 'primary',
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Get menu by location
const primaryMenu = getMenuByLocation('primary');
```

### Using Menus in Themes
All theme templates receive menu props automatically:
```typescript
// themes/your-theme/index.tsx
export function SiteNav({ primaryMenu }: { primaryMenu?: Menu }) {
  const items = primaryMenu?.items || defaultItems;
  
  return (
    <nav>
      {items.sort((a, b) => a.order - b.order).map(item => (
        <a key={item.id} href={item.url} target={item.target}>
          {item.icon && <span>{item.icon}</span>}
          {item.label}
        </a>
      ))}
    </nav>
  );
}
```

### Menu API Endpoints
```bash
GET  /api/v1/appearance/menus              # Get all menus (Public)
GET  /api/v1/appearance/menus/location/:loc # Get by location (Public)
POST /api/v1/appearance/menus              # Create (Admin/Editor)
PUT  /api/v1/appearance/menus/:id          # Update (Admin/Editor)
DELETE /api/v1/appearance/menus/:id        # Delete (Admin)
POST /api/v1/appearance/menus/:id/items    # Add item (Admin/Editor)
PUT  /api/v1/appearance/menus/:id/items/:itemId  # Update item
DELETE /api/v1/appearance/menus/:id/items/:itemId # Delete item
POST /api/v1/appearance/menus/:id/reorder  # Reorder items
```

### Menu Component Features
- **AppearanceMenus.tsx**: Full CRUD with drag-and-drop
- Create/edit/delete menus with modal dialogs
- Add/edit/delete menu items inline
- Real-time preview of changes
- Automatic save to backend API
- See `MENU_SYSTEM.md` for complete documentation

## Setup Wizard System

### Configuration Architecture
- Wizard steps defined in `ConfigContext.tsx`
- Each provider type has dedicated config interface (e.g., `FirebaseConfig`, `StripeConfig`)
- Config persisted to localStorage with `STORAGE_KEYS.CONFIG`

### Supported Providers
- **Database**: Firebase, MongoDB, DynamoDB, Supabase
- **AI**: Google Gemini, OpenAI, Anthropic
- **Payments**: Stripe, PayPal, Square

### Adding New Providers
1. Add provider type to enum in `types.ts` (e.g., `DatabaseProvider`)
2. Create config interface extending `ServiceConfigBase`
3. Add to union type (e.g., `DatabaseConfig`)
4. Add UI card in step component (e.g., `DatabaseStep.tsx`)

## Plugin System (WordPress-like)

NestPress features a complete WordPress-like plugin system for extensibility without modifying core code.

### Plugin Architecture

**Location**: Plugins live in `/plugins/{plugin-slug}/` folder with an `index.ts` entry point

**Backend Loader**: `backend/src/modules/plugins/plugin-loader.service.ts`
- Scans `/plugins` folder at startup
- Dynamically loads active plugins
- Provides Plugin API to each plugin
- Manages plugin lifecycle (activate/deactivate)

**Frontend Integration**: Plugins extend both admin UI and public frontend

### Creating a Plugin

**File Structure:**
```
plugins/my-plugin/
├── index.ts          # Plugin entry point (required)
├── package.json      # Plugin metadata
└── README.md         # Documentation
```

**Plugin Template (`index.ts`):**
```typescript
/**
 * Plugin Name: My Plugin
 * Description: What the plugin does
 * Version: 1.0.0
 * Author: Your Name
 * Requires at least: 1.0.0
 */

interface NestPressPlugin {
  metadata?: Record<string, string>;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  setup?: (api: any) => Promise<void>;
  registerHooks?: (api: any) => void;
  registerRoutes?: (api: any) => void;
  registerAdminMenu?: (api: any) => void;
  registerSettings?: (api: any) => void;
}

const MyPlugin: NestPressPlugin = {
  metadata: {
    Name: 'My Plugin',
    Version: '1.0.0',
  },

  onActivate: async () => {
    console.log('Plugin activated!');
  },

  setup: async (api: any) => {
    // Initialization logic
  },

  registerHooks: (api: any) => {
    // Content filters (WordPress the_content filter)
    api.addFilter('post:content_filter', async (content: string) => {
      return content + '<p>Added by plugin</p>';
    }, 10);

    // Actions (side effects)
    api.addAction('post:after_create', async (post: any) => {
      console.log('New post:', post.title);
    });

    // Shortcodes (WordPress shortcodes)
    api.addShortcode('myshortcode', (attrs: any, content: string) => {
      return `<div class="my-shortcode">${content}</div>`;
    });
  },

  registerAdminMenu: (api: any) => {
    // Add top-level menu
    api.addMenuPage({
      pageTitle: 'My Plugin',
      menuTitle: 'My Plugin',
      capability: 'manage_options',
      menuSlug: 'my-plugin',
      icon: 'Settings',
      position: 100,
      component: MyPluginPage, // React component
    });

    // Add submenu
    api.addSubmenuPage({
      parentSlug: 'my-plugin',
      pageTitle: 'Settings',
      menuTitle: 'Settings',
      menuSlug: 'my-plugin-settings',
      component: SettingsPage,
    });
  },
};

export default MyPlugin;
```

### Plugin API Methods

**Hooks & Filters:**
```typescript
api.addFilter(hookName, handler, priority);    // Transform data
api.addAction(hookName, handler, priority);    // Side effects
api.removeFilter(hookName, handler);
api.removeAction(hookName, handler);
```

**Assets (WordPress wp_enqueue_style/script):**
```typescript
api.enqueueStyle('handle', 'https://cdn.../style.css', [], '1.0', 'all');
api.enqueueScript('handle', 'https://cdn.../script.js', [], '1.0', true);
```

**Shortcodes:**
```typescript
api.addShortcode('gallery', (attrs, content, tag) => {
  return `<div class="gallery">${content}</div>`;
});
```

**Widgets:**
```typescript
api.registerWidget('my-widget', {
  title: 'My Widget',
  location: 'sidebar',  // sidebar, footer, header
  render: (props) => `<div>${props.text}</div>`,
});
```

**Admin Menu:**
```typescript
api.addMenuPage({ pageTitle, menuTitle, menuSlug, icon, component });
api.addSubmenuPage({ parentSlug, pageTitle, menuSlug, component });
```

**Logging:**
```typescript
api.log('Message');          // Info
api.error('Error message');  // Error
api.warn('Warning');         // Warning
```

### Plugin Activation/Deactivation

**Admin UI**: Appearance → Plugins
- List all plugins from `/plugins` folder
- Toggle active/inactive status
- Active plugins persist to backend via API

**API Endpoints:**
```bash
GET  /api/v1/plugins                       # List all plugins
POST /api/v1/plugins/:slug/activate        # Activate plugin (auto-installs dependencies)
POST /api/v1/plugins/:slug/deactivate      # Deactivate plugin
DELETE /api/v1/plugins/:slug               # Delete plugin
GET  /api/v1/plugins/assets                # Get enqueued assets
GET  /api/v1/plugins/widgets               # Get registered widgets
GET  /api/v1/plugins/:slug/admin-menu      # Get plugin admin menu items

# Plugin Custom Routes (example)
GET  /api/v1/plugins/:slug/progress/:jobId # SSE endpoint for progress streams
POST /api/v1/plugins/:slug/*               # Any custom route registered by plugin
```

### Frontend Plugin Features

**1. Content Filters** - Applied in `components/Loop.tsx` template tags:
```typescript
// TheContent, TheTitle, TheExcerpt automatically apply filters
<TheContent post={post} />  // Runs post:content_filter
```

**2. Asset Loading** - Automatic in `components/templates/WebsiteFrontend.tsx`:
```typescript
// Fetches plugin styles/scripts from API, injects into DOM
useEffect(() => {
  const assets = await api.plugins.getAssets();
  // Dynamically load CSS/JS
}, []);
```

**3. Widgets** - Use `<PluginWidgetArea />` in themes:
```typescript
<PluginWidgetArea location="sidebar" />
<PluginWidgetArea location="footer" />
```

**4. Template Hooks** - Use NestPress hooks in custom components:
```typescript
const { doAction, applyFilters } = useNestPressHooks();

// Apply filter before display
const filtered = await applyFilters('my:filter', content);

// Execute action
await doAction('my:action', data);
```

**5. Server-Sent Events (SSE)** - Real-time progress streaming:
```typescript
// Backend: Register SSE endpoint in plugin
api.registerRoute('GET', '/progress/:jobId', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send progress updates
  res.write(`data: ${JSON.stringify({ phase: 'started', progress: 0 })}\n\n`);
  // ... streaming logic
});

// Frontend: Subscribe to SSE stream
const eventSource = new EventSource('/api/v1/plugins/my-plugin/progress/' + jobId);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Progress:', data.progress);
};
```

### Built-in Example Plugins

**hello-nestpress** (`/plugins/hello-nestpress/`)
- Simple demo showing basic plugin structure
- Displays random quotes in admin dashboard
- Shows shortcode usage, admin menu, settings

**contact-form** (`/plugins/contact-form/`)
- Contact form builder with spam protection
- Demonstrates shortcodes, form handling, admin pages
- Email notifications and submission management

**seo-toolkit** (`/plugins/seo-toolkit/`)
- SEO optimization with meta tags
- Content analysis and suggestions
- Sitemap generation

**ai-theme-factory** (`/plugins/ai-theme-factory/`) - **Advanced Example**
- AI-powered theme generation from any public website URL
- Demonstrates complex plugin architecture with multi-phase pipeline
- Shows Server-Sent Events (SSE) for real-time progress streaming
- Backend handlers, file system operations, and admin UI integration
- Automatic dependency installation via package.json
- **5-Phase Pipeline**: Analysis → Cloning → Assembly → NestPressification → Packaging
- Creates installable .zip themes with complete structure (templates, parts, assets)
- See `/plugins/ai-theme-factory/README.md` and `ARCHITECTURE.md` for details

### Plugin Development Workflow

1. Create folder in `/plugins/{slug}/`
2. Create `index.ts` with plugin interface
3. Implement lifecycle methods (onActivate, setup, registerHooks)
4. **Optional**: Add `package.json` for npm dependencies - backend auto-installs on activation
5. Test by activating in admin UI
6. Plugin auto-loads on next backend restart

**Advanced Features:**
- **SSE Routes**: Register Server-Sent Events endpoints with `api.registerRoute('GET', '/progress/:id', handler)`
- **File Operations**: Backend plugin handlers have full Node.js filesystem access
- **TypeScript Support**: Plugins can be `.ts` files - automatically transpiled via ts-node
- **Dependency Auto-Install**: If `package.json` exists, backend runs `npm install` in plugin folder on activation

## Key Patterns

### Adding New Entities
Follow the existing pattern:
1. Define interface in `types.ts` (e.g., `Product`, `Order`)
2. Add initial mock data array in `CMSContext.tsx`
3. Create state + `useCallback` CRUD functions
4. Add to memoized context value

### AI Content Generation
- Located in `services/geminiService.ts`
- All AI functions sanitize inputs and outputs
- Rate limited to prevent API abuse
- Error handling with graceful fallbacks

### Error Handling
- Wrap app with `ErrorBoundary` component
- Use `useAsync` hook for async operations
- Display user-friendly error messages from `ERROR_MESSAGES` constants

## Development Workflow

### First-Time Setup
```bash
# Frontend
npm install
cp .env.example .env.local
# Edit .env.local with required values:
# - VITE_API_URL=http://localhost:4000/api/v1
# - Optional: VITE_DEBUG=true for development

# Backend (separate terminal)
cd backend
npm install
cp .env.example .env
# Edit .env with required values:
# - DATABASE_PROVIDER=firebase|mongodb|dynamodb|supabase
# - JWT_SECRET, JWT_REFRESH_SECRET (change defaults)
# - Provider-specific keys (FIREBASE_PROJECT_ID, MONGODB_URI, etc.)
# - Optional: SEED_DATA=true to auto-seed demo data
# - Optional: AI_PROVIDER and keys for AI features
```

### Running the App
```bash
# Terminal 1: Backend (port 4000)
cd backend && npm run start:dev
# Note: Backend defaults to port 3000 in .env.example - change PORT=4000 in .env

# Terminal 2: Frontend (port 3000)
npm run dev

# Backend additional commands
npm run start:debug   # Debug mode with --watch
npm run start:prod    # Production mode (after npm run build)
npm run format        # Prettier format
npm run test          # Jest tests
npm run test:watch    # Jest watch mode
npm run test:cov      # Coverage report

# Frontend additional commands
npm run build         # Production build
npm run preview       # Preview production build
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/v1 (if PORT=4000 in backend/.env)
- API Docs: http://localhost:4000/docs
- OpenAPI Spec: http://localhost:4000/api/openapi.json

### Critical Configuration Notes
- **Frontend runs on port 3000** (NOT 5173 as typical Vite default - explicitly set in `vite.config.ts`)
- **Backend runs on port 4000** (configurable via `.env` PORT variable, defaults to 3000 if not set - recommended to set `PORT=4000`)
- **API prefix is `/api/v1`** - ALL backend routes use this prefix (set in `main.ts`)
- **CORS Configuration**: Backend allows `localhost:5173` and `localhost:3001` by default - **MUST ADD** `http://localhost:3000` to `CORS_ORIGINS` in `backend/.env` or set `CORS_ORIGINS=http://localhost:3000,http://localhost:5173`
- **Theme loading**: Uses `fs.allow: ['..', 'themes']` in Vite config for dynamic runtime imports with `/* @vite-ignore */` comment
- **Environment Files**: Both frontend (`.env.local`) and backend (`.env`) have `.example` templates
- **Rate Limiting**: Three tiers configured in `app.module.ts` - short (20/sec), medium (100/10sec), long (500/min)
- **Swagger**: Only enabled in non-production (`NODE_ENV !== 'production'`) for security

### Demo Data Seeding
```bash
# Option 1: Auto-seed on startup (add to backend/.env)
SEED_DATA=true

# Option 2: Manual via API (requires admin token)
POST http://localhost:4000/api/v1/database/seed
```

**Demo Credentials:**
- Admin: `admin@nestpress.com` / `admin123`
- Editor: `editor@nestpress.com` / `editor123`

## Styling Conventions
- Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com">` in `index.html`)
- Inter font family globally applied
- Backend: gray backgrounds (`#f0f0f1`), blue primary accent
- Frontend: theme-driven colors via `theme.colors.*`
- Use `animate-fade-in` class for view transitions
- Icon library: `lucide-react` - import icons individually

## Type Definitions
All TypeScript interfaces and enums are centralized in `types.ts`:
- `Post`, `Product`, `Order`, `Comment`, `Plugin`, `User` - data models
- `Menu`, `MenuItem` - navigation menu system
- `Theme` - theme configuration (colors, fonts, layout)
- `SiteSettings` - **comprehensive WordPress-like site settings** with 8 categories:
  - General (site info, timezone, language)
  - Writing (default category/format)
  - Reading (homepage, posts per page, feeds)
  - Discussion (comments, moderation, avatars)
  - Media (image sizes, embeds)
  - Permalinks (URL structure)
  - Privacy (policy page, cookies)
  - System (version info)
- `PostStatus` enum: `PUBLISHED`, `DRAFT`, `TRASH`
- `ViewState` enum: all navigation states (includes `SETTINGS`, `APPEARANCE_MENUS`)
- `CMSContextType` - full context shape (includes `menus`, `siteSettings`, CRUD methods)

## Path Aliases
Use `@/*` alias for imports from project root (configured in `tsconfig.json` and `vite.config.ts`):
```typescript
import { Post, Theme, SiteSettings } from '@/types';
import { useCMS } from '@/contexts/CMSContext';
```

## Critical Code Patterns

### DataCard Building Block Pattern
**MANDATORY unified card component for ALL admin views** - ensures consistent WordPress-style design across the entire dashboard.

**Location**: `components/common/DataCard.tsx`

**Why This Matters**: 
- **DO NOT create custom card styles** - always use DataCard components
- Maintains consistent borders (`border-gray-300`), shadows (`shadow-sm`), and spacing
- WordPress-style white cards with clean, minimal design
- Used in: Themes, Menus, Widgets, Header, Settings, Dashboard, all admin views

**Available Components**:
```typescript
import { 
  DataCard,           // Main container
  DataCardHeader,     // Header with optional actions
  DataCardBody,       // Body content
  DataCardFooter,     // Footer (optional)
  DataCardGrid,       // Grid layout wrapper (1-4 cols)
  DataCardHover       // Hover variant for clickable cards
} from './common/DataCard';
```

**Usage Pattern**:
```typescript
// Standard card with header and body
<DataCard>
  <DataCardHeader actions={<button>Action</button>}>
    Section Title
  </DataCardHeader>
  <DataCardBody>
    Your content here
  </DataCardBody>
</DataCard>

// Hover card for themes, products, etc.
<DataCardHover onClick={() => handleClick()}>
  <img src="..." />
  <div className="p-4">Card content</div>
</DataCardHover>

// Grid layout
<DataCardGrid cols={3}>
  <DataCard>...</DataCard>
  <DataCard>...</DataCard>
  <DataCard>...</DataCard>
</DataCardGrid>
```

**When creating admin UI components**:
1. **ALWAYS use DataCard** - never create custom `bg-white rounded-lg border` divs
2. Use `DataCardHeader` for section titles with optional action buttons
3. Use `DataCardBody` for content with consistent padding
4. Use `DataCardHover` for clickable/interactive cards
5. Use `DataCardGrid` for responsive grid layouts

### DataTable Building Block Pattern
**Reusable WordPress-like table component** for all listing pages (Posts, Pages, Products, Orders, Users, etc.):

**Location**: `components/common/DataTable.tsx`

**Features**:
- Bulk actions with checkboxes
- Search & filtering
- Quick edit inline (WordPress-style)
- Row actions (Edit, Delete, View)
- Status filters
- Empty states
- Responsive design

**Usage Pattern**:
```typescript
import { DataTable, Column, StatusFilter, BulkAction, QuickEditField } from './common/DataTable';

const columns: Column<Post>[] = [
  { key: 'title', label: 'Title', render: (item) => item.title },
  { key: 'author', label: 'Author' },
];

const statusFilters: StatusFilter[] = [
  { label: 'Published', value: 'published', count: items.filter(...).length },
];

const bulkActions: BulkAction[] = [
  { label: 'Delete', value: 'delete', onExecute: (ids) => ids.forEach(deleteItem) },
];

const quickEditFields: QuickEditField[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: [...] },
];

<DataTable
  title="Items"
  data={items}
  columns={columns}
  onEdit={(item) => handleEdit(item)}
  onDelete={(item) => handleDelete(item)}
  onNew={handleNew}
  statusFilters={statusFilters}
  bulkActions={bulkActions}
  quickEditFields={quickEditFields}
  onQuickEdit={(item, updates) => updateItem(item.id, updates)}
/>
```

**When creating new list pages**:
1. Define `Column<T>[]` for table columns
2. Define `StatusFilter[]` for status tabs
3. Define `BulkAction[]` for bulk operations
4. Define `QuickEditField[]` for inline editing
5. Pass all to `<DataTable />` - NO custom table HTML needed

### API Integration Pattern
Frontend communicates with backend via `services/api.ts`:
- Centralized API client with typed methods for all endpoints
- Token management via `tokenManager` (stores JWT in localStorage)
- Custom fetch-based client with automatic token injection in request headers
- All responses wrapped in `ApiResponse<T>` or `PaginatedResponse<T>`
- Base URL configured from `VITE_API_URL` environment variable
- No axios dependency - uses browser's native fetch API

**Critical API Client Configuration:**
```typescript
// services/api.ts pattern - Custom fetch-based client (no axios)
class ApiClient {
  private baseUrl = import.meta.env.VITE_API_URL; // http://localhost:4000/api/v1

  private async getHeaders(includeAuth = true): Promise<HeadersInit> {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (includeAuth) {
      const token = tokenManager.getAccessToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: await this.getHeaders()
    });
    return response.json();
  }
}
```

**Adding New API Endpoints:**
1. Backend: Create DTO in `dto/` folder with `class-validator` decorators
2. Backend: Add controller method with `@ApiOperation()` Swagger decorator
3. Frontend: Add typed method to corresponding service in `services/api.ts`
4. Frontend: Map backend response format to frontend types (see `CMSContext.tsx` mappers)

**API Response Format:**
```typescript
// Success response
{ success: true, data: T, timestamp: string }

// Error response
{ success: false, message: string, statusCode: number }

// Paginated response
{ success: true, data: T[], total: number, page: number, limit: number }
```

### Context Pattern (No Redux/Zustand)
```typescript
// CMSContext owns data state + CRUD operations
const { posts, createPost, updatePost } = useCMS();

// ConfigContext owns wizard/system config
const { appMode, setupComplete } = useConfig();

// AuthContext owns authentication state
const { isAuthenticated, currentUser, login, logout } = useAuth();
```

**State updates MUST use `useCallback` for functions:**
```typescript
const createPost = useCallback(async (data: CreatePostDto) => {
  const newPost = await postsApi.create(data);
  setPosts(prev => [...prev, mapApiPostToPost(newPost)]);
}, []);
```

**Authentication Flow:**
```typescript
// 1. Login stores tokens in localStorage via tokenManager
await authApi.login({ email, password }); // Returns { accessToken, refreshToken }

// 2. Tokens automatically injected in API requests
private async getHeaders(includeAuth = true): Promise<HeadersInit> {
  const token = tokenManager.getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
}

// 3. Backend validates JWT with global JwtAuthGuard
// 4. On 401, frontend can refresh token or redirect to login
// 5. Logout clears tokens from localStorage
```

### Dynamic Theme Loading (Runtime, Not Build)
Themes are loaded at runtime via dynamic imports:
```typescript
// In themeLoader.ts
const themeModule = await import(
  /* @vite-ignore */
  `/themes/${slug}/index.tsx?t=${Date.now()}`
);
```

**Why the pattern:**
- Themes load without rebuild (like WordPress)
- `?t=${Date.now()}` cache-busts during development
- `/* @vite-ignore */` prevents Vite from bundling themes
- Vite config excludes themes from optimizeDeps

**When adding theme features:**
- Never import themes directly in components
- Always use `useTheme()` hook or `themeLoader.loadTheme()`
- Themes must export all templates as named exports

---

## NestJS Backend Architecture

### Core Concepts

#### Dynamic Modules
The database module uses the factory pattern to support multiple providers:
```typescript
// DatabaseModule.forRoot() dynamically selects provider based on config
DatabaseModule.forRoot()  // Reads DATABASE_PROVIDER from env
```

#### Configuration
- All config uses `@nestjs/config` with Joi validation schema (`config/config.schema.ts`)
- Namespaced configs: `app`, `database`, `jwt`, `ai`, `payment` - each in separate file
- Global config module - available in all modules without import
- Access via `ConfigService.get<string>('database.provider')`
- Environment file loading order: `.env.${NODE_ENV}` → `.env` (cascading)

#### Module Loading Order (Critical for Dependencies)
In `app.module.ts`, modules load in this order:
1. `ConfigModule` (global) - environment & validation
2. `ThrottlerModule` (global) - rate limiting
3. `DatabaseModule.forRoot()` - database connection
4. `HooksModule` - **MUST be early** to capture lifecycle events
5. `HealthModule`, `SystemConfigModule` - system utilities
6. `AuthModule`, `UsersModule` - authentication/authorization
7. Feature modules (Posts, Products, etc.)
8. `PluginsModule` - loads last to access all hooks

#### Authentication
- JWT-based with access + refresh tokens
- Global `JwtAuthGuard` - use `@Public()` decorator for public routes
- Role-based access with `@Roles(Role.ADMIN)` decorator
- Password hashing with bcrypt (10 rounds)

### Backend Module Structure

```
backend/src/modules/[module]/
├── [module].module.ts      # Module definition
├── [module].service.ts     # Business logic
├── [module].controller.ts  # HTTP endpoints
├── dto/                    # Request/Response DTOs
│   ├── create-[entity].dto.ts
│   └── update-[entity].dto.ts
├── entities/               # Entity definitions
│   └── [entity].entity.ts
└── index.ts                # Barrel exports
```

### Database Abstraction Layer

The `DatabaseService` provides a unified interface for all database providers:

```typescript
interface DatabaseProvider {
  findById<T>(collection: string, id: string): Promise<T | null>;
  findAll<T>(collection: string, options?: QueryOptions): Promise<{ data: T[]; total: number }>;
  findByField<T>(collection: string, field: string, value: any): Promise<T | null>;
  create<T>(collection: string, data: Partial<T>): Promise<T>;
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
  delete(collection: string, id: string): Promise<boolean>;
  query<T>(collection: string, queryBuilder: QueryBuilder): Promise<T[]>;
}
```

### Adding New Backend Modules

1. Create module structure in `backend/src/modules/[name]/`
2. Define entity in `entities/`
3. Create DTOs with `class-validator` decorators
4. Implement service with `DatabaseService` injection
5. Create controller with proper decorators and guards
6. Register module in `app.module.ts`

### API Conventions

- All routes prefixed with `/api/v1/`
- Public routes use `@Public()` decorator
- Protected routes require JWT Bearer token
- Role-restricted routes use `@Roles(Role.ADMIN)`
- Pagination: `?page=1&limit=10`
- Responses wrapped with success, data, timestamp

### Backend Development Commands

```bash
cd backend
npm install
cp .env.example .env      # Configure your environment
npm run start:dev         # Start with hot reload (uses nest CLI)
npm run start:debug       # Debug mode with --watch
npm run build             # Build for production
npm run start:prod        # Run production build (after build)
npm run format            # Prettier format code
npm run lint              # ESLint with auto-fix
npm run test              # Run Jest tests
npm run test:watch        # Jest watch mode
npm run test:cov          # Generate coverage report
npm run test:e2e          # End-to-end tests
```

### Global Guards Pattern
The app uses **global JWT auth** - all routes are protected by default:

```typescript
// In app.module.ts - JwtAuthGuard is global
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,
}
```

**To make routes public, use `@Public()` decorator:**
```typescript
import { Public } from '@/common/decorators/public.decorator';

@Public()  // Bypasses JWT guard
@Get('published')
async getPublishedPosts() { }
```

**Role-based access:**
```typescript
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/role.enum';

@Roles(Role.ADMIN, Role.EDITOR)  // Only admins and editors
@Post()
async createPost() { }
```

**Get current user in controllers:**
```typescript
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Post()
async createPost(@CurrentUser() user: User) {
  // user is automatically injected
}
```

---

## WordPress-like Features

NestPress implements WordPress patterns with modern TypeScript and React:

### Content Filtering Pipeline

WordPress applies filters to content before display. NestPress does the same via `ContentFiltersService`:

**WordPress:**
```php
// the_content filter chain (11 filters)
add_filter('the_content', 'wptexturize');       // Smart quotes
add_filter('the_content', 'wpautop');           // Auto paragraphs
add_filter('the_content', 'convert_smilies', 20); // Emoji
add_filter('the_content', 'do_shortcode', 11);  // Shortcodes

// Display content
the_content(); // Applies all filters
```

**NestPress Backend:**
```typescript
// backend/src/modules/hooks/content-filters.service.ts
@HookProvider({ namespace: 'core' })
export class ContentFiltersService {
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 5 })
  async sanitizeContent(content: string): Promise<string> { }
  
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 10 })
  async wpautop(content: string): Promise<string> { }
  
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 15 })
  async wptexturize(content: string): Promise<string> { }
  
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 25 })
  async doShortcode(content: string): Promise<string> { }
}

// API applies filters before returning
async findBySlugForDisplay(slug: string) {
  const post = await this.findBySlug(slug);
  return this.applyDisplayFilters(post); // Runs all filters
}
```

**Built-in Filters:**
- `sanitizeContent` (priority 5) - XSS protection
- `wpautop` (priority 10) - Double newlines → `<p>` tags
- `wptexturize` (priority 15) - Smart quotes, em/en dashes, ellipsis
- `convertSmilies` (priority 20) - `:)` → 😊
- `doShortcode` (priority 25) - `[gallery]`, `[video]`, `[embed]`
- `addLazyLoading` (priority 30) - `loading="lazy"` to images

### The Loop System

WordPress loop pattern implemented in React:

**WordPress:**
```php
<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
  <h2><?php the_title(); ?></h2>
  <div><?php the_content(); ?></div>
<?php endwhile; endif; ?>
```

**NestPress Frontend:**
```tsx
// components/Loop.tsx
<Loop posts={posts}>
  {(post, index) => (
    <>
      <TheTitle post={post} link={true} />
      <TheContent post={post} />
      <TheMeta post={post} />
      <ThePermalink post={post}>Read more</ThePermalink>
    </>
  )}
</Loop>
```

**Template Tags (components):**
- `<TheTitle post={post} />` - WordPress `the_title()`
- `<TheContent post={post} />` - WordPress `the_content()`
- `<TheExcerpt post={post} />` - WordPress `the_excerpt()`
- `<TheMeta post={post} />` - Post metadata (date, author, views)
- `<TheFeaturedImage post={post} />` - WordPress `the_post_thumbnail()`
- `<ThePermalink post={post} />` - WordPress `the_permalink()`
- `<TheCategories post={post} />` - Category links
- `<TheTags post={post} />` - Tag links
- `<ThePagination />` - WordPress `the_posts_pagination()`

### Template Hierarchy

NestPress routes to templates like WordPress:

**WordPress Hierarchy:**
```
front-page.php → home.php → index.php
single.php → singular.php → index.php
page-{slug}.php → page.php → singular.php → index.php
category-{slug}.php → category.php → archive.php → index.php
404.php
```

**NestPress:**
```typescript
// Templates loaded from /themes/{active-theme}/templates/
// Each theme contains these template files:
- index.tsx       (front-page, home)
- single.tsx      (single post)
- page.tsx        (static page)
- archive.tsx     (blog archive)
- category.tsx    (category archives)
- search.tsx      (search results)
- 404.tsx         (404 error page)
```

**Conditional Tags:**
```typescript
const { isFrontPage, isSingle, isArchive } = useConditionalTags(context);

if (isFrontPage()) { /* show featured posts */ }
if (isSingle()) { /* show post navigation */ }
if (isArchive()) { /* show category description */ }
```

### WordPress-like Template Hooks

NestPress implements WordPress template hooks for plugins to inject code into `<head>` and `<body>`:

**Available Hooks:**
```typescript
// wp_head - Fires in document <head> (WordPress equivalent)
doAction('wp_head', { theme, page, route });

// wp_body_open - Fires after <body> opening tag (WordPress 5.2+)
doAction('wp_body_open', { theme, page, route });

// wp_footer - Fires before </body> closing tag (WordPress equivalent)
doAction('wp_footer', { theme, page, route });

// body_class - Filter body classes (WordPress equivalent)
const classes = await applyFilters('body_class', 'home front-page theme-default');
```

**Body Classes (WordPress body_class()):**
- `home`, `front-page` - Homepage
- `single`, `single-post`, `postid-{id}` - Single post view
- `page`, `page-id-{id}`, `page-{slug}` - Static page view
- `archive`, `blog` - Blog archive
- `category`, `category-{slug}` - Category archive
- `search`, `search-results` - Search results
- `error404` - 404 page
- `logged-in` - User is authenticated
- `theme-{slug}` - Active theme

**Plugin Usage:**
```typescript
// In plugin's registerHooks()
api.addAction('wp_head', () => {
  console.log('Injecting into <head>');
  // Add meta tags, analytics scripts, etc.
});

api.addAction('wp_footer', () => {
  console.log('Injecting before </body>');
  // Add footer scripts, widgets, etc.
});

api.addFilter('body_class', (classes: string) => {
  return classes + ' my-custom-class';
});
```

**Implementation:**
- `WebsiteFrontend.tsx` automatically executes these hooks
- Body classes applied to `<body>` element and wrapper div
- Plugin assets (CSS/JS) loaded via `wp_enqueue_style/script` equivalent

## WordPress-like Hook System

NestPress implements a WordPress-inspired hook system with TypeScript safety, async support, and AI integration. The hook system enables extensibility without modifying core code.

### Hook Concepts

| WordPress | NestPress | Description |
|-----------|-----------|-------------|
| `do_action()` | `doAction()` | Execute side effects without returning values |
| `apply_filters()` | `applyFilters()` | Transform data through a pipeline |
| `add_action()` | `addAction()` | Register an action handler |
| `add_filter()` | `addFilter()` | Register a filter handler |
| `remove_action()` | `removeAction()` | Unregister an action handler |
| `remove_filter()` | `removeFilter()` | Unregister a filter handler |
| Priority system | Priority system | Lower number = earlier execution (default: 10) |

### Hook System Architecture

```
backend/src/modules/hooks/
├── hooks.service.ts           # Central registry & executor
├── hooks.controller.ts        # REST API for hook management
├── hook-explorer.service.ts   # Auto-discovers decorated hooks
├── ai-hooks.service.ts        # AI-powered hook handlers
├── decorators/
│   └── hook.decorators.ts     # @OnAction, @OnFilter, @AIHook, @HookProvider
├── interfaces/
│   └── hook.interfaces.ts     # TypeScript interfaces & enums
└── hooks.module.ts            # Global NestJS module
```

### Backend Hook Usage

#### Using Decorators (Recommended)

```typescript
import { Injectable } from '@nestjs/common';
import { HookProvider, OnAction, OnFilter, AIHook } from '../hooks/decorators';
import { HookContext, ContentHook } from '../hooks/interfaces';

@HookProvider({ namespace: 'my-plugin' })
@Injectable()
export class MyHooksService {
  // Action - side effects only
  @OnAction(ContentHook.POST_AFTER_CREATE, { priority: 10 })
  async onPostCreated(post: any, context: HookContext): Promise<void> {
    console.log(`Post created: ${post.title}`);
    // Send notification, update cache, etc.
  }

  // Filter - transform data
  @OnFilter(ContentHook.POST_CONTENT_FILTER, { priority: 20 })
  async filterContent(content: string, context: HookContext): Promise<string> {
    return content.replace(/badword/gi, '***');
  }

  // AI-powered hook
  @AIHook(ContentHook.POST_SEO_FILTER, { 
    aiTask: 'seo_optimize',
    priority: 50,
    fallbackOnError: true 
  })
  async optimizeSEO(post: any, context: HookContext): Promise<any> {
    // AI enhancement logic
    return post;
  }
}
```

#### Programmatic Registration

```typescript
import { HooksService } from '../hooks/hooks.service';

@Injectable()
export class MyService {
  constructor(private readonly hooksService: HooksService) {}

  async onModuleInit() {
    // Register action
    this.hooksService.addAction(
      'post:before_save',
      async (post, context) => {
        console.log('Saving post:', post.title);
      },
      { priority: 10, namespace: 'my-service' }
    );

    // Register filter
    this.hooksService.addFilter(
      'post:content_filter',
      async (content, context) => {
        return `<!-- Modified -->${content}`;
      },
      { priority: 5 }
    );
  }

  async createPost(data: CreatePostDto) {
    // Execute action (no return value)
    await this.hooksService.doAction('post:before_create', data);

    // Apply filters (transforms data)
    const filteredContent = await this.hooksService.applyFilters(
      'post:content_filter',
      data.content,
      { userId: data.authorId }
    );

    // ... save to database

    await this.hooksService.doAction('post:after_create', savedPost);
    return savedPost;
  }
}
```

### Available Hooks

#### Lifecycle Hooks (LifecycleHook enum)
```typescript
// Application
'app:bootstrap' | 'app:init' | 'app:ready' | 'app:shutdown'

// Database
'database:connecting' | 'database:connected' | 'database:disconnected' | 'database:error'

// Authentication
'auth:init' | 'auth:login' | 'auth:logout' | 'auth:register' | 'auth:password_reset'

// Request
'request:start' | 'request:auth' | 'request:validated' | 'request:end' | 'request:error'
```

#### Content Hooks (ContentHook enum)
```typescript
// Posts
'post:before_create' | 'post:after_create'
'post:before_update' | 'post:after_update'
'post:before_delete' | 'post:after_delete'
'post:before_publish' | 'post:after_publish'
'post:content_filter' | 'post:excerpt_filter' | 'post:title_filter' | 'post:seo_filter'

// Pages
'page:before_create' | 'page:after_create'
'page:before_update' | 'page:after_update'
'page:content_filter'

// Products
'product:before_create' | 'product:after_create'
'product:before_update' | 'product:after_update'
'product:price_filter' | 'product:description_filter'
'product:inventory_change'

// Orders
'order:before_create' | 'order:after_create'
'order:status_change' | 'order:payment_complete' | 'order:fulfilled'

// Comments
'comment:before_create' | 'comment:after_create'
'comment:content_filter' | 'comment:spam_check'

// Media
'media:before_upload' | 'media:after_upload' | 'media:process' | 'media:delete'

// Users
'user:before_create' | 'user:after_create'
'user:before_update' | 'user:after_update'
'user:role_change'
```

#### AI Content Hooks (AIContentHook enum)
```typescript
'ai:content_enhance'   // Improve content quality
'ai:seo_optimize'      // SEO optimization
'ai:moderate_content'  // Content moderation
'ai:translate'         // Translation
'ai:summarize'         // Text summarization
'ai:categorize'        // Auto-categorization
'ai:image_alt'         // Generate image alt text
'ai:sentiment'         // Sentiment analysis
'ai:keywords'          // Keyword extraction
'ai:grammar'           // Grammar checking
'ai:readability'       // Readability improvement
```

### Hook Options

```typescript
interface ActionOptions {
  priority?: number;           // Default: 10 (lower = earlier)
  namespace?: string;          // Group identifier
  description?: string;        // Documentation
  once?: boolean;              // Auto-remove after first execution
  condition?: (ctx) => boolean; // Conditional execution
}

interface FilterOptions extends ActionOptions {
  stopOnNull?: boolean;        // Stop chain if handler returns null
}

interface AIHookOptions extends ActionOptions {
  aiTask: AITask;              // AI task type
  model?: string;              // AI model (default: 'gemini-3-pro-preview')
  fallbackOnError?: boolean;   // Return original on error
  cacheResults?: boolean;      // Cache AI responses
  cacheTTL?: number;           // Cache TTL in seconds
}
```

### Hook API Endpoints

```bash
GET  /api/v1/hooks              # List all registered hooks
GET  /api/v1/hooks/stats        # Hook statistics
GET  /api/v1/hooks/:hookName    # Get specific hook details
POST /api/v1/hooks/test/action/:hookName   # Test action hook
POST /api/v1/hooks/test/filter/:hookName   # Test filter hook
```

### Frontend Hook System

Located in `hooks/nestpress-hooks.ts`:

```typescript
import { 
  useNestPressHooks, 
  useNestPressAction, 
  useNestPressFilter,
  NestPressHookProvider 
} from '@/hooks/nestpress-hooks';

// Wrap app with provider (optional - works without)
<NestPressHookProvider>
  <App />
</NestPressHookProvider>

// Use hooks in components
function MyComponent() {
  const { doAction, applyFilters, addFilter } = useNestPressHooks();

  // Register filter (auto-cleanup on unmount)
  useNestPressFilter('content:display', async (content) => {
    return content.toUpperCase();
  }, { priority: 10 });

  // Execute action
  const handleSave = async () => {
    await doAction('form:before_submit', formData);
    // ... save logic
  };

  // Apply filters
  const displayContent = await applyFilters('content:display', rawContent);
}
```

### Creating Custom Hooks

1. **Define hook constant** (recommended in interfaces file):
```typescript
export enum MyPluginHook {
  BEFORE_PROCESS = 'my-plugin:before_process',
  AFTER_PROCESS = 'my-plugin:after_process',
  DATA_FILTER = 'my-plugin:data_filter',
}
```

2. **Create hook provider service**:
```typescript
@HookProvider({ namespace: 'my-plugin' })
@Injectable()
export class MyPluginHooksService {
  @OnAction(MyPluginHook.AFTER_PROCESS, { priority: 10 })
  async handleProcessComplete(data: any): Promise<void> {
    // Handle completion
  }

  @OnFilter(MyPluginHook.DATA_FILTER, { priority: 20 })
  async transformData(data: any): Promise<any> {
    return { ...data, modified: true };
  }
}
```

3. **Execute hooks in your service**:
```typescript
async process(input: any) {
  await this.hooksService.doAction(MyPluginHook.BEFORE_PROCESS, input);
  
  const filtered = await this.hooksService.applyFilters(
    MyPluginHook.DATA_FILTER, 
    input
  );
  
  const result = await this.doProcessing(filtered);
  
  await this.hooksService.doAction(MyPluginHook.AFTER_PROCESS, result);
  return result;
}
```

### Hook System vs WordPress Comparison

| Feature | WordPress | NestPress |
|---------|-----------|-----------|
| Language | PHP | TypeScript |
| Async Support | No (sync only) | Yes (async/await) |
| Type Safety | No | Full TypeScript types |
| Priority System | ✅ | ✅ (same: lower = earlier) |
| Namespaces | ❌ | ✅ (for organization) |
| Conditional Hooks | ❌ | ✅ (condition option) |
| Once-only Hooks | ❌ | ✅ (once option) |
| AI Integration | ❌ | ✅ (built-in AI hooks) |
| Statistics | ❌ | ✅ (execution tracking) |
| REST API | ❌ | ✅ (hook management API) |
| Auto-discovery | ❌ | ✅ (decorator scanning) |
| Error Recovery | Limited | ✅ (graceful fallbacks) |

---

## Common Pitfalls & Solutions

### Port Configuration & CORS Issues
**Issue**: Frontend runs on port 3000 but backend CORS expects 5173
**Solution**: 
- Frontend port is explicitly set to 3000 in `vite.config.ts` (`server.port: 3000`)
- Backend CORS allows both 5173 and 3001 by default (see `backend/src/main.ts` and `backend/.env`)
- If using port 3000, update `CORS_ORIGINS` in `backend/.env` to include `http://localhost:3000`
**Why**: Vite defaults to 5173, but this project uses 3000 for consistency with backend on 4000

### Theme Loading Fails
**Issue**: Themes don't hot-reload or fail to import
**Solution**: 
- Ensure `vite.config.ts` has `fs.allow: ['..', 'themes']`
- Use `/* @vite-ignore */` comment in dynamic imports
- Cache-bust with `?t=${Date.now()}` query param
**Why**: Vite's default security prevents loading files outside project root

### API 401 Errors After Login
**Issue**: All API calls return 401 Unauthorized despite successful login
**Root Cause**: Token not being sent in requests
**Solution**: Check `services/api.ts` - ensure `tokenManager.getAccessToken()` is called in headers
**Debug**: Check localStorage for `nestpress_access_token` key

### Context Re-renders
**Issue**: Component re-renders excessively, performance degrades
**Root Cause**: Context value not memoized, functions not wrapped in `useCallback`
**Solution**: 
```typescript
// ❌ Wrong - creates new object every render
return <Context.Provider value={{ data, updateData }}>

// ✅ Correct - memoized
const value = useMemo(() => ({ data, updateData }), [data, updateData]);
return <Context.Provider value={value}>
```

### Database Module Fails to Initialize
**Issue**: Backend crashes with "Unknown database provider"
**Root Cause**: `.env` missing or `DATABASE_PROVIDER` not set
**Solution**: 
1. Copy `backend/.env.example` to `backend/.env`
2. Set `DATABASE_PROVIDER=firebase` (or mongodb/dynamodb/supabase)
3. Configure provider-specific credentials (e.g., `FIREBASE_PROJECT_ID`)

### Hook Decorators Not Discovered
**Issue**: Decorated hooks (@OnAction, @OnFilter) don't execute
**Root Cause**: Service not registered as provider or missing `@HookProvider()` decorator
**Solution**:
```typescript
// Add @HookProvider to class
@HookProvider({ namespace: 'my-plugin' })
@Injectable()
export class MyHooksService { }

// Register in module providers
@Module({
  providers: [MyHooksService],
})
```

---

## Testing & Debugging

### Quick Health Check
```bash
# Backend health
curl http://localhost:4000/api/v1/health

# Frontend build
npm run build && npm run preview
```

### Common Test Scenarios
1. **Auth Flow**: Login → Get current user → Create post → Logout
2. **Theme Switch**: Load theme → Preview → Activate → View frontend
3. **Hook System**: Register filter → Apply filter → Verify transformation
4. **E-commerce**: Create product → Add to order → Process payment

### Debug Endpoints
- `GET /api/v1/hooks` - List all registered hooks
- `GET /api/v1/hooks/stats` - Hook execution statistics
- `GET /api/v1/health` - System health and database status
- `GET /api/v1/database/collections` - List all database collections

## Dependencies & External Services

### Frontend Dependencies (package.json)
- **React 19.2** - UI framework with latest features (no legacy mode)
- **Vite 6.2** - Build tool with fast HMR
- **TypeScript 5.8** - Type safety
- **Tailwind CSS** - Via CDN (no build step) in `index.html`
- **lucide-react** - Icon library (tree-shakeable, import individually)
- **@google/genai** - Google Gemini AI SDK (optional)
- **dompurify** - HTML sanitization for XSS prevention
- **recharts** - Charts for dashboard analytics

### Backend Dependencies (backend/package.json)
**Core:**
- **@nestjs/core 10.3** - NestJS framework
- **@nestjs/config** - Configuration management with Joi validation
- **@nestjs/jwt** - JWT authentication
- **@nestjs/swagger** - OpenAPI documentation
- **class-validator & class-transformer** - DTO validation
- **passport & passport-jwt** - Authentication strategies

**Optional Databases** (choose one):
- **firebase-admin** - Firebase/Firestore
- **mongodb** - MongoDB driver
- **@aws-sdk/client-dynamodb** - AWS DynamoDB
- **@supabase/supabase-js** - Supabase (PostgreSQL)

**Optional AI Providers** (choose one):
- **@google/generative-ai** - Google Gemini
- **openai** - OpenAI GPT
- **@anthropic-ai/sdk** - Anthropic Claude

**Utilities:**
- **slugify** - URL-friendly slugs
- **bcrypt** - Password hashing
- **helmet** - Security headers
- **adm-zip** - Plugin/theme ZIP handling

### Environment Configuration

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_DEBUG=true  # Optional: Enable debug logging
```

**Backend (.env):**
```env
# Server
PORT=4000
NODE_ENV=development
API_PREFIX=api/v1

# Database (choose one provider)
DATABASE_PROVIDER=firebase|mongodb|dynamodb|supabase
# Firebase
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
# MongoDB
MONGODB_URI=mongodb://localhost:27017/nestpress
# DynamoDB
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=...

# JWT (change in production!)
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRATION=24h           # Access token expiration
JWT_REFRESH_EXPIRATION=7d    # Refresh token expiration

# AI Provider (optional)
AI_PROVIDER=gemini|openai|anthropic
GEMINI_API_KEY=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...

# Payment Provider (optional)
PAYMENT_PROVIDER=stripe|paypal|square
STRIPE_SECRET_KEY=...

# Data Seeding
SEED_DATA=true  # Auto-seed demo data on startup
```

---

---

## Quick Verification Checklist

Before starting work, verify your setup:

```bash
# ✅ Check backend is running on correct port
curl http://localhost:4000/api/v1/health

# ✅ Check frontend environment
cat .env.local | grep VITE_API_URL
# Should show: VITE_API_URL=http://localhost:4000/api/v1

# ✅ Check backend CORS allows frontend port
cat backend/.env | grep CORS_ORIGINS
# Should include: http://localhost:3000

# ✅ Verify you're authenticated
# Open browser console on http://localhost:3000
# Run: localStorage.getItem('nestpress_access_token')
# Should return a JWT token string

# ✅ Test API connectivity
curl http://localhost:4000/api/v1/themes/active
```

**Common Setup Issues:**
- **401 Errors**: Clear localStorage and login again
- **CORS Errors**: Add `http://localhost:3000` to `CORS_ORIGINS` in `backend/.env`
- **Port Already in Use**: Change `PORT=4000` in `backend/.env` or kill existing process
- **Theme Not Loading**: Check browser console for errors, verify theme exists in `/themes` folder
- **Backend Won't Start**: Verify `.env` has valid `DATABASE_PROVIDER` and credentials

---

---

## AI Agent Best Practices

### Before Making Changes
1. **Always read `types.ts` first** - contains ALL interfaces and enums
2. Check existing patterns in similar components before creating new ones
3. Use `grep_search` to find usage examples of patterns you need
4. Verify both frontend AND backend changes when adding features

### When Adding Features
```bash
# Search for similar implementations first
grep_search "ViewState\." --isRegexp true  # Find view state usage
grep_search "@Public\(\)" --isRegexp true   # Find public endpoints

# Read related files in parallel
# Example: Adding new entity
- types.ts (interface definition)
- contexts/CMSContext.tsx (state management)
- services/api.ts (API client)
- backend/src/modules/[entity]/ (backend module)
```

### Common Code Patterns to Follow

**Adding new admin view:**
```typescript
// 1. types.ts - Add to ViewState enum
export enum ViewState {
  MY_NEW_VIEW = 'MY_NEW_VIEW',
}

// 2. App.tsx - Add case in switch statement (inside Layout)
case ViewState.MY_NEW_VIEW:
  return <MyNewComponent />;

// 3. components/Layout.tsx - Add navigation item
{ icon: MyIcon, label: 'My View', view: ViewState.MY_NEW_VIEW }
```

**Adding new API endpoint:**
```typescript
// Backend: backend/src/modules/[entity]/[entity].controller.ts
@Post()
@ApiOperation({ summary: 'Create item' })
@Roles(Role.ADMIN, Role.EDITOR)
async create(@Body() dto: CreateDto, @CurrentUser() user: User) {
  return this.service.create(dto, user.id);
}

// Frontend: services/api.ts
async create(data: CreateDto): Promise<ApiResponse<Entity>> {
  return this.post('/endpoint', data);
}

// Context: contexts/CMSContext.tsx
const createItem = useCallback(async (data: CreateDto) => {
  const response = await api.items.create(data);
  setItems(prev => [...prev, response.data]);
}, []);
```

### Error Prevention Checklist
- [ ] Did you use `useCallback` for context functions?
- [ ] Did you memoize context values with `useMemo`?
- [ ] Did you add `@Public()` decorator for public routes?
- [ ] Did you sanitize user input with `sanitizeHTML/Text/URL`?
- [ ] Did you use DataCard/DataTable instead of custom HTML?
- [ ] Did you update both frontend AND backend for new features?
- [ ] Did you add the new route to `services/api.ts`?

### Testing Your Changes
```bash
# 1. Check for TypeScript errors
npm run type-check  # Frontend
cd backend && npm run build  # Backend

# 2. Verify API endpoint
curl http://localhost:4000/api/v1/your-endpoint

# 3. Check browser console for errors
# 4. Test authentication flow if applicable
# 5. Verify theme loading if theme-related
```

---

**Last Updated**: December 18, 2025  
**For Questions**: See project READMEs, documentation files (FEATURE_AUDIT.md, MENU_SYSTEM.md, THEME_SYSTEM.md, WORDPRESS_FEATURES.md, FRONTEND_PLUGIN_INTEGRATION_COMPLETE.md, plugins/ai-theme-factory/README.md)



