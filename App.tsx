import React, { Suspense, lazy } from 'react';
import { CMSProvider, useCMS } from './contexts/CMSContext';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ModalProvider } from './components/Modal';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ContentList from './components/ContentList';
import PostEditor from './components/PostEditor';
import MediaLibrary from './components/MediaLibrary';
import CommentsList from './components/CommentsList';
import Appearance from './components/Appearance';
import AppearanceMenus from './components/appearance/AppearanceMenus';
import AppearanceWidgets from './components/appearance/AppearanceWidgets';
import AppearanceHeader from './components/appearance/AppearanceHeader';
import PluginList from './components/PluginList';
import PluginEditor from './components/PluginEditor';
import UserList from './components/UserList';
import Tools from './components/Tools';
import Settings from './components/Settings';
import ProductEditor from './components/ProductEditor';
import OrderList from './components/OrderList';
import ThemePreview from './components/templates/ThemePreview';
import WebsiteFrontend from './components/templates/WebsiteFrontend';
import SetupWizard from './components/wizard/SetupWizard';
import LoginPage from './components/LoginPage';
import PluginView from './components/PluginView';
import { ViewState } from './types';

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Admin CMS Content
const AdminContent: React.FC = () => {
  const { currentView, pluginMenuItems } = useCMS();

  // Theme Preview renders fullscreen without Layout
  if (currentView === ViewState.THEME_PREVIEW) {
    return <ThemePreview />;
  }

  const renderView = () => {
    switch (currentView) {
      // Content
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.POSTS_LIST:
        return <ContentList postType="post" />;
      case ViewState.PAGES_LIST:
        return <ContentList postType="page" />;
      case ViewState.POST_EDIT:
      case ViewState.PAGE_EDIT:
        return <PostEditor />;
      case ViewState.MEDIA:
        return <MediaLibrary />;
      case ViewState.COMMENTS:
        return <CommentsList />;
        
      // Commerce
      case ViewState.PRODUCTS:
        return <ContentList postType="product" />;
      case ViewState.PRODUCT_EDIT:
        return <ProductEditor />;
      case ViewState.ORDERS:
        return <OrderList />;
      case ViewState.CUSTOMERS:
        return <div className="p-8 text-center text-gray-500 animate-fade-in"><h2 className="text-xl mb-2">Customers</h2><p>Customer management features coming soon.</p></div>;
      case ViewState.ANALYTICS:
        return <div className="p-8 text-center text-gray-500 animate-fade-in"><h2 className="text-xl mb-2">Analytics</h2><p>Commerce analytics and reporting coming soon.</p></div>;
      case ViewState.MARKETING:
        return <div className="p-8 text-center text-gray-500 animate-fade-in"><h2 className="text-xl mb-2">Marketing</h2><p>Campaigns and automation features coming soon.</p></div>;
        
      // Config - Appearance submenus
      case ViewState.APPEARANCE:
        return <Appearance />;
      case ViewState.APPEARANCE_MENUS:
        return <AppearanceMenus />;
      case ViewState.APPEARANCE_WIDGETS:
        return <AppearanceWidgets />;
      case ViewState.APPEARANCE_HEADER:
        return <AppearanceHeader />;
      case ViewState.PLUGINS:
        return <PluginList />;
      case ViewState.PLUGIN_EDITOR:
        return <PluginEditor />;
      case ViewState.USERS:
        return <UserList />;
      case ViewState.TOOLS:
        return <Tools />;
      case ViewState.SETTINGS:
        return <Settings />;
      default:
        // Check if currentView matches a plugin menu slug
        const pluginMenuItem = pluginMenuItems?.find((item: any) => item.menuSlug === currentView);
        if (pluginMenuItem) {
          console.log('[App] Rendering plugin view:', currentView);
          return <PluginView pluginSlug={currentView as string} />;
        }
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
};

// App Router - WordPress-like routing
// / = Public website
// /admin = Admin dashboard (requires login)
const AppRouter: React.FC = () => {
  const { appMode, isLoading: configLoading } = useConfig();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = React.useState(window.location.pathname);
  
  // Listen for navigation changes
  React.useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate', handleLocationChange);
    window.addEventListener('replacestate', handleLocationChange);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate', handleLocationChange);
      window.removeEventListener('replacestate', handleLocationChange);
    };
  }, []);
  
  // Show loading while config is being loaded
  if (configLoading) {
    return <LoadingFallback />;
  }
  
  // Setup Wizard - shown on first launch
  if (appMode === 'setup') {
    return <SetupWizard />;
  }
  
  // Check if admin route
  const isAdminRoute = currentRoute.startsWith('/admin') || 
                       currentRoute === '/wp-admin' ||
                       (window.location.hash && 
                        !window.location.hash.startsWith('#/') && 
                        window.location.hash !== '#');
  
  // ADMIN ROUTE - requires authentication
  if (isAdminRoute) {
    // Show loading while checking auth
    if (authLoading) {
      return <LoadingFallback />;
    }
    
    // Show login if not authenticated
    if (!isAuthenticated) {
      return <LoginPage />;
    }
    
    // Show admin dashboard
    return <AdminContent />;
  }
  
  // PUBLIC WEBSITE - no auth required
  return <WebsiteFrontend />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ModalProvider>
          <AuthProvider>
            <ConfigProvider>
              <CMSProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <AppRouter />
                </Suspense>
              </CMSProvider>
            </ConfigProvider>
          </AuthProvider>
        </ModalProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;