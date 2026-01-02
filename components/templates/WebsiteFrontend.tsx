import React, { useState, useEffect, useMemo } from 'react';
import { useCMS } from '../../contexts/CMSContext';
import { Post, PostStatus, Menu, Widget, HeaderSettings } from '../../types';
import { useTheme } from '../../utils/themeLoader';
import { api } from '@/services/api';
import { useNestPressHooks } from '@/hooks/nestpress-hooks.tsx';
import './wordpress-template.css';

// ============================================
// WordPress-like Frontend Website
// - Themes are loaded from /themes folder ONLY
// - Each theme contains its own templates
// - No legacy/mixed template systems
// - Menus, Widgets, Header from Appearance API
// ============================================

// ============================================
// WordPress-like Template Helper Functions
// ============================================

/**
 * Generate body classes like WordPress body_class()
 * @param route Current route
 * @param currentPage Current page object
 * @param themeId Active theme ID
 */
function getBodyClasses(route: string, currentPage?: Post, themeId?: string): string {
  const classes: string[] = [];
  
  // Theme class
  if (themeId) classes.push(`theme-${themeId}`);
  
  // Home/Front page
  if (route === '/' || route === '') {
    classes.push('home', 'front-page');
  }
  
  // Single post
  if (route.match(/^\/blog\/[\w-]+$/)) {
    classes.push('single', 'single-post');
    if (currentPage?.id) classes.push(`postid-${currentPage.id}`);
  }
  
  // Page
  if (currentPage?.type === 'page') {
    classes.push('page');
    if (currentPage.id) classes.push(`page-id-${currentPage.id}`);
    if (currentPage.slug) classes.push(`page-${currentPage.slug}`);
  }
  
  // Archive/Blog
  if (route === '/blog' || route === '/posts') {
    classes.push('archive', 'blog');
  }
  
  // Category
  if (route.startsWith('/category/')) {
    classes.push('archive', 'category');
    const categorySlug = route.replace('/category/', '');
    classes.push(`category-${categorySlug}`);
  }
  
  // Search
  if (route.startsWith('/search')) {
    classes.push('search', 'search-results');
  }
  
  // 404
  if (!currentPage && route !== '/' && route !== '') {
    classes.push('error404');
  }
  
  // Logged in (if applicable)
  const token = localStorage.getItem('nestpress_access_token');
  if (token) classes.push('logged-in');
  
  return classes.join(' ');
}

interface AppearanceData {
  menus: Menu[];
  widgets: Widget[];
  header: HeaderSettings;
}

interface SiteSettings {
  homepageType?: 'posts' | 'page';
  homepageId?: string;
  postsPageId?: string;
  postsPerPage?: number;
  [key: string]: any;
}

interface WebsiteFrontendProps {
  themeId?: string;
  isPreview?: boolean;
  previewPageId?: string;
}

// Default pages if none exist
const createDefaultPages = (): Post[] => [
  {
    id: 'default-home',
    title: 'Home',
    content: '<p>Welcome to your new website! Edit this page in the admin dashboard.</p>',
    author: 'System',
    status: PostStatus.PUBLISHED,
    categories: [],
    tags: [],
    date: new Date().toISOString(),
    excerpt: 'Welcome to your new website powered by NestPress CMS.',
    type: 'page',
  },
];

// Parse URL to get current page slug
const getPageSlugFromUrl = (): string => {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const hash = window.location.hash.replace('#', '');
  
  if (hash && !hash.includes('admin')) {
    return hash.toLowerCase();
  }
  
  if (!path || path === '' || path === 'index.html') {
    return 'home';
  }
  
  return path.toLowerCase();
};

