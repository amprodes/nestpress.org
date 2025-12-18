import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  Menu, 
  LogOut,
  Bell,
  Search,
  File,
  MessageSquare,
  Paintbrush,
  Plug,
  Users,
  Wrench,
  ShoppingBag,
  ShoppingCart,
  BarChart2,
  Megaphone,
  UserCheck,
  ChevronDown,
  Eye,
  UserCircle2,
  Palette,
  Layout as LayoutIcon,
  Grid3x3,
  Image as HeaderIcon,
  Sparkles
} from 'lucide-react';
import { useCMS } from '../contexts/CMSContext';
import { useAuth } from '../contexts/AuthContext';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentView, setCurrentView, currentUser, setEditingPostId, setEditingProductId, setPreviewThemeId, activeThemeId, pluginMenuItems } = useCMS();
  const { logout, user: authUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [appearanceMenuOpen, setAppearanceMenuOpen] = useState(true);

  // Debug: Log plugin menu items when they change
  useEffect(() => {
    console.log('[Layout] Plugin menu items updated:', pluginMenuItems);
  }, [pluginMenuItems]);

  // Handle View Site click - navigate to public website
  const handleViewSite = () => {
    window.location.href = '/';
  };

  // Use auth user if available, fallback to CMS user
  const displayUser = authUser ? {
    name: authUser.name,
  } : currentUser;

  const navGroups = [
    {
        title: null,
        items: [
            { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
        ]
    },
    {
        title: 'Commerce',
        items: [
            { id: ViewState.ORDERS, label: 'Orders', icon: ShoppingCart },
            { id: ViewState.PRODUCTS, label: 'Products', icon: ShoppingBag },
            { id: ViewState.CUSTOMERS, label: 'Customers', icon: UserCheck },
        ]
    },
    {
        title: 'Content',
        items: [
            { id: ViewState.POSTS_LIST, label: 'Posts', icon: FileText },
            { id: ViewState.PAGES_LIST, label: 'Pages', icon: File },
            { id: ViewState.MEDIA, label: 'Media', icon: ImageIcon },
            { id: ViewState.COMMENTS, label: 'Comments', icon: MessageSquare },
        ]
    },
    {
        title: 'Growth',
        items: [
            { id: ViewState.ANALYTICS, label: 'Analytics', icon: BarChart2 },
            { id: ViewState.MARKETING, label: 'Marketing', icon: Megaphone },
        ]
    },
    {
        title: 'Configuration',
        items: [
            { id: ViewState.PLUGINS, label: 'Apps & Plugins', icon: Plug },
            { id: ViewState.USERS, label: 'Users', icon: Users },
            { id: ViewState.TOOLS, label: 'Tools', icon: Wrench },
            { id: ViewState.SETTINGS, label: 'Settings', icon: Settings },
        ]
    }
  ];

  // Add plugin menu items dynamically (WordPress-style)
  if (pluginMenuItems && pluginMenuItems.length > 0) {
    const pluginItems = pluginMenuItems.map(item => ({
      id: item.menuSlug as ViewState, // Cast to ViewState
      label: item.menuTitle,
      icon: Plug, // Default icon - plugins can provide custom icons
      pluginSlug: item.pluginSlug,
      pageTitle: item.pageTitle,
    }));

    navGroups.push({
      title: 'Plugins',
      items: pluginItems,
    });
  }

  const handleNavClick = (view: ViewState) => {
    if ([ViewState.POSTS_LIST, ViewState.PAGES_LIST].includes(view)) {
        setEditingPostId(null);
    }
    if ([ViewState.PRODUCTS].includes(view)) {
        setEditingProductId(null);
    }
    setCurrentView(view);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f0f0f1]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-48 bg-[#1e1e1e] text-white transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        <div className="h-12 flex items-center px-4 bg-[#000] font-bold text-lg tracking-tight shrink-0">
          <span className="text-white">Nest</span><span className="text-blue-400">Press</span>
        </div>

        <nav className="mt-2 flex-1 overflow-y-auto custom-scrollbar pb-4">
          {navGroups.map((group, idx) => (
              <div key={idx} className="mb-2">
                  {group.title && (
                      <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-2">
                          {group.title}
                      </div>
                  )}
                  <ul>
                    {/* Appearance Parent Menu with Submenu - WordPress style */}
                    {group.title === 'Configuration' && (
                      <>
                        <li>
                          <button
                            onClick={() => setAppearanceMenuOpen(!appearanceMenuOpen)}
                            className={`
                              w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium transition-colors group
                              ${
                                [ViewState.APPEARANCE, ViewState.APPEARANCE_MENUS, ViewState.APPEARANCE_WIDGETS, ViewState.APPEARANCE_HEADER].includes(currentView)
                                  ? 'bg-[#2c3338] text-white' 
                                  : 'text-gray-300 hover:bg-[#2c3338] hover:text-white'
                              }
                            `}
                          >
                            <div className="flex items-center">
                              <Paintbrush size={16} className="mr-2 opacity-80 group-hover:opacity-100" />
                              Appearance
                            </div>
                            <ChevronDown size={14} className={`transition-transform ${appearanceMenuOpen ? 'rotate-180' : ''}`} />
                          </button>
                        </li>
                        
                        {appearanceMenuOpen && (
                          <>
                            <li>
                              <button
                                onClick={() => handleNavClick(ViewState.APPEARANCE)}
                                className={`
                                  w-full flex items-center px-6 py-2 text-[13px] font-medium transition-colors group
                                  ${currentView === ViewState.APPEARANCE
                                    ? 'bg-[#2271b1] text-white' 
                                    : 'text-gray-400 hover:bg-[#2c3338] hover:text-white'
                                  }
                                `}
                              >
                                <Palette size={14} className="mr-2" />
                                Themes
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavClick(ViewState.APPEARANCE_MENUS)}
                                className={`
                                  w-full flex items-center px-6 py-2 text-[13px] font-medium transition-colors group
                                  ${currentView === ViewState.APPEARANCE_MENUS
                                    ? 'bg-[#2271b1] text-white' 
                                    : 'text-gray-400 hover:bg-[#2c3338] hover:text-white'
                                  }
                                `}
                              >
                                <LayoutIcon size={14} className="mr-2" />
                                Menus
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavClick(ViewState.APPEARANCE_WIDGETS)}
                                className={`
                                  w-full flex items-center px-6 py-2 text-[13px] font-medium transition-colors group
                                  ${currentView === ViewState.APPEARANCE_WIDGETS
                                    ? 'bg-[#2271b1] text-white' 
                                    : 'text-gray-400 hover:bg-[#2c3338] hover:text-white'
                                  }
                                `}
                              >
                                <Grid3x3 size={14} className="mr-2" />
                                Widgets
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => handleNavClick(ViewState.APPEARANCE_HEADER)}
                                className={`
                                  w-full flex items-center px-6 py-2 text-[13px] font-medium transition-colors group
                                  ${currentView === ViewState.APPEARANCE_HEADER
                                    ? 'bg-[#2271b1] text-white' 
                                    : 'text-gray-400 hover:bg-[#2c3338] hover:text-white'
                                  }
                                `}
                              >
                                <HeaderIcon size={14} className="mr-2" />
                                Header
                              </button>
                            </li>
                            
                            {/* Plugin Submenus under Appearance */}
                            {pluginMenuItems && Array.isArray(pluginMenuItems) && pluginMenuItems.map((pluginItem: any) => {
                              // Map icon name to Lucide icon component
                              const iconMap: Record<string, any> = { Sparkles };
                              const PluginIcon = pluginItem.icon ? iconMap[pluginItem.icon] : null;
                              
                              return (
                                <li key={pluginItem.id}>
                                  <button
                                    onClick={() => handleNavClick(pluginItem.menuSlug as ViewState)}
                                    className={`
                                      w-full flex items-center px-6 py-2 text-[13px] font-medium transition-colors group
                                      ${currentView === pluginItem.menuSlug
                                        ? 'bg-[#2271b1] text-white' 
                                        : 'text-gray-400 hover:bg-[#2c3338] hover:text-white'
                                      }
                                    `}
                                  >
                                    {PluginIcon && <PluginIcon size={14} className="mr-2" />}
                                    {pluginItem.menuTitle}
                                  </button>
                                </li>
                              );
                            })}
                          </>
                        )}
                      </>
                    )}
                    
                    {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id || 
                                    (currentView === ViewState.POST_EDIT && item.id === ViewState.POSTS_LIST) ||
                                    (currentView === ViewState.PRODUCT_EDIT && item.id === ViewState.PRODUCTS);
                    
                    return (
                        <li key={item.id}>
                        <button
                            onClick={() => handleNavClick(item.id)}
                            className={`
                            w-full flex items-center px-3 py-2 text-[13px] font-medium transition-colors relative group
                            ${isActive 
                                ? 'bg-[#2271b1] text-white' 
                                : 'text-gray-300 hover:bg-[#2c3338] hover:text-white'
                            }
                            `}
                        >
                            <Icon size={16} className={`mr-2 ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`} />
                            {item.label}
                        </button>
                        </li>
                    );
                    })}
                  </ul>
              </div>
          ))}
        </nav>
        
        <div className="shrink-0 p-4 border-t border-gray-700 bg-[#1e1e1e]">
           <button className="flex items-center text-gray-400 hover:text-white transition-colors text-xs w-full">
               <LogOut size={14} className="mr-2" /> Collapse Menu
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-8 bg-[#1d2327] text-white flex justify-between items-center px-4 lg:px-4 z-20 shrink-0">
          <div className="flex items-center gap-4">
              <button 
                className="lg:hidden text-gray-400 hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <div className="hidden lg:flex items-center gap-3 text-sm font-light text-gray-300">
                 <a href="#" className="hover:text-blue-400 flex items-center gap-1"><span className="font-bold">NestPress</span></a>
                 <span className="text-gray-600 text-xs">0</span>
                 <a href="#" className="hover:text-blue-400 flex items-center gap-1"><span className="text-xs">+ New</span></a>
                 <button 
                   onClick={handleViewSite}
                   className="hover:text-blue-400 flex items-center gap-1 text-xs bg-blue-600 px-2 py-1 rounded text-white hover:bg-blue-700"
                 >
                   <Eye size={12} />
                   <span>View Site</span>
                 </button>
              </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 group cursor-pointer hover:text-blue-400"
              >
                <span className="text-gray-300 group-hover:text-blue-400">Howdy, {displayUser.name}</span>
                <UserCircle2 size={24} className="text-gray-400 group-hover:text-blue-400" />
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{displayUser.name}</p>
                      {authUser && <p className="text-xs text-gray-500">{authUser.email}</p>}
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setCurrentView(ViewState.SETTINGS);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings size={14} />
                      Edit Profile
                    </button>
                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await logout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-auto p-5 lg:p-8 pb-8 relative">
           {children}
        </main>

        {/* Admin Footer (WordPress-style) */}
        <footer className="px-5 lg:px-8 py-5 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <p>Thank you for creating with <span className="font-semibold">NestPress</span></p>
            <p>Version 1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;