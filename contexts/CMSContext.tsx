import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { Post, PostStatus, ViewState, CMSContextType, User, Comment, Plugin, Product, Order, Theme, SiteSettings, Menu } from '../types';
import { 
  postsApi, 
  pagesApi, 
  productsApi, 
  ordersApi, 
  usersApi, 
  themesApi, 
  settingsApi,
  commentsApi,
  healthApi,
  menusApi,
  pluginsApi,
  authApi,
  tokenManager 
} from '../services/api';
import { themeLoader } from '../utils/themeLoader';

// API connection state
type ApiStatus = 'connecting' | 'connected' | 'offline' | 'error';

// Default site settings
const defaultSiteSettings: SiteSettings = {
  // General
  siteName: 'NestPress CMS',
  tagline: 'Modern Headless CMS',
  siteUrl: 'http://localhost:3001',
  adminEmail: 'admin@nestpress.com',
  timezone: 'UTC',
  dateFormat: 'F j, Y',
  timeFormat: 'g:i a',
  weekStartsOn: 0,
  language: 'en',
  logo: '',
  favicon: '',
  
  // Writing
  defaultPostCategory: 'uncategorized',
  defaultPostFormat: 'standard',
  
  // Reading
  homepageType: 'posts',
  postsPerPage: 10,
  feedItemsCount: 10,
  feedShowSummary: false,
  discourageCrawlers: false,
  
  // Discussion
  commentsEnabled: true,
  commentRegistration: false,
  commentModeration: false,
  commentWhitelist: false,
  commentMaxLinks: 2,
  commentThreading: true,
  commentThreadDepth: 5,
  commentPagination: false,
  commentsPerPage: 50,
  commentsSortOrder: 'asc',
  emailOnComment: true,
  emailOnModeration: true,
  avatarsEnabled: true,
  avatarRating: 'G',
  defaultAvatar: 'mystery',
  
  // Media
  thumbnailWidth: 150,
  thumbnailHeight: 150,
  mediumWidth: 300,
  mediumHeight: 300,
  largeWidth: 1024,
  largeHeight: 1024,
  embedAutoWidth: true,
  embedMaxWidth: 600,
  mediaFolderByDate: true,
  
  // Permalinks
  permalinkStructure: '/%postname%/',
  categoryBase: 'category',
  tagBase: 'tag',
  
  // SEO
  seo: {
    metaTitle: 'NestPress CMS - Modern Headless CMS',
    metaDescription: 'A powerful headless CMS with WordPress-like features',
    keywords: ['cms', 'headless', 'nestjs', 'react'],
    ogImage: '',
    structuredData: true,
  },
  
  // Social
  social: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  },
  
  // Footer
  footer: {
    copyright: `© ${new Date().getFullYear()} NestPress. All rights reserved.`,
    showPoweredBy: true,
  },
  
  // Privacy
  showPrivacyPolicy: false,
  allowCommentCookies: true,
  
  // System
  version: '1.0.0',
};

// Extended context type with loading and error states
interface ExtendedCMSContextType extends CMSContextType {
  apiStatus: ApiStatus;
  isLoading: boolean;
  error: string | null;
  refetchData: () => Promise<void>;
}

