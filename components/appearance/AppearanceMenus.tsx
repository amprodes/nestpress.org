import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search as SearchIcon, GripVertical, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { Menu, MenuItem, PostStatus } from '../../types';
import { useCMS } from '../../contexts/CMSContext';
import { useModal } from '../Modal';
import { pluginsApi } from '../../services/api';
import { DataCard, DataCardHeader, DataCardBody } from '../common/DataCard';

const AppearanceMenus: React.FC = () => {
  const { menus, addMenu, updateMenu, deleteMenu, posts, pages, products } = useCMS();
  const { confirm, alert } = useModal();
  
  // Active tab: 'edit' or 'locations'
  const [activeTab, setActiveTab] = useState<'edit' | 'locations'>('edit');
  
  // Selected menu for editing
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  
  // Expanded panels in left sidebar
  const [expandedPanels, setExpandedPanels] = useState<{ [key: string]: boolean }>({
    pages: true,
  });
  
  // Panel view modes: 'most-recent' | 'view-all' | 'search'
  const [panelViews, setPanelViews] = useState<{ [key: string]: string }>({
    pages: 'most-recent',
    posts: 'most-recent',
    products: 'most-recent',
  });
  
  // Search terms for each panel
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  
  // Selected items in each panel
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Custom link form
  const [customLinkUrl, setCustomLinkUrl] = useState('');
  const [customLinkLabel, setCustomLinkLabel] = useState('');
  
  // Drag and drop
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  // Auto-add pages setting
  const [autoAddPages, setAutoAddPages] = useState(false);

  // Plugin menu item panels
  const [pluginPanels, setPluginPanels] = useState<any[]>([]);

  // Expanded menu items (for editing)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Create menu modal
  const [showCreateMenuModal, setShowCreateMenuModal] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');

  // Load plugin panels
  useEffect(() => {
    const loadPluginPanels = async () => {
      try {
        const panels = await pluginsApi.getMenuItemPanels();
        setPluginPanels(panels);
        console.log('Loaded plugin menu panels:', panels);
      } catch (error) {
        console.error('Failed to load plugin panels:', error);
      }
    };
    loadPluginPanels();
  }, []);

  // Initialize with first menu if available
  useEffect(() => {
    if (menus.length > 0 && !selectedMenuId) {
      setSelectedMenuId(menus[0].id);
      setEditingMenu(JSON.parse(JSON.stringify(menus[0])));
    }
  }, [menus, selectedMenuId]);

  // Update editing menu when selected menu changes
  useEffect(() => {
    const menu = menus.find(m => m.id === selectedMenuId);
    if (menu) {
      setEditingMenu(JSON.parse(JSON.stringify(menu)));
    }
  }, [selectedMenuId, menus]);

  const togglePanel = (panel: string) => {
    setExpandedPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  const handleAddSelectedPages = () => {
    if (!editingMenu || selectedPages.length === 0) return;
    
    const newItems: MenuItem[] = selectedPages.map((pageId, index) => {
      const page = pages.find(p => p.id === pageId);
      if (!page) return null;
      
      return {
        id: `item_${Date.now()}_${index}`,
        label: page.title,
        url: `/${page.slug}`,
        target: '_self',
        order: editingMenu.items.length + index,
      };
    }).filter(Boolean) as MenuItem[];
    
    setEditingMenu({
      ...editingMenu,
      items: [...editingMenu.items, ...newItems],
    });
    setSelectedPages([]);
  };

  const handleAddSelectedPosts = () => {
    if (!editingMenu || selectedPosts.length === 0) return;
    
    const newItems: MenuItem[] = selectedPosts.map((postId, index) => {
      const post = posts.find(p => p.id === postId);
      if (!post) return null;
      
      return {
        id: `item_${Date.now()}_${index}`,
        label: post.title,
        url: `/blog/${post.slug}`,
        target: '_self',
        order: editingMenu.items.length + index,
      };
    }).filter(Boolean) as MenuItem[];
    
    setEditingMenu({
      ...editingMenu,
      items: [...editingMenu.items, ...newItems],
    });
    setSelectedPosts([]);
  };

  const handleAddSelectedProducts = () => {
    if (!editingMenu || selectedProducts.length === 0) return;
    
    const newItems: MenuItem[] = selectedProducts.map((productId, index) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      
      return {
        id: `item_${Date.now()}_${index}`,
        label: product.name,
        url: `/shop/${product.slug}`,
        target: '_self',
        order: editingMenu.items.length + index,
      };
    }).filter(Boolean) as MenuItem[];
    
    setEditingMenu({
      ...editingMenu,
      items: [...editingMenu.items, ...newItems],
    });
    setSelectedProducts([]);
  };

  const handleAddCustomLink = () => {
    if (!editingMenu || !customLinkUrl.trim() || !customLinkLabel.trim()) return;
    
    const newItem: MenuItem = {
      id: `item_${Date.now()}`,
      label: customLinkLabel,
      url: customLinkUrl,
      target: '_self',
      order: editingMenu.items.length,
    };
    
    setEditingMenu({
      ...editingMenu,
      items: [...editingMenu.items, newItem],
    });
    setCustomLinkUrl('');
    setCustomLinkLabel('');
  };

  const handleDeleteItem = (itemId: string) => {
    if (!editingMenu) return;
    
    setEditingMenu({
      ...editingMenu,
      items: editingMenu.items.filter(item => item.id !== itemId),
    });
  };

  const handleSaveMenu = async () => {
    if (!editingMenu) return;

    try {
      await updateMenu(editingMenu);
      await alert({
        title: 'Success',
        message: 'Menu saved successfully!',
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to save menu:', error);
      await alert({
        title: 'Error',
        message: 'Failed to save menu. Please try again.',
        variant: 'error'
      });
    }
  };

  const handleCreateNewMenu = async () => {
    if (!newMenuName.trim()) return;

    const slug = newMenuName.toLowerCase().replace(/\s+/g, '-');
    const newMenu: Menu = {
      id: `menu_${Date.now()}`,
      name: newMenuName,
      slug,
      location: 'custom',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await addMenu(newMenu);
      setSelectedMenuId(newMenu.id);
      setEditingMenu(JSON.parse(JSON.stringify(newMenu)));
      setShowCreateMenuModal(false);
      setNewMenuName('');
    } catch (error) {
      console.error('Failed to create menu:', error);
      await alert({
        title: 'Error',
        message: 'Failed to create menu. Please try again.',
        variant: 'error'
      });
    }
  };

  const handleDeleteMenu = async () => {
    if (!editingMenu) return;

    const confirmed = await confirm({
      title: 'Delete Menu',
      message: `Are you sure you want to delete "${editingMenu.name}"?`,
      confirmText: 'Delete',
      variant: 'warning'
    });

    if (!confirmed) return;

    try {
      await deleteMenu(editingMenu.id);
      setSelectedMenuId(menus[0]?.id || '');
    } catch (error) {
      console.error('Failed to delete menu:', error);
    }
  };

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (!editingMenu || !draggedItem || draggedItem === itemId) return;

    const items = [...editingMenu.items];
    const draggedIndex = items.findIndex(i => i.id === draggedItem);
    const targetIndex = items.findIndex(i => i.id === itemId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [removed] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, removed);

    const reordered = items.map((item, index) => ({ ...item, order: index }));

    setEditingMenu({
      ...editingMenu,
      items: reordered,
    });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Get pages based on view mode
  const getDisplayedPages = () => {
    console.log('Total pages:', pages.length, 'Published:', pages.filter(p => p.status === PostStatus.PUBLISHED).length);
    const publishedPages = pages.filter(p => p.status === PostStatus.PUBLISHED);
    
    if (panelViews.pages === 'search' && searchTerms.pages) {
      return publishedPages.filter(p => 
        p.title.toLowerCase().includes(searchTerms.pages.toLowerCase())
      );
    }
    
    if (panelViews.pages === 'most-recent') {
      return publishedPages.slice(0, 5);
    }
    
    return publishedPages; // view-all
  };

  // Get posts based on view mode
  const getDisplayedPosts = () => {
    console.log('Total posts:', posts.length, 'Published:', posts.filter(p => p.status === PostStatus.PUBLISHED).length);
    const publishedPosts = posts.filter(p => p.status === PostStatus.PUBLISHED);
    
    if (panelViews.posts === 'search' && searchTerms.posts) {
      return publishedPosts.filter(p => 
        p.title.toLowerCase().includes(searchTerms.posts.toLowerCase())
      );
    }
    
    if (panelViews.posts === 'most-recent') {
      return publishedPosts.slice(0, 5);
    }
    
    return publishedPosts; // view-all
  };

  // Get products based on view mode
  const getDisplayedProducts = () => {
    console.log('=== Product Debug ===');
    console.log('Products array:', products);
    console.log('Total products:', products?.length || 0);
    
    if (!products || products.length === 0) {
      console.log('No products available');
      return [];
    }
    
    console.log('Product statuses:', products.map(p => ({ name: p.name, status: p.status })));
    
    // Filter for active products (check both capitalized and lowercase)
    const publishedProducts = products.filter(p => {
      const status = p.status;
      const isActive = status === 'Active' || status === 'active' || 
                      (typeof status === 'string' && status.toLowerCase() === 'active');
      console.log(`Product ${p.name}: status="${status}", isActive=${isActive}`);
      return isActive;
    });
    
    console.log('Filtered published products:', publishedProducts.length);
    
    if (panelViews.products === 'search' && searchTerms.products) {
      return publishedProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerms.products.toLowerCase())
      );
    }
    
    if (panelViews.products === 'most-recent') {
      return publishedProducts.slice(0, 5);
    }
    
    return publishedProducts; // view-all
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tabs - WordPress style */}
      <div className="border-b border-gray-300 bg-gray-50">
        <div className="flex">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'edit'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Edit Menus
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'locations'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Manage Locations
          </button>
        </div>
      </div>

      {/* Edit Menus Tab */}
      {activeTab === 'edit' && (
        <div className="p-6">
          {/* Menu Selection */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Select a menu to edit:
              </label>
              <select
                value={selectedMenuId}
                onChange={(e) => setSelectedMenuId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {menus.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name} ({menu.location})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCreateMenuModal(true)}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                or create a new menu
              </button>
            </div>
            {menus.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Do not forget to save your changes!
              </p>
            )}
          </div>

          {editingMenu && (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Sidebar - Add Menu Items */}
              <div className="col-span-4 space-y-2">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Add menu items</h3>

                {/* Pages Panel */}
                <div className="border border-gray-300 rounded">
                  <button
                    onClick={() => togglePanel('pages')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900">Pages</span>
                    {expandedPanels.pages ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedPanels.pages && (
                    <div className="p-3 bg-white">
                      {/* View Tabs */}
                      <div className="flex gap-3 mb-3 text-sm">
                        <button
                          onClick={() => setPanelViews(prev => ({ ...prev, pages: 'most-recent' }))}
                          className={`${panelViews.pages === 'most-recent' ? 'text-gray-900 font-medium' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          Most Recent
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          onClick={() => setPanelViews(prev => ({ ...prev, pages: 'view-all' }))}
                          className={`${panelViews.pages === 'view-all' ? 'text-gray-900 font-medium' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          View All
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          onClick={() => setPanelViews(prev => ({ ...prev, pages: 'search' }))}
                          className={`${panelViews.pages === 'search' ? 'text-gray-900 font-medium' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          Search
                        </button>
                      </div>

                      {/* Search Input */}
                      {panelViews.pages === 'search' && (
                        <div className="mb-3">
                          <input
                            type="text"
                            value={searchTerms.pages || ''}
                            onChange={(e) => setSearchTerms(prev => ({ ...prev, pages: e.target.value }))}
                            placeholder="Search pages..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Pages List */}
                      <div className="max-h-48 overflow-y-auto mb-3 space-y-1">
                        {getDisplayedPages().map(page => (
                          <label key={page.id} className="flex items-center gap-2 text-sm py-1">
                            <input
                              type="checkbox"
                              checked={selectedPages.includes(page.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPages([...selectedPages, page.id]);
                                } else {
                                  setSelectedPages(selectedPages.filter(id => id !== page.id));
                                }
                              }}
                              className="rounded text-blue-600"
                            />
                            <span className="text-gray-700">{page.title}</span>
                          </label>
                        ))}
                        {getDisplayedPages().length === 0 && (
                          <p className="text-sm text-gray-500 py-2">No pages found</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <button
                          onClick={() => {
                            const displayedPageIds = getDisplayedPages().map(p => p.id);
                            setSelectedPages(displayedPageIds);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleAddSelectedPages}
                          disabled={selectedPages.length === 0}
                          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add to Menu
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Posts Panel */}
                <div className="border border-gray-300 rounded">
                  <button
                    onClick={() => togglePanel('posts')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900">Posts</span>
                    {expandedPanels.posts ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedPanels.posts && (
                    <div className="p-3 bg-white">
                      {/* View Tabs */}
                      <div className="flex gap-3 mb-3 text-sm">
                        <button
                          onClick={() => setPanelViews(prev => ({ ...prev, posts: 'most-recent' }))}
                          className={`${panelViews.posts === 'most-recent' ? 'text-gray-900 font-medium' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          Most Recent
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          onClick={() => setPanelViews(prev => ({ ...prev, posts: 'view-all' }))}
                          className={`${panelViews.posts === 'view-all' ? 'text-gray-900 font-medium' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          View All
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          onClick={() => setPanelViews(prev => ({ ...prev, posts: 'search' }))}
                          className={`${panelViews.posts === 'search' ? 'text-gray-900 font-medium' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          Search
                        </button>
                      </div>

                      {/* Search Input */}
                      {panelViews.posts === 'search' && (
                        <div className="mb-3">
                          <input
                            type="text"
                            value={searchTerms.posts || ''}
                            onChange={(e) => setSearchTerms(prev => ({ ...prev, posts: e.target.value }))}
                            placeholder="Search posts..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Posts List */}
                      <div className="max-h-48 overflow-y-auto mb-3 space-y-1">
                        {getDisplayedPosts().map(post => (
                          <label key={post.id} className="flex items-center gap-2 text-sm py-1">
                            <input
                              type="checkbox"
                              checked={selectedPosts.includes(post.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPosts([...selectedPosts, post.id]);
                                } else {
                                  setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                                }
                              }}
                              className="rounded text-blue-600"
                            />
                            <span className="text-gray-700">{post.title}</span>
                          </label>
                        ))}
                        {getDisplayedPosts().length === 0 && (
                          <p className="text-sm text-gray-500 py-2">No posts found</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <button
                          onClick={() => {
                            const displayedPostIds = getDisplayedPosts().map(p => p.id);
                            setSelectedPosts(displayedPostIds);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleAddSelectedPosts}
                          disabled={selectedPosts.length === 0}
                          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add to Menu
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Products Panel */}
                <div className="border border-gray-300 rounded">
                  <button
                    onClick={() => togglePanel('products')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900">Products</span>
                    {expandedPanels.products ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedPanels.products && (
                    <div className="p-3 bg-white">
                      {/* View Tabs */}
                      <div className="flex gap-3 mb-3 text-sm">
                        <button
                          onClick={() => setPanelViews(prev => ({ ...prev, products: 'most-recent' }))}
                          className={`${panelViews.products === 'most-recent' ? 'text-gray-900 font-medium' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          Most Recent
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          onClick={() => setPanelViews(prev => ({ ...prev, products: 'view-all' }))}
                          className={`${panelViews.products === 'view-all' ? 'text-gray-900 font-medium' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          View All
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          onClick={() => setPanelViews(prev => ({ ...prev, products: 'search' }))}
                          className={`${panelViews.products === 'search' ? 'text-gray-900 font-medium' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          Search
                        </button>
                      </div>

                      {/* Search Input */}
                      {panelViews.products === 'search' && (
                        <div className="mb-3">
                          <input
                            type="text"
                            value={searchTerms.products || ''}
                            onChange={(e) => setSearchTerms(prev => ({ ...prev, products: e.target.value }))}
                            placeholder="Search products..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Products List */}
                      <div className="max-h-48 overflow-y-auto mb-3 space-y-1">
                        {getDisplayedProducts().map(product => (
                          <label key={product.id} className="flex items-center gap-2 text-sm py-1">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProducts([...selectedProducts, product.id]);
                                } else {
                                  setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                }
                              }}
                              className="rounded text-blue-600"
                            />
                            <span className="text-gray-700">{product.name}</span>
                          </label>
                        ))}
                        {getDisplayedProducts().length === 0 && (
                          <p className="text-sm text-gray-500 py-2">No products found</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <button
                          onClick={() => {
                            const displayedProductIds = getDisplayedProducts().map(p => p.id);
                            setSelectedProducts(displayedProductIds);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleAddSelectedProducts}
                          disabled={selectedProducts.length === 0}
                          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add to Menu
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Links Panel */}
                <div className="border border-gray-300 rounded">
                  <button
                    onClick={() => togglePanel('custom-links')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900">Custom Links</span>
                    {expandedPanels['custom-links'] ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedPanels['custom-links'] && (
                    <div className="p-3 bg-white space-y-3">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">URL</label>
                        <input
                          type="text"
                          value={customLinkUrl}
                          onChange={(e) => setCustomLinkUrl(e.target.value)}
                          placeholder="https://"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Link Text</label>
                        <input
                          type="text"
                          value={customLinkLabel}
                          onChange={(e) => setCustomLinkLabel(e.target.value)}
                          placeholder="Menu Item"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex justify-end pt-2 border-t border-gray-200">
                        <button
                          onClick={handleAddCustomLink}
                          disabled={!customLinkUrl.trim() || !customLinkLabel.trim()}
                          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add to Menu
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories Panel - Placeholder */}
                <div className="border border-gray-300 rounded">
                  <button
                    onClick={() => togglePanel('categories')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-gray-900">Categories</span>
                    {expandedPanels.categories ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedPanels.categories && (
                    <div className="p-3 bg-white">
                      <p className="text-sm text-gray-500">Categories coming soon</p>
                    </div>
                  )}
                </div>

                {/* Plugin Panels - Dynamic from active plugins */}
                {pluginPanels.map((panel) => (
                  <div key={panel.id} className="border border-gray-300 rounded">
                    <button
                      onClick={() => togglePanel(panel.id)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{panel.title}</span>
                      {expandedPanels[panel.id] ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedPanels[panel.id] && (
                      <div className="p-3 bg-white">
                        {panel.description && (
                          <p className="text-xs text-gray-500 mb-3">{panel.description}</p>
                        )}
                        <div className="max-h-48 overflow-y-auto mb-3 space-y-1">
                          {panel.items && panel.items.length > 0 ? (
                            panel.items.map((item: any) => (
                              <label key={item.id} className="flex items-center gap-2 text-sm py-1">
                                <input
                                  type="checkbox"
                                  className="rounded text-blue-600"
                                  onChange={(e) => {
                                    if (e.target.checked && editingMenu) {
                                      const newItem: MenuItem = {
                                        id: `item_${Date.now()}_${Math.random()}`,
                                        label: item.label,
                                        url: item.url,
                                        target: '_self',
                                        order: editingMenu.items.length,
                                      };
                                      setEditingMenu({
                                        ...editingMenu,
                                        items: [...editingMenu.items, newItem],
                                      });
                                    }
                                  }}
                                />
                                <span className="text-gray-700">{item.label}</span>
                              </label>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No items available</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Right Content - Menu Structure */}
              <div className="col-span-8">
                <div className="border border-gray-300 rounded">
                  <div className="p-4 bg-gray-50 border-b border-gray-300">
                    <h3 className="text-base font-semibold text-gray-900">Menu structure</h3>
                  </div>

                  <div className="p-4">
                    {/* Menu Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Menu Name</label>
                      <input
                        type="text"
                        value={editingMenu.name}
                        onChange={(e) => setEditingMenu({ ...editingMenu, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Instructions */}
                    <p className="text-sm text-gray-600 mb-4">
                      Drag the items into the order you prefer. Click the arrow on the right of the item to reveal additional configuration options.
                    </p>

                    {/* Bulk Select */}
                    <div className="mb-3">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" className="rounded" />
                        Bulk Select
                      </label>
                    </div>

                    {/* Menu Items */}
                    {editingMenu.items.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded">
                        <p>Add menu items from the column on the left.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 mb-6">
                        {editingMenu.items
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((item) => {
                            const isExpanded = expandedItems.has(item.id);
                            return (
                              <div
                                key={item.id}
                                className={`bg-white border border-gray-300 rounded ${
                                  draggedItem === item.id ? 'opacity-50' : ''
                                }`}
                              >
                                {/* Item Header */}
                                <div
                                  draggable
                                  onDragStart={() => handleDragStart(item.id)}
                                  onDragOver={(e) => handleDragOver(e, item.id)}
                                  onDragEnd={handleDragEnd}
                                  className="flex items-center gap-3 p-3 cursor-move hover:bg-gray-50 transition-colors"
                                >
                                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{item.label}</div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedItems);
                                      if (isExpanded) {
                                        newExpanded.delete(item.id);
                                      } else {
                                        newExpanded.add(item.id);
                                      }
                                      setExpandedItems(newExpanded);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-5 h-5" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5" />
                                    )}
                                  </button>
                                </div>

                                {/* Expanded Item Details - WordPress Style */}
                                {isExpanded && (
                                  <div className="px-3 pb-3 border-t border-gray-200 bg-gray-50">
                                    <div className="pt-3 space-y-3">
                                      {/* Navigation Label */}
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Navigation Label
                                        </label>
                                        <input
                                          type="text"
                                          value={item.label}
                                          onChange={(e) => {
                                            const updated = editingMenu.items.map(i =>
                                              i.id === item.id ? { ...i, label: e.target.value } : i
                                            );
                                            setEditingMenu({ ...editingMenu, items: updated });
                                          }}
                                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                      </div>

                                      {/* Title Attribute */}
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Title Attribute
                                        </label>
                                        <input
                                          type="text"
                                          value={item.title || ''}
                                          onChange={(e) => {
                                            const updated = editingMenu.items.map(i =>
                                              i.id === item.id ? { ...i, title: e.target.value } : i
                                            );
                                            setEditingMenu({ ...editingMenu, items: updated });
                                          }}
                                          placeholder="Optional tooltip text"
                                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                      </div>

                                      {/* Open in new tab */}
                                      <div>
                                        <label className="flex items-center gap-2 text-sm">
                                          <input
                                            type="checkbox"
                                            checked={item.target === '_blank'}
                                            onChange={(e) => {
                                              const updated = editingMenu.items.map(i =>
                                                i.id === item.id ? { ...i, target: e.target.checked ? '_blank' : '_self' } : i
                                              );
                                              setEditingMenu({ ...editingMenu, items: updated });
                                            }}
                                            className="rounded"
                                          />
                                          <span className="text-gray-700">Open link in a new tab</span>
                                        </label>
                                      </div>

                                      {/* CSS Classes */}
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          CSS Classes (optional)
                                        </label>
                                        <input
                                          type="text"
                                          value={item.cssClass || ''}
                                          onChange={(e) => {
                                            const updated = editingMenu.items.map(i =>
                                              i.id === item.id ? { ...i, cssClass: e.target.value } : i
                                            );
                                            setEditingMenu({ ...editingMenu, items: updated });
                                          }}
                                          placeholder="menu-item-class"
                                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                      </div>

                                      {/* Link Relationship (XFN) */}
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Link Relationship (XFN)
                                        </label>
                                        <input
                                          type="text"
                                          value={item.xfn || ''}
                                          onChange={(e) => {
                                            const updated = editingMenu.items.map(i =>
                                              i.id === item.id ? { ...i, xfn: e.target.value } : i
                                            );
                                            setEditingMenu({ ...editingMenu, items: updated });
                                          }}
                                          placeholder="e.g., friend"
                                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                      </div>

                                      {/* Plugin Custom Fields */}
                                      {item.pluginSlug && item.customFields && (
                                        <div className="pt-3 border-t border-gray-300">
                                          <h4 className="text-xs font-semibold text-gray-700 mb-2">
                                            {item.pluginSlug} Options
                                          </h4>
                                          {Object.entries(item.customFields).map(([key, value]) => (
                                            <div key={key} className="mb-2">
                                              <label className="block text-xs text-gray-600 mb-1">
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                              </label>
                                              <input
                                                type="text"
                                                value={String(value)}
                                                onChange={(e) => {
                                                  const updated = editingMenu.items.map(i =>
                                                    i.id === item.id
                                                      ? { ...i, customFields: { ...i.customFields, [key]: e.target.value } }
                                                      : i
                                                  );
                                                  setEditingMenu({ ...editingMenu, items: updated });
                                                }}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Actions */}
                                      <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                                        <button
                                          onClick={() => handleDeleteItem(item.id)}
                                          className="text-sm text-red-600 hover:text-red-700"
                                        >
                                          Remove
                                        </button>
                                        <button
                                          onClick={() => {
                                            const newExpanded = new Set(expandedItems);
                                            newExpanded.delete(item.id);
                                            setExpandedItems(newExpanded);
                                          }}
                                          className="text-sm text-gray-600 hover:text-gray-700"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Menu Settings */}
                    <div className="pt-6 border-t border-gray-300">
                      <h4 className="text-base font-semibold text-gray-900 mb-4">Menu Settings</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={autoAddPages}
                              onChange={(e) => setAutoAddPages(e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-gray-700">Automatically add new top-level pages to this menu</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Display location</label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={editingMenu.location === 'primary'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditingMenu({ ...editingMenu, location: 'primary' });
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-gray-700">Primary Menu</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={editingMenu.location === 'footer'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditingMenu({ ...editingMenu, location: 'footer' });
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-gray-700">Secondary Menu</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-300">
                      <button
                        onClick={handleSaveMenu}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                      >
                        Save Menu
                      </button>
                      <button
                        onClick={handleDeleteMenu}
                        className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete Menu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manage Locations Tab */}
      {activeTab === 'locations' && (
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Theme locations</h3>
            <p className="text-sm text-gray-600">
              Your theme supports the following menu locations. Select which menu you would like to use.
            </p>
          </div>

          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">Assigned Menu</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="px-4 py-3 text-sm text-gray-900">Primary Menu</td>
                <td className="px-4 py-3">
                  <select className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">— Select a Menu —</option>
                    {menus.map(menu => (
                      <option key={menu.id} value={menu.id} selected={menu.location === 'primary'}>
                        {menu.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="px-4 py-3 text-sm text-gray-900">Footer Menu</td>
                <td className="px-4 py-3">
                  <select className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">— Select a Menu —</option>
                    {menus.map(menu => (
                      <option key={menu.id} value={menu.id} selected={menu.location === 'footer'}>
                        {menu.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">Mobile Menu</td>
                <td className="px-4 py-3">
                  <select className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">— Select a Menu —</option>
                    {menus.map(menu => (
                      <option key={menu.id} value={menu.id} selected={menu.location === 'mobile'}>
                        {menu.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Create Menu Modal */}
      {showCreateMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Menu</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Name
                </label>
                <input
                  type="text"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateNewMenu();
                    }
                  }}
                  placeholder="e.g., Main Navigation"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateMenuModal(false);
                    setNewMenuName('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewMenu}
                  disabled={!newMenuName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppearanceMenus;