// Find page by slug
const findPageBySlug = (pages: Post[], slug: string): Post | undefined => {
  const normalizedSlug = slug.toLowerCase().replace(/[-_]/g, ' ').trim();
  
  return pages.find(page => {
    const pageTitle = page.title.toLowerCase().trim();
    const pageTitleAsSlug = pageTitle.replace(/\s+/g, '-');
    const pageSlug = page.slug?.toLowerCase();
    
    return (
      pageTitle === normalizedSlug ||           // "shop" === "shop"
      pageTitleAsSlug === slug.toLowerCase() || // "shop" === "shop"
      pageTitle === slug.toLowerCase() ||       // "shop" === "shop"
      pageSlug === slug.toLowerCase()           // Use page.slug if exists
    );
  });
};

// ============================================
// Main Website Frontend Component
// ONLY loads templates from /themes folder
// ============================================
const WebsiteFrontend: React.FC<WebsiteFrontendProps> = ({
  themeId,
  isPreview = false,
  previewPageId,
}) => {
  const { themes, activeThemeId, pages: cmsPages, posts: cmsPosts } = useCMS();
  const { doAction, applyFilters } = useNestPressHooks();
  
  // Use the provided themeId prop, or fall back to activeThemeId from context
  const effectiveThemeId = themeId || activeThemeId || 'default';
  
  // Pass the effective theme ID to useTheme so it reacts to changes
  const { theme: loadedTheme, loading: themeLoading, error: themeError } = useTheme(effectiveThemeId);
  
  const [currentPageSlug, setCurrentPageSlug] = useState<string>(getPageSlugFromUrl());
  const [publicPages, setPublicPages] = useState<Post[]>([]);
  const [publicPosts, setPublicPosts] = useState<Post[]>([]);
  const [publicProducts, setPublicProducts] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [pluginAssets, setPluginAssets] = useState<{ styles: any[]; scripts: any[] }>({ styles: [], scripts: [] });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    homepageType: 'posts',
    postsPerPage: 10,
  });
  const [appearance, setAppearance] = useState<AppearanceData>({
    menus: [],
    widgets: [],
    header: {
      logoText: 'NestPress',
      tagline: 'A Modern CMS',
      showTagline: true,
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      height: 80,
      sticky: true,
      transparent: false,
    },
  });

  // Fetch public posts, pages, and appearance data from API
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch published pages
        const pagesResponse = await fetch('http://localhost:4000/api/v1/pages/published');
        if (pagesResponse.ok) {
          const pagesData = await pagesResponse.json();
          const mappedPages = (Array.isArray(pagesData) ? pagesData : pagesData.data || []).map((page: any) => ({
            id: page.id,
            title: page.title,
            slug: page.slug,
            content: page.content,
            author: page.author?.name || 'Admin',
            status: PostStatus.PUBLISHED,
            categories: page.categories || [],
            tags: page.tags || [],
            date: page.createdAt || new Date().toISOString(),
            excerpt: page.excerpt || '',
            type: 'page',
          }));
          setPublicPages(mappedPages);
        }

        // Fetch published posts
        const postsResponse = await fetch('http://localhost:4000/api/v1/posts/published?limit=100');
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          const mappedPosts = (Array.isArray(postsData) ? postsData : postsData.data || []).map((post: any) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            author: post.author?.name || 'Admin',
            status: PostStatus.PUBLISHED,
            categories: post.categories || [],
            tags: post.tags || [],
            date: post.createdAt || new Date().toISOString(),
            excerpt: post.excerpt || '',
            type: 'post',
            featuredImage: post.featuredImage || '',
          }));
          setPublicPosts(mappedPosts);
        }

        // Fetch products
        const productsResponse = await fetch('http://localhost:4000/api/v1/products?limit=100');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          console.log('Products API response:', productsData);
          const products = Array.isArray(productsData) ? productsData : productsData.data || [];
          console.log('Extracted products:', products);
          setPublicProducts(products);
        }

        // Fetch site settings (for homepage type, posts per page, etc.)
        const settingsResponse = await fetch('http://localhost:4000/api/v1/settings');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setSiteSettings({
            homepageType: settingsData.homepageType || 'posts',
            homepageId: settingsData.homepageId,
            postsPageId: settingsData.postsPageId,
            postsPerPage: settingsData.postsPerPage || 10,
          });
        }

        // Fetch appearance data (menus, widgets, header)
        const [menusRes, widgetsRes, headerRes] = await Promise.all([
          fetch('http://localhost:4000/api/v1/appearance/menus'),
          fetch('http://localhost:4000/api/v1/appearance/widgets'),
          fetch('http://localhost:4000/api/v1/appearance/header'),
        ]);

        const newAppearance: AppearanceData = { 
          menus: [],
          widgets: [],
          header: appearance.header,
        };
        
        if (menusRes.ok) {
          newAppearance.menus = await menusRes.json();
        }
        if (widgetsRes.ok) {
          newAppearance.widgets = await widgetsRes.json();
        }
        if (headerRes.ok) {
          newAppearance.header = await headerRes.json();
        }
        
        setAppearance(newAppearance);

        // Fetch plugin assets (WordPress wp_enqueue_scripts)
        try {
          const assets = await api.plugins.getAssets();
          const styles = assets.filter((a: any) => a.type === 'style');
          const scripts = assets.filter((a: any) => a.type === 'script');
          setPluginAssets({ styles, scripts });
        } catch (error) {
          console.error('Failed to load plugin assets:', error);
        }
      } catch (error) {
        console.error('Failed to fetch public data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchPublicData();
  }, []);

  // Get current theme from context
  const currentThemeId = themeId || activeThemeId;
  const theme = themes.find(t => t.id === currentThemeId) || themes[0];

  // Memoize available pages and posts to prevent infinite loops
  const availablePages = useMemo(() => {
    return publicPages.length > 0 
      ? publicPages
      : cmsPages.length > 0
        ? cmsPages.filter(p => p.status === PostStatus.PUBLISHED && p.type === 'page')
        : createDefaultPages();
  }, [publicPages, cmsPages]);

  const publishedPosts = useMemo(() => {
    return publicPosts.length > 0 
      ? publicPosts 
      : cmsPosts.filter(p => p.status === PostStatus.PUBLISHED);
  }, [publicPosts, cmsPosts]);

  // Memoize current page to prevent infinite loops
  const currentPage = useMemo(() => {
    return previewPageId
      ? availablePages.find(p => p.id === previewPageId)
      : findPageBySlug(availablePages, currentPageSlug);
  }, [availablePages, currentPageSlug, previewPageId]);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPageSlug(getPageSlugFromUrl());
    };

    const handleNavigate = (e: CustomEvent) => {
      const { pageId } = e.detail;
      const page = availablePages.find(p => p.id === pageId);
      if (page) {
        const slug = page.title.toLowerCase().replace(/\s+/g, '-');
        window.history.pushState({}, '', `/${slug}`);
        setCurrentPageSlug(slug);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('navigate', handleNavigate as EventListener);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []); // Empty deps - availablePages is captured in closure

  // WordPress-like wp_head hook - inject assets and run head actions
  useEffect(() => {
    // Execute wp_head action (WordPress equivalent)
    doAction('wp_head', {
      theme: effectiveThemeId,
      page: currentPage,
      route: window.location.pathname,
    });

    // Load theme CSS files from theme.json assets
    const styleElements: HTMLLinkElement[] = [];
    console.log('[WebsiteFrontend] Theme CSS loading:', {
      themeId: effectiveThemeId,
      hasLoadedTheme: !!loadedTheme,
      hasAssets: !!loadedTheme?.assets,
      hasCss: !!loadedTheme?.assets?.css,
      cssFiles: loadedTheme?.assets?.css
    });
    
    if (loadedTheme?.assets?.css) {
      loadedTheme.assets.css.forEach((cssPath: string) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `/themes/${effectiveThemeId}/${cssPath}`;
        link.id = `theme-css-${cssPath.replace(/[^a-z0-9]/gi, '-')}`;
        document.head.appendChild(link);
        styleElements.push(link);
        console.log(`✓ Loaded theme CSS: ${link.href}`);
      });
    } else {
      console.warn('[WebsiteFrontend] ⚠ No theme CSS files found in theme.json assets');
    }

    // Load theme JS files from theme.json assets
    const themeScriptElements: HTMLScriptElement[] = [];
    console.log('[WebsiteFrontend] Theme JS loading:', {
      themeId: effectiveThemeId,
      hasJs: !!loadedTheme?.assets?.js,
      jsFiles: loadedTheme?.assets?.js
    });
    
    if (loadedTheme?.assets?.js) {
      // Sort scripts to load libraries (jQuery, etc.) first
      const sortedScripts = [...loadedTheme.assets.js].sort((a, b) => {
        const aIsLibrary = /jquery|lodash|underscore|backbone|modernizr/i.test(a);
        const bIsLibrary = /jquery|lodash|underscore|backbone|modernizr/i.test(b);
        
        // Libraries load first
        if (aIsLibrary && !bIsLibrary) return -1;
        if (!aIsLibrary && bIsLibrary) return 1;
        
        // Then alphabetical
        return a.localeCompare(b);
      });
      
      sortedScripts.forEach((jsPath: string, index: number) => {
        const script = document.createElement('script');
        script.src = `/themes/${effectiveThemeId}/${jsPath}`;
        script.id = `theme-js-${jsPath.replace(/[^a-z0-9]/gi, '-')}`;
        
        // Libraries load synchronously (no defer/async)
        // Other scripts use defer to maintain order but not block parsing
        const isLibrary = /jquery|lodash|underscore|backbone|modernizr/i.test(jsPath);
        if (!isLibrary) {
          script.defer = true;
        }
        
        document.body.appendChild(script);
        themeScriptElements.push(script);
        console.log(`✓ Loaded theme JS (${isLibrary ? 'sync' : 'defer'}): ${script.src}`);
      });
    } else {
      console.log('[WebsiteFrontend] ℹ No theme JS files found in theme.json assets');
    }

    // Load plugin styles in <head> (WordPress wp_enqueue_style)
    pluginAssets.styles.forEach((style: any) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = style.src;
      link.id = `plugin-style-${style.handle}`;
      if (style.media) link.media = style.media;
      document.head.appendChild(link);
      styleElements.push(link);
    });

    // Load plugin scripts in <head> or <body> (WordPress wp_enqueue_script)
    const scriptElements: HTMLScriptElement[] = [];
    pluginAssets.scripts.forEach((script: any) => {
      const scriptEl = document.createElement('script');
      scriptEl.src = script.src;
      scriptEl.id = `plugin-script-${script.handle}`;
      scriptEl.async = true;
      if (script.inFooter) {
        document.body.appendChild(scriptEl);
      } else {
        document.head.appendChild(scriptEl);
      }
      scriptElements.push(scriptEl);
    });

    // Cleanup on unmount or when assets change
    return () => {
      styleElements.forEach(el => el.remove());
      themeScriptElements.forEach(el => el.remove());
      scriptElements.forEach(el => el.remove());
    };
  }, [pluginAssets, effectiveThemeId, currentPage, loadedTheme]); // Removed doAction - it's stable

  // WordPress-like wp_footer hook - run footer actions before </body>
  useEffect(() => {
    // Execute wp_footer action (WordPress equivalent)
    doAction('wp_footer', {
      theme: effectiveThemeId,
      page: currentPage,
      route: window.location.pathname,
    });
  }, [effectiveThemeId, currentPage]); // Removed doAction - it's stable

  // WordPress-like body_class filter - apply body classes
  useEffect(() => {
    const route = window.location.pathname;
    const bodyClasses = getBodyClasses(route, currentPage, effectiveThemeId);
    
    // Apply filter to allow plugins to modify body classes
    applyFilters('body_class', bodyClasses).then((filteredClasses: string) => {
      document.body.className = filteredClasses;
    });

    // Execute wp_body_open action (WordPress 5.2+)
    doAction('wp_body_open', {
      theme: effectiveThemeId,
      page: currentPage,
      route,
    });
  }, [currentPage, effectiveThemeId]); // Removed doAction and applyFilters - they're stable

  // Handle hash changes (for SPA navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && !hash.includes('admin')) {
        setCurrentPageSlug(hash.toLowerCase());
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Show loading while fetching theme or initial data
  if (themeLoading || isLoadingData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid #e2e8f0',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Helper to get menu by location
  const getMenu = (location: string) => appearance.menus.find(m => m.location === location);
  const getWidgetsByArea = (area: string) => appearance.widgets.filter(w => w.area === area && w.isActive);

  // Common appearance props for all templates
  const appearanceProps = {
    menus: appearance.menus,
    widgets: appearance.widgets,
    header: appearance.header,
    primaryMenu: getMenu('primary'),
    footerMenu: getMenu('footer'),
    sidebarWidgets: getWidgetsByArea('sidebar'),
    footerWidgets: getWidgetsByArea('footer'),
    headerWidgets: getWidgetsByArea('header'),
  };

  // ============================================
  // THEME TEMPLATE SELECTION
  // Templates are loaded ONLY from /themes folder
  // Like WordPress: theme provides all templates
  // ============================================
  
  if (!loadedTheme) {
    // No theme loaded from /themes folder
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>
            No Theme Installed
          </h1>
          <p style={{ opacity: 0.9, marginBottom: '2rem', lineHeight: 1.6 }}>
            NestPress requires a theme to display your website. 
            Themes are located in the <code style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4 }}>/themes</code> folder.
          </p>
          <a 
            href="/admin#appearance" 
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#fff',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Go to Appearance Settings →
          </a>
        </div>
      </div>
    );
  }

  // Determine which template to use based on route
  const route = window.location.pathname;
  let templateName = 'index';
  let templateProps: Record<string, any> = {};
  
  // WordPress-like template hierarchy with Reading Settings support
  if (route === '/' || route === '') {
    // Front page - respect Reading Settings (Your homepage displays)
    if (siteSettings.homepageType === 'page' && siteSettings.homepageId) {
      // Static page as homepage
      const homePage = availablePages.find(p => p.id === siteSettings.homepageId);
      templateName = 'page';
      templateProps = { post: homePage, page: homePage, ...appearanceProps };
    } else {
      // Latest posts as homepage (default) - use archive template to show blog list
      // Check for front-page template first, then archive, then index as fallback
      templateName = loadedTheme.templates['front-page'] ? 'front-page' 
                   : loadedTheme.templates['archive'] ? 'archive' 
                   : 'index';
      const postsLimit = siteSettings.postsPerPage || 10;
      const limitedPosts = publishedPosts.slice(0, postsLimit);
      templateProps = { posts: limitedPosts, allPosts: publishedPosts, ...appearanceProps };
    }
  } else if (route.match(/^\/blog\/[\w-]+$/)) {
    // Single post: /blog/post-slug or /blog/post-id
    const postIdentifier = route.replace('/blog/', '');
    
    // First try to find by slug (preferred), then by ID
    const post = publishedPosts.find(p => p.slug === postIdentifier) ||
                 publishedPosts.find(p => p.id === postIdentifier) ||
                 publishedPosts.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === postIdentifier);
    
    templateName = 'single';
    templateProps = { post: post || currentPage, posts: publishedPosts, ...appearanceProps };
  } else if (route === '/blog' || route === '/posts') {
    // Blog archive - respect posts per page setting
    templateName = loadedTheme.templates['archive'] ? 'archive' : 'index';
    const postsLimit = siteSettings.postsPerPage || 10;
    const limitedPosts = publishedPosts.slice(0, postsLimit);
    templateProps = { posts: limitedPosts, allPosts: publishedPosts, ...appearanceProps };
  } else if (route.startsWith('/category/')) {
    // Category archive
    const categorySlug = route.replace('/category/', '');
    const categoryPosts = publishedPosts.filter(p => 
      p.categories?.some(c => c.toLowerCase() === categorySlug)
    );
    templateName = loadedTheme.templates['category'] ? 'category' : 'archive';
    templateProps = { posts: categoryPosts, category: categorySlug, ...appearanceProps };
  } else if (route.startsWith('/search')) {
    // Search results
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const searchResults = publishedPosts.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.content.toLowerCase().includes(query.toLowerCase())
    );
    templateName = loadedTheme.templates['search'] ? 'search' : 'archive';
    templateProps = { posts: searchResults, searchQuery: query, ...appearanceProps };
  } else if (currentPage) {
    // Check if this is the Shop page (WooCommerce-like)
    if (currentPage.title.toLowerCase() === 'shop') {
      templateName = 'shop';
      templateProps = { 
        page: currentPage, 
        products: publicProducts, 
        ...appearanceProps 
      };
    } else if (currentPage.title.toLowerCase() === 'cart') {
      // Cart page
      templateName = 'cart';
      templateProps = { 
        page: currentPage,
        ...appearanceProps 
      };
    } else {
      // Regular static page
      templateName = 'page';
      templateProps = { post: currentPage, page: currentPage, ...appearanceProps };
    }
  } else if (currentPageSlug === 'home' || !currentPageSlug) {
    // Home page fallback - try to find home page
    const homePage = availablePages.find(p => 
      p.title.toLowerCase() === 'home' || 
      p.title.toLowerCase() === 'front-page' ||
      p.slug === 'home'
    );
    if (homePage) {
      templateName = 'page';
      templateProps = { post: homePage, page: homePage, ...appearanceProps };
    } else {
      // No home page found, show blog archive
      templateName = loadedTheme.templates['front-page'] ? 'front-page' 
                   : loadedTheme.templates['archive'] ? 'archive' 
                   : 'index';
      const postsLimit = siteSettings.postsPerPage || 10;
      const limitedPosts = publishedPosts.slice(0, postsLimit);
      templateProps = { posts: limitedPosts, allPosts: publishedPosts, ...appearanceProps };
    }
  } else {
    // 404 Not Found
    templateName = loadedTheme.templates['404'] ? '404' : 'index';
    templateProps = { ...appearanceProps };
  }

  // Get template component from loaded theme
  // Fallback to 'page' template for shop/cart if they don't have custom templates
  const TemplateComponent = loadedTheme.templates[templateName] 
    || (['shop', 'cart'].includes(templateName) ? loadedTheme.templates['page'] : null)
    || loadedTheme.templates['index'];

  if (!TemplateComponent) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#fef2f2',
        color: '#991b1b',
        padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>
            Template Not Found
          </h1>
          <p style={{ marginBottom: '1rem' }}>
            The theme "{loadedTheme.metadata?.name || 'default'}" is missing the required template: 
            <code style={{ background: '#fee2e2', padding: '2px 8px', borderRadius: 4, marginLeft: 8 }}>
              {templateName}.tsx
            </code>
          </p>
          <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>
            Make sure your theme in <code>/themes</code> folder has an <code>index.tsx</code> template at minimum.
          </p>
        </div>
      </div>
    );
  }

  // Get body classes for the wrapper
  const bodyClasses = getBodyClasses(window.location.pathname, currentPage, effectiveThemeId);

  return (
    <div className={`website-frontend ${bodyClasses}`}>
      {/* WordPress wp_body_open action fires here (already executed in useEffect) */}
      {React.createElement(TemplateComponent, templateProps)}

      {/* Preview Badge */}
      {isPreview && currentPage && (
        <div className="fixed bottom-4 left-4 bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Preview Mode - {currentPage.title}</span>
        </div>
      )}

      {/* Navigation Hint (in preview mode) */}
      {isPreview && currentPage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-xs z-50 max-w-xs">
          <p className="font-medium mb-1">Available Pages:</p>
          <div className="flex flex-wrap gap-1">
            {availablePages.slice(0, 5).map(page => (
              <button
                key={page.id}
                onClick={() => {
                  const slug = page.title.toLowerCase().replace(/\s+/g, '-');
                  setCurrentPageSlug(slug);
                }}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  currentPage.id === page.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {page.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteFrontend;