const CMSContext = createContext<ExtendedCMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Data state - initialized as empty arrays, no mocks
  const [posts, setPosts] = useState<Post[]>([]);
  const [pages, setPages] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [pluginMenuItems, setPluginMenuItems] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string>('');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [menus, setMenus] = useState<Menu[]>([]);
  
  // API and loading states
  const [apiStatus, setApiStatus] = useState<ApiStatus>('connecting');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Navigation state with URL routing support
  const getInitialView = (): ViewState => {
    const hash = window.location.hash.slice(1); // Remove #
    const viewMap: Record<string, ViewState> = {
      'dashboard': ViewState.DASHBOARD,
      'posts': ViewState.POSTS_LIST,
      'pages': ViewState.PAGES_LIST,
      'post-edit': ViewState.POST_EDIT,
      'page-edit': ViewState.PAGE_EDIT,
      'media': ViewState.MEDIA,
      'comments': ViewState.COMMENTS,
      'products': ViewState.PRODUCTS,
      'product-edit': ViewState.PRODUCT_EDIT,
      'orders': ViewState.ORDERS,
      'customers': ViewState.CUSTOMERS,
      'appearance': ViewState.APPEARANCE,
      'appearance-menus': ViewState.APPEARANCE_MENUS,
      'appearance-widgets': ViewState.APPEARANCE_WIDGETS,
      'appearance-header': ViewState.APPEARANCE_HEADER,
      'plugins': ViewState.PLUGINS,
      'users': ViewState.USERS,
      'tools': ViewState.TOOLS,
      'settings': ViewState.SETTINGS,
    };
    return viewMap[hash] || ViewState.DASHBOARD;
  };

  const [currentView, setCurrentView] = useState<ViewState>(getInitialView());
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);

  // Update URL hash when view changes (for browser history support)
  // Only set hash if we're in admin context (not on public website)
  useEffect(() => {
    // Check if we're in admin mode by looking at pathname or existing hash
    const isAdminContext = window.location.pathname.startsWith('/admin') ||
                           window.location.pathname === '/wp-admin' ||
                           (window.location.hash && window.location.hash !== '#' && !window.location.hash.startsWith('#/'));
    
    // Don't set hash if we're viewing the public website
    if (!isAdminContext) return;
    
    const viewToHash: Record<ViewState, string> = {
      [ViewState.DASHBOARD]: 'dashboard',
      [ViewState.POSTS_LIST]: 'posts',
      [ViewState.PAGES_LIST]: 'pages',
      [ViewState.POST_EDIT]: 'post-edit',
      [ViewState.PAGE_EDIT]: 'page-edit',
      [ViewState.MEDIA]: 'media',
      [ViewState.COMMENTS]: 'comments',
      [ViewState.PRODUCTS]: 'products',
      [ViewState.PRODUCT_EDIT]: 'product-edit',
      [ViewState.ORDERS]: 'orders',
      [ViewState.CUSTOMERS]: 'customers',
      [ViewState.ANALYTICS]: 'analytics',
      [ViewState.MARKETING]: 'marketing',
      [ViewState.APPEARANCE]: 'appearance',
      [ViewState.APPEARANCE_MENUS]: 'appearance-menus',
      [ViewState.APPEARANCE_WIDGETS]: 'appearance-widgets',
      [ViewState.APPEARANCE_HEADER]: 'appearance-header',
      [ViewState.THEME_PREVIEW]: 'theme-preview',
      [ViewState.PLUGINS]: 'plugins',
      [ViewState.USERS]: 'users',
      [ViewState.TOOLS]: 'tools',
      [ViewState.SETTINGS]: 'settings',
    };
    
    const hash = viewToHash[currentView] || 'dashboard';
    window.location.hash = hash;
  }, [currentView]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const newView = getInitialView();
      if (newView !== currentView) {
        setCurrentView(newView);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  // Helper functions to map API responses to frontend types
  const mapApiPostToPost = (apiPost: any): Post => {
    if (!apiPost) {
      throw new Error('Cannot map null/undefined API response');
    }
    
    // Map directly without WordPress helper functions to avoid dependencies
    return {
      id: apiPost.id || apiPost._id || '',
      title: apiPost.title || '',
      slug: apiPost.slug || '',
      content: apiPost.content || '',
      author: apiPost.author || 'Unknown',
      status: apiPost.status || 'draft',
      categories: apiPost.categories || [],
      tags: apiPost.tags || [],
      date: apiPost.createdAt || apiPost.date || new Date().toISOString(),
      excerpt: apiPost.excerpt || '',
      type: apiPost.type || 'post',
    };
  };

  const mapApiProductToProduct = (apiProduct: any): Product => {
    
    // Handle both lowercase and capitalized status values from backend
    const statusLower = apiProduct.status?.toLowerCase();
    let mappedStatus: 'Active' | 'Draft' | 'Archived' | 'active' | 'draft' | 'archived';
    
    if (statusLower === 'active') {
      mappedStatus = 'Active';
    } else if (statusLower === 'draft') {
      mappedStatus = 'Draft';
    } else if (statusLower === 'archived') {
      mappedStatus = 'Archived';
    } else {
      // Default to Active if status is missing or unknown
      mappedStatus = 'Active';
    }
    
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      slug: apiProduct.slug,
      description: apiProduct.description,
      price: apiProduct.price,
      compareAtPrice: apiProduct.compareAtPrice,
      inventory: apiProduct.inventory,
      sku: apiProduct.sku,
      status: mappedStatus,
      images: apiProduct.images || [],
      vendor: apiProduct.vendor || '',
      category: apiProduct.category || '',
    };
  };

  const mapApiOrderToOrder = (apiOrder: any): Order => ({
    id: apiOrder.id,
    customerName: apiOrder.customerName,
    email: apiOrder.email,
    total: apiOrder.total,
    status: apiOrder.status === 'paid' ? 'Paid' : 
            apiOrder.status === 'refunded' ? 'Refunded' : 'Pending',
    fulfillment: apiOrder.fulfillment === 'fulfilled' ? 'Fulfilled' : 
                 apiOrder.fulfillment === 'partial' ? 'Partial' : 'Unfulfilled',
    date: apiOrder.createdAt || new Date().toISOString(),
    itemsCount: apiOrder.items?.length || 0,
  });

  const mapApiUserToUser = (apiUser: any): User => ({
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    avatar: apiUser.avatar || 'https://picsum.photos/100/100',
    role: apiUser.role === 'admin' ? 'Administrator' : 
          apiUser.role === 'editor' ? 'Editor' : 
          apiUser.role === 'author' ? 'Author' : 'Subscriber',
    posts: apiUser.postsCount || 0,
  });

  const mapApiCommentToComment = (apiComment: any): Comment => ({
    id: apiComment.id,
    author: apiComment.authorName || 'Anonymous',
    email: apiComment.authorEmail || '',
    content: apiComment.content,
    postTitle: apiComment.postTitle || 'Unknown Post',
    date: apiComment.createdAt || new Date().toISOString(),
    status: apiComment.status === 'approved' ? 'Approved' : 
            apiComment.status === 'spam' ? 'Spam' : 'Pending',
  });

  // Fetch all data from API
  const fetchData = useCallback(async () => {
    
    // Check if user is authenticated
    if (!tokenManager.isAuthenticated()) {
      setApiStatus('offline');
      setIsLoading(false);
      setError('Not authenticated. Please log in.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check API health
      const isApiAvailable = await healthApi.checkApi();
      
      if (!isApiAvailable) {
        setApiStatus('offline');
        setError('Backend API is not available. Please ensure the backend server is running on port 4000.');
        setIsLoading(false);
        return;
      }

      setApiStatus('connected');

      // Load data from API in parallel
      const [
        postsResponse,
        pagesResponse,
        productsResponse,
        ordersResponse,
        usersResponse,
        commentsResponse,
        themesData,
        settingsData,
        menusData,
        pluginMenuData,
      ] = await Promise.allSettled([
        postsApi.getAll({ limit: 100 }),
        pagesApi.getAll({ limit: 100 }),
        productsApi.getAll({ limit: 100 }),
        ordersApi.getAll({ limit: 100 }),
        usersApi.getAll({ limit: 100 }),
        commentsApi.getAll({ limit: 100 }),
        themesApi.getAll(),
        settingsApi.get(),
        menusApi.getAll(),
        pluginsApi.getAdminSubMenuItems('appearance'),
      ]);

      // Process results - fail gracefully for individual endpoints
      const errors: string[] = [];

      if (postsResponse.status === 'fulfilled' && postsResponse.value?.data) {
        const mappedPosts = postsResponse.value.data.map(mapApiPostToPost);
        setPosts(mappedPosts);
      } else {
        errors.push('Failed to load posts');
        if (postsResponse.status === 'rejected') {
        }
      }

      if (pagesResponse.status === 'fulfilled' && pagesResponse.value?.data) {
        const mappedPages = pagesResponse.value.data.map((p: any) => {
          const mapped = mapApiPostToPost(p);
          mapped.type = 'page'; // Ensure all pages have type='page'
          return mapped;
        });
        setPages(mappedPages);
      } else {
        errors.push('Failed to load pages');
        if (pagesResponse.status === 'rejected') {
        }
      }

      if (productsResponse.status === 'fulfilled' && productsResponse.value?.data) {
        setProducts(productsResponse.value.data.map(mapApiProductToProduct));
      } else {
        errors.push('Failed to load products');
        if (productsResponse.status === 'rejected') {
        }
      }

      if (ordersResponse.status === 'fulfilled' && ordersResponse.value?.data) {
        setOrders(ordersResponse.value.data.map(mapApiOrderToOrder));
      } else {
        errors.push('Failed to load orders');
        if (ordersResponse.status === 'rejected') {
        }
      }

      if (usersResponse.status === 'fulfilled' && usersResponse.value?.data) {
        const mappedUsers = usersResponse.value.data.map(mapApiUserToUser);
        setUsers(mappedUsers);
        // Set current user from token or first admin
        const adminUser = mappedUsers.find(u => u.role === 'Administrator');
        if (adminUser) setCurrentUser(adminUser);
      } else {
        errors.push('Failed to load users');
        if (usersResponse.status === 'rejected') {
        }
      }

      if (commentsResponse.status === 'fulfilled' && commentsResponse.value?.data) {
        setComments(commentsResponse.value.data.map(mapApiCommentToComment));
      } else {
        errors.push('Failed to load comments');
        if (commentsResponse.status === 'rejected') {
        }
      }

      if (themesData.status === 'fulfilled' && Array.isArray(themesData.value)) {
        setThemes(themesData.value);
        // Set active theme if not set - WordPress stores this in database wp_options
        if (themesData.value.length > 0 && !activeThemeId) {
          // API returns isActive from database
          const activeTheme = themesData.value.find((t: any) => t.isActive === true);
          const activeId = activeTheme?.id || themesData.value[0].id;
          setActiveThemeId(activeId);
          
          // Sync theme loader singleton (memory only - database is source of truth)
          themeLoader.setActiveTheme(activeId);
          
        }
      } else if (themesData.status === 'fulfilled') {
        // themes data is not an array - likely an empty or malformed response
        // Don't add to errors - themes might just be loading differently
      } else {
        // Don't block - themes will use defaults
      }

      if (settingsData.status === 'fulfilled' && settingsData.value && Object.keys(settingsData.value).length > 0) {
        // Merge with defaults to ensure all fields exist
        setSiteSettings({ ...defaultSiteSettings, ...settingsData.value });
      } else if (settingsData.status === 'fulfilled') {
        // Keep default settings - already set in state
      } else {
        // Keep default settings - already set in state
      }

      if (menusData.status === 'fulfilled' && Array.isArray(menusData.value)) {
        setMenus(menusData.value);
      } else {
        setMenus([]);
      }

      if (pluginMenuData.status === 'fulfilled' && Array.isArray(pluginMenuData.value)) {
        setPluginMenuItems(pluginMenuData.value);
      } else {
        setPluginMenuItems([]);
      }

      // Set partial error if some endpoints failed
      if (errors.length > 0 && errors.length < 6) {
        setError(`Some data could not be loaded: ${errors.join(', ')}`);
      } else if (errors.length >= 6) {
        setApiStatus('error');
        setError('Failed to load data from API. Please check your connection and try again.');
      }

    } catch (err) {
      setApiStatus('error');
      setError('Failed to connect to API. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  }, [activeThemeId]);

  // Restore session on mount - check for existing token and fetch user profile
  useEffect(() => {
    const restoreSession = async () => {
      if (tokenManager.isAuthenticated()) {
        try {
          const user = await authApi.getProfile();
          if (user) {
            setCurrentUser(mapApiUserToUser(user));
          }
        } catch (err) {
          tokenManager.clearTokens();
        }
      }
    };
    
    restoreSession();
  }, []);

  // Initialize data on mount and listen for auth changes
  useEffect(() => {
    fetchData();
    
    // Listen for login events to re-fetch data
    const handleAuthLogin = () => {
      fetchData();
    };
    
    // Listen for logout events to clear data
    const handleAuthLogout = () => {
      setApiStatus('offline');
      setPosts([]);
      setPages([]);
      setProducts([]);
      setOrders([]);
      setUsers([]);
      setComments([]);
      setCurrentUser(null);
      setError('Not authenticated. Please log in.');
    };
    
    window.addEventListener('auth:login', handleAuthLogin);
    window.addEventListener('auth:logout', handleAuthLogout);
    
    return () => {
      window.removeEventListener('auth:login', handleAuthLogin);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [fetchData]);

  // CRUD Operations - All require API connection

  const addPost = useCallback(async (post: Post) => {
    if (apiStatus !== 'connected') {
      throw new Error('Cannot create post: API not connected');
    }

    try {
      const apiData = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        status: (post.status === PostStatus.PUBLISHED ? 'published' : 
                post.status === PostStatus.DRAFT ? 'draft' : 'trash') as 'published' | 'draft' | 'trash',
        categories: post.categories,
        tags: post.tags,
        // Note: 'type' field is NOT sent to API - posts/pages are determined by endpoint
      };

      const created = post.type === 'page' 
        ? await pagesApi.create(apiData)
        : await postsApi.create(apiData);


      // Check if API response is valid
      if (!created || !created.id) {
        throw new Error('API returned invalid response - missing id');
      }

      // Map API response and ensure type is preserved
      const mappedPost = mapApiPostToPost(created);
      mappedPost.type = post.type; // Explicitly set type from input
      
      
      if (post.type === 'page') {
        setPages((prev) => {
          const updated = [mappedPost, ...prev];
          return updated;
        });
      } else {
        setPosts((prev) => {
          const updated = [mappedPost, ...prev];
          return updated;
        });
      }

      return mappedPost;
    } catch (err) {
      throw err;
    }
  }, [apiStatus]);

  const updatePost = useCallback(async (idOrPost: string | Post, updates?: Partial<Post>) => {
    if (apiStatus !== 'connected') {
      throw new Error('Cannot update post: API not connected');
    }

    try {
      let updatedPost: Post;
      
      // Support both signatures: (id, updates) and (fullPost)
      if (typeof idOrPost === 'string') {
        const existing = posts.find(p => p.id === idOrPost) || pages.find(p => p.id === idOrPost);
        if (!existing) throw new Error('Post not found');
        updatedPost = { ...existing, ...updates };
      } else {
        updatedPost = idOrPost;
      }

      const apiData = {
        title: updatedPost.title,
        content: updatedPost.content,
        excerpt: updatedPost.excerpt,
        status: (updatedPost.status === PostStatus.PUBLISHED ? 'published' : 
                updatedPost.status === PostStatus.DRAFT ? 'draft' : 'trash') as 'published' | 'draft' | 'trash',
        categories: updatedPost.categories,
        tags: updatedPost.tags,
      };

      if (updatedPost.type === 'page') {
        await pagesApi.update(updatedPost.id, apiData);
        setPages((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
      } else {
        await postsApi.update(updatedPost.id, apiData);
        setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
      }
      
      return updatedPost; // Return the updated post
    } catch (err) {
      throw err;
    }
  }, [apiStatus, posts, pages]);

  const deletePost = useCallback(async (id: string) => {
    if (apiStatus !== 'connected') {
      throw new Error('Cannot delete post: API not connected');
    }

    try {
      const postToDelete = posts.find(p => p.id === id);
      const pageToDelete = pages.find(p => p.id === id);
      
      if (pageToDelete) {
        await pagesApi.delete(id);
        setPages((prev) => prev.filter((p) => p.id !== id));
      } else if (postToDelete) {
        await postsApi.delete(id);
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      throw err;
    }
  }, [apiStatus, posts, pages]);

  const addProduct = useCallback(async (product: Product) => {
    if (apiStatus !== 'connected') {
      throw new Error('Cannot create product: API not connected');
    }

    try {
      const apiData = {
        title: product.title,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        inventory: product.inventory,
        sku: product.sku,
        status: (product.status === 'Active' ? 'active' : 
                product.status === 'Draft' ? 'draft' : 'archived') as 'active' | 'draft' | 'archived',
        images: product.images,
        vendor: product.vendor,
        category: product.category,
      };

      const created = await productsApi.create(apiData);
      const mappedProduct = mapApiProductToProduct(created);
      setProducts((prev) => [mappedProduct, ...prev]);
      return mappedProduct;
    } catch (err) {
      throw err;
    }
  }, [apiStatus]);

  const updateProduct = useCallback(async (idOrProduct: string | Product, updates?: Partial<Product>) => {
    if (apiStatus !== 'connected') {
      throw new Error('Cannot update product: API not connected');
    }

    try {
      let updated: Product;
      
      // Support both signatures: (id, updates) and (fullProduct)
      if (typeof idOrProduct === 'string') {
        const existing = products.find(p => p.id === idOrProduct);
        if (!existing) throw new Error('Product not found');
        updated = { ...existing, ...updates };
      } else {
        updated = idOrProduct;
      }

      const apiData = {
        title: updated.title,
        description: updated.description,
        price: updated.price,
        compareAtPrice: updated.compareAtPrice,
        inventory: updated.inventory,
        sku: updated.sku,
        status: (updated.status === 'Active' ? 'active' : 
                updated.status === 'Draft' ? 'draft' : 'archived') as 'active' | 'draft' | 'archived',
        images: updated.images,
        vendor: updated.vendor,
        category: updated.category,
      };

      await productsApi.update(updated.id, apiData);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (err) {
      throw err;
    }
  }, [apiStatus, products]);

  const deleteProduct = useCallback(async (id: string) => {
    if (apiStatus !== 'connected') {
      throw new Error('Cannot delete product: API not connected');
    }

    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      throw err;
    }
  }, [apiStatus]);

  // Order management functions
  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  // User management functions
  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const setActiveTheme = useCallback(async (themeId: string) => {
    if (apiStatus !== 'connected') {
      throw new Error('Cannot set theme: API not connected');
    }

    try {
      // Activate theme - persists to database (WordPress-style: wp_options 'template' and 'stylesheet')
      await themesApi.activate(themeId);
      
      // Update local state
      setActiveThemeId(themeId);
      
      // Update theme loader singleton (memory only - source of truth is database)
      themeLoader.setActiveTheme(themeId);
      
      // Update themes list to reflect active state
      setThemes(prev => prev.map(t => ({
        ...t,
        isActive: t.id === themeId
      })));
      
    } catch (err) {
      throw err;
    }
  }, [apiStatus]);

  const updateSiteSettings = useCallback(async (settings: Partial<SiteSettings>) => {
    if (apiStatus !== 'connected') {
      throw new Error('Cannot update settings: API not connected');
    }

    try {
      await settingsApi.update(settings);
      setSiteSettings(prev => prev ? { ...prev, ...settings } : settings as SiteSettings);
    } catch (err) {
      throw err;
    }
  }, [apiStatus]);

  // Menu management functions
  const addMenu = useCallback(async (menu: Menu) => {
    if (apiStatus !== 'connected') {
      throw new Error('Cannot add menu: API not connected');
    }

    try {
      const created = await menusApi.create({
        name: menu.name,
        slug: menu.slug,
        location: menu.location,
        items: menu.items,
      });
      setMenus(prev => [...prev, created]);
    } catch (err) {
      throw err;
    }
  }, [apiStatus]);

  const updateMenu = useCallback(async (menu: Menu) => {
    if (apiStatus !== 'connected') {
      throw new Error('Cannot update menu: API not connected');
    }

    try {
      const updated = await menusApi.update(menu.id, {
        name: menu.name,
        slug: menu.slug,
        location: menu.location,
        items: menu.items,
      });
      setMenus(prev => prev.map(m => m.id === menu.id ? updated : m));
    } catch (err) {
      throw err;
    }
  }, [apiStatus]);

  const deleteMenu = useCallback(async (id: string) => {
    if (apiStatus !== 'connected') {
      throw new Error('Cannot delete menu: API not connected');
    }

    try {
      await menusApi.delete(id);
      setMenus(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      throw err;
    }
  }, [apiStatus]);

  const getMenuByLocation = useCallback((location: string): Menu | undefined => {
    return menus.find(m => m.location === location);
  }, [menus]);

  // Refetch data function for manual refresh
  const refetchData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Refresh plugin menu items only
  const refreshPluginMenuItems = useCallback(async () => {
    try {
      const menuItems = await pluginsApi.getAdminSubMenuItems('appearance');
      setPluginMenuItems(menuItems);
    } catch (err) {
      setPluginMenuItems([]);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<ExtendedCMSContextType>(() => ({
    posts,
    pages,
    comments,
    plugins,
    pluginMenuItems,
    users,
    products,
    orders,
    themes,
    activeThemeId,
    siteSettings: siteSettings || {
      siteName: '',
      tagline: '',
      siteUrl: '',
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        structuredData: false,
      },
      social: {},
      footer: {
        copyright: '',
        showPoweredBy: true,
      },
    },
    menus,
    addPost,
    updatePost,
    deletePost,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrder,
    deleteOrder,
    updateUser,
    deleteUser,
    setActiveTheme,
    updateSiteSettings,
    addMenu,
    updateMenu,
    deleteMenu,
    getMenuByLocation,
    refreshPluginMenuItems,
    currentView,
    setCurrentView,
    editingPostId,
    setEditingPostId,
    editingProductId,
    setEditingProductId,
    previewThemeId,
    setPreviewThemeId,
    currentUser: currentUser || {
      id: '',
      name: 'Guest',
      email: '',
      avatar: '',
      role: 'Subscriber',
      posts: 0,
    },
    apiStatus,
    isLoading,
    error,
    refetchData,
  }), [
    posts,
    pages,
    comments,
    plugins,
    pluginMenuItems,
    users,
    products,
    orders,
    themes,
    activeThemeId,
    siteSettings,
    menus,
    addPost,
    updatePost,
    deletePost,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrder,
    deleteOrder,
    updateUser,
    deleteUser,
    setActiveTheme,
    updateSiteSettings,
    addMenu,
    updateMenu,
    deleteMenu,
    getMenuByLocation,
    refreshPluginMenuItems,
    currentView,
    editingPostId,
    editingProductId,
    previewThemeId,
    currentUser,
    apiStatus,
    isLoading,
    error,
    refetchData,
  ]);

  return (
    <CMSContext.Provider value={contextValue}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
