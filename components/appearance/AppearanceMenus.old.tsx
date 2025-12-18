import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, Trash2, Save, Edit2, X, ExternalLink, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { Menu, MenuItem } from '../../types';
import { useCMS } from '../../contexts/CMSContext';
import { useModal } from '../Modal';

const AppearanceMenus: React.FC = () => {
  const { menus, addMenu, updateMenu, deleteMenu, apiStatus, posts, pages } = useCMS();
  const { confirm, alert } = useModal();
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // New menu form state
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuLocation, setNewMenuLocation] = useState<'primary' | 'footer' | 'mobile' | 'custom'>('primary');

  // New item form state
  const [itemLabel, setItemLabel] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [itemTarget, setItemTarget] = useState<'_self' | '_blank'>('_self');
  const [itemIcon, setItemIcon] = useState('');

  // WordPress-like accordion panels
  const [expandedPanel, setExpandedPanel] = useState<string | null>('pages');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [customLinkLabel, setCustomLinkLabel] = useState('');
  const [customLinkUrl, setCustomLinkUrl] = useState('');

  useEffect(() => {
    if (menus.length > 0 && !selectedMenu) {
      setSelectedMenu(menus[0]);
      setEditingMenu(JSON.parse(JSON.stringify(menus[0])));
    }
  }, [menus, selectedMenu]);

  const handleCreateMenu = async () => {
    if (!newMenuName.trim()) return;

    const slug = newMenuName.toLowerCase().replace(/\s+/g, '-');
    const newMenu: Menu = {
      id: `menu_${Date.now()}`,
      name: newMenuName,
      slug,
      location: newMenuLocation,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await addMenu(newMenu);
      setSelectedMenu(newMenu);
      setEditingMenu(JSON.parse(JSON.stringify(newMenu)));
      setShowCreateDialog(false);
      setNewMenuName('');
      setNewMenuLocation('primary');
    } catch (error) {
      console.error('Failed to create menu:', error);
      await alert({
        title: 'Error',
        message: 'Failed to create menu. Please try again.',
        variant: 'error'
      });
    }
  };

  const handleSaveMenu = async () => {
    if (!editingMenu) return;

    try {
      await updateMenu(editingMenu);
      setSelectedMenu(editingMenu);
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

  const handleDeleteMenu = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Menu',
      message: 'Are you sure you want to delete this menu?',
      confirmText: 'Delete',
      variant: 'warning'
    });
    if (!confirmed) return;

    try {
      await deleteMenu(id);
      if (selectedMenu?.id === id) {
        setSelectedMenu(menus[0] || null);
        setEditingMenu(menus[0] ? JSON.parse(JSON.stringify(menus[0])) : null);
      }
    } catch (error) {
      console.error('Failed to delete menu:', error);
      await alert({
        title: 'Error',
        message: 'Failed to delete menu. Please try again.',
        variant: 'error'
      });
    }
  };

  const handleAddItem = () => {
    if (!editingMenu || !itemLabel.trim() || !itemUrl.trim()) return;

    const newItem: MenuItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: itemLabel,
      url: itemUrl,
      target: itemTarget,
      icon: itemIcon || undefined,
      order: editingMenu.items.length,
    };

    setEditingMenu({
      ...editingMenu,
      items: [...editingMenu.items, newItem],
    });

    // Reset form
    setItemLabel('');
    setItemUrl('');
    setItemTarget('_self');
    setItemIcon('');
    setShowItemDialog(false);
  };

  const handleUpdateItem = () => {
    if (!editingMenu || !editingItem || !itemLabel.trim() || !itemUrl.trim()) return;

    const updatedItems = editingMenu.items.map(item =>
      item.id === editingItem.id
        ? { ...item, label: itemLabel, url: itemUrl, target: itemTarget, icon: itemIcon || undefined }
        : item
    );

    setEditingMenu({
      ...editingMenu,
      items: updatedItems,
    });

    // Reset form
    setItemLabel('');
    setItemUrl('');
    setItemTarget('_self');
    setItemIcon('');
    setEditingItem(null);
    setShowItemDialog(false);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!editingMenu) return;

    setEditingMenu({
      ...editingMenu,
      items: editingMenu.items.filter(item => item.id !== itemId),
    });
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

    // Update order property
    const reordered = items.map((item, index) => ({ ...item, order: index }));

    setEditingMenu({
      ...editingMenu,
      items: reordered,
    });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const openEditItemDialog = (item: MenuItem) => {
    setEditingItem(item);
    setItemLabel(item.label);
    setItemUrl(item.url);
    setItemTarget(item.target || '_self');
    setItemIcon(item.icon || '');
    setShowItemDialog(true);
  };

  // WordPress-like panel handlers
  const handleAddSelectedPages = () => {
    if (!editingMenu || selectedPages.length === 0) return;
    
    const newItems: MenuItem[] = selectedPages.map(pageId => {
      const page = pages.find(p => p.id === pageId);
      if (!page) return null;
      
      return {
        id: `item_${Date.now()}_${Math.random()}`,
        label: page.title,
        url: `/${page.slug}`,
        target: '_self',
        order: editingMenu.items.length,
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
    
    const newItems: MenuItem[] = selectedPosts.map(postId => {
      const post = posts.find(p => p.id === postId);
      if (!post) return null;
      
      return {
        id: `item_${Date.now()}_${Math.random()}`,
        label: post.title,
        url: `/blog/${post.slug}`,
        target: '_self',
        order: editingMenu.items.length,
      };
    }).filter(Boolean) as MenuItem[];
    
    setEditingMenu({
      ...editingMenu,
      items: [...editingMenu.items, ...newItems],
    });
    setSelectedPosts([]);
  };

  const handleAddCustomLink = () => {
    if (!editingMenu || !customLinkLabel.trim() || !customLinkUrl.trim()) return;
    
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
    setCustomLinkLabel('');
    setCustomLinkUrl('');
  };

  const togglePanel = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };

  if (apiStatus !== 'connected') {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="mb-2">Menu system unavailable</p>
        <p className="text-sm">API is not connected. Please ensure the backend is running.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menus</h2>
          <p className="text-gray-600 mt-1">Manage your site navigation menus</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Menu
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Your Menus</h3>

          {menus.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No menus yet</p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Create your first menu
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className={`flex items-center justify-between px-3 py-2 rounded transition-colors ${
                    selectedMenu?.id === menu.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedMenu(menu);
                      setEditingMenu(JSON.parse(JSON.stringify(menu)));
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium">{menu.name}</div>
                    <div className="text-xs opacity-75">{menu.location} • {menu.items.length} items</div>
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(menu.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WordPress-like Item Selector Panels */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h3 className="font-semibold text-gray-900 p-4 border-b border-gray-200">Add Items</h3>
          
          {/* Pages Panel */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => togglePanel('pages')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">Pages</span>
              {expandedPanel === 'pages' ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedPanel === 'pages' && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                  {pages.filter(p => p.status === 'published').map(page => (
                    <label key={page.id} className="flex items-center gap-2 text-sm">
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
                  {pages.filter(p => p.status === 'published').length === 0 && (
                    <p className="text-sm text-gray-500">No published pages</p>
                  )}
                </div>
                <button
                  onClick={handleAddSelectedPages}
                  disabled={selectedPages.length === 0 || !editingMenu}
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Add to Menu ({selectedPages.length})
                </button>
              </div>
            )}
          </div>

          {/* Posts Panel */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => togglePanel('posts')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">Posts</span>
              {expandedPanel === 'posts' ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedPanel === 'posts' && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                  {posts.filter(p => p.status === 'published').slice(0, 10).map(post => (
                    <label key={post.id} className="flex items-center gap-2 text-sm">
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
                  {posts.filter(p => p.status === 'published').length === 0 && (
                    <p className="text-sm text-gray-500">No published posts</p>
                  )}
                </div>
                <button
                  onClick={handleAddSelectedPosts}
                  disabled={selectedPosts.length === 0 || !editingMenu}
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Add to Menu ({selectedPosts.length})
                </button>
              </div>
            )}
          </div>

          {/* Custom Links Panel */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => togglePanel('custom')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">Custom Links</span>
              {expandedPanel === 'custom' ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedPanel === 'custom' && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                  <input
                    type="text"
                    value={customLinkUrl}
                    onChange={(e) => setCustomLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Link Text</label>
                  <input
                    type="text"
                    value={customLinkLabel}
                    onChange={(e) => setCustomLinkLabel(e.target.value)}
                    placeholder="My Custom Link"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleAddCustomLink}
                  disabled={!customLinkLabel.trim() || !customLinkUrl.trim() || !editingMenu}
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Add to Menu
                </button>
              </div>
            )}
          </div>

          {/* Categories Panel - Placeholder */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => togglePanel('categories')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">Categories</span>
              {expandedPanel === 'categories' ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedPanel === 'categories' && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">Category system coming soon</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Editor */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {editingMenu ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{editingMenu.name}</h3>
                  <p className="text-sm text-gray-500">
                    Location: <span className="font-medium">{editingMenu.location}</span>
                  </p>
                </div>
                <button
                  onClick={handleSaveMenu}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  Save Menu
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Menu Items</h4>
                {editingMenu.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded">
                    <p>No menu items yet. Add your first item below.</p>
                  </div>
                ) : (
                  editingMenu.items
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item.id)}
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200 cursor-move ${
                          draggedItem === item.id ? 'opacity-50' : ''
                        }`}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {item.icon && <span>{item.icon}</span>}
                            {item.label}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            {item.url}
                            {item.target === '_blank' && <ExternalLink className="w-3 h-3" />}
                          </div>
                        </div>
                        <button
                          onClick={() => openEditItemDialog(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                )}
              </div>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setItemLabel('');
                  setItemUrl('');
                  setItemTarget('_self');
                  setItemIcon('');
                  setShowItemDialog(true);
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Add Menu Item
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Select a menu to edit or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Menu Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Menu</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Name</label>
                <input
                  type="text"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="e.g., Main Navigation"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={newMenuLocation}
                  onChange={(e) => setNewMenuLocation(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="primary">Primary (Header)</option>
                  <option value="footer">Footer</option>
                  <option value="mobile">Mobile</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewMenuName('');
                  setNewMenuLocation('primary');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMenu}
                disabled={!newMenuName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Item Dialog */}
      {showItemDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={itemLabel}
                  onChange={(e) => setItemLabel(e.target.value)}
                  placeholder="e.g., Home"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="text"
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                  placeholder="e.g., /"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (optional)</label>
                <input
                  type="text"
                  value={itemIcon}
                  onChange={(e) => setItemIcon(e.target.value)}
                  placeholder="e.g., 🏠"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <select
                  value={itemTarget}
                  onChange={(e) => setItemTarget(e.target.value as '_self' | '_blank')}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="_self">Same Window</option>
                  <option value="_blank">New Window</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowItemDialog(false);
                  setEditingItem(null);
                  setItemLabel('');
                  setItemUrl('');
                  setItemTarget('_self');
                  setItemIcon('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingItem ? handleUpdateItem : handleAddItem}
                disabled={!itemLabel.trim() || !itemUrl.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingItem ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppearanceMenus;
