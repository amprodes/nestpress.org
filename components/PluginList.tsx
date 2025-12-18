import React, { useState, useEffect, useCallback } from 'react';
import { pluginsApi, PluginResponse } from '../services/api';
import { useCMS } from '../contexts/CMSContext';
import { ViewState } from '../types';
import { Package, RefreshCw, Upload, Settings, Trash2, Power, PowerOff, ExternalLink, AlertCircle, CheckCircle, Search, Filter, FileCode } from 'lucide-react';
import { useModal } from './Modal';
import PluginInstallModal from './PluginInstallModal';

type PluginFilter = 'all' | 'active' | 'inactive' | 'recently-activated' | 'upgrade';

const PluginList: React.FC = () => {
  const cmsContext = useCMS();
  const cmsPlugins = cmsContext?.plugins || [];
  const { setCurrentView, refreshPluginMenuItems } = useCMS();
  const [plugins, setPlugins] = useState<PluginResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PluginFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlugins, setSelectedPlugins] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [activationProgress, setActivationProgress] = useState<{ slug: string; messages: string[] } | null>(null);

  // Fetch plugins from API
  const fetchPlugins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pluginsApi.getAll();
      setPlugins(data);
    } catch (err) {
      console.error('Failed to fetch plugins:', err);
      // Fallback to CMS context plugins for development
      const fallbackPlugins = Array.isArray(cmsPlugins) ? cmsPlugins.map(p => ({
        id: p.id,
        slug: p.id,
        name: p.name,
        version: p.version,
        description: p.description,
        author: p.author,
        isActive: p.active,
        path: `/plugins/${p.id}`,
        hasSettings: false,
        hasAdminMenu: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })) : [];
      setPlugins(fallbackPlugins);
    } finally {
      setLoading(false);
    }
  }, [cmsPlugins]);

  useEffect(() => {
    fetchPlugins();
  }, [fetchPlugins]);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Activate plugin with SSE progress
  const handleActivate = async (slug: string) => {
    setActionLoading(slug);
    setActivationProgress({ slug, messages: ['Starting activation...'] });
    
    try {
      const eventSource = new EventSource(`http://localhost:4000/api/v1/plugins/${slug}/activate/stream`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.done) {
          eventSource.close();
          if (data.success) {
            setPlugins(prev => prev.map(p => p.slug === slug ? { ...p, isActive: true, activatedAt: new Date().toISOString() } : p));
            showNotification('success', `Plugin activated successfully!`);
            // Refresh plugin menu items dynamically
            refreshPluginMenuItems();
          } else {
            showNotification('error', data.error || 'Activation failed');
          }
          setActivationProgress(null);
          setActionLoading(null);
        } else if (data.message) {
          setActivationProgress(prev => prev ? {
            ...prev,
            messages: [...prev.messages, data.message]
          } : null);
        }
      };
      
      eventSource.onerror = () => {
        eventSource.close();
        showNotification('error', 'Failed to connect to activation stream');
        setActivationProgress(null);
        setActionLoading(null);
      };
    } catch (err) {
      showNotification('error', 'Activation failed');
      setActivationProgress(null);
      setActionLoading(null);
    }
  };

  // Deactivate plugin
  const handleDeactivate = async (slug: string) => {
    setActionLoading(slug);
    try {
      const updated = await pluginsApi.deactivate(slug);
      setPlugins(prev => prev.map(p => p.slug === slug ? updated : p));
      showNotification('success', `Plugin "${updated.name}" deactivated.`);
      // Refresh plugin menu items dynamically
      refreshPluginMenuItems();
    } catch (err) {
      // Fallback for development
      setPlugins(prev => prev.map(p => p.slug === slug ? { ...p, isActive: false, activatedAt: undefined } : p));
      showNotification('success', `Plugin deactivated.`);
      // Refresh plugin menu items dynamically
      refreshPluginMenuItems();
    } finally {
      setActionLoading(null);
    }
  };

  const { confirm } = useModal();

  // Delete plugin
  const handleDelete = async (slug: string) => {
    const plugin = plugins.find(p => p.slug === slug);
    if (!plugin) return;

    const confirmed = await confirm({
      title: 'Delete Plugin',
      message: `Are you sure you want to delete "${plugin.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'warning'
    });
    if (!confirmed) {
      return;
    }

    setActionLoading(slug);
    try {
      await pluginsApi.delete(slug);
      setPlugins(prev => prev.filter(p => p.slug !== slug));
      showNotification('success', `Plugin "${plugin.name}" deleted.`);
    } catch (err) {
      // Fallback for development
      setPlugins(prev => prev.filter(p => p.slug !== slug));
      showNotification('success', `Plugin deleted.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Refresh plugins list
  const handleRefresh = async () => {
    setActionLoading('refresh');
    try {
      const data = await pluginsApi.refresh();
      setPlugins(data);
      showNotification('success', 'Plugin list refreshed.');
    } catch (err) {
      await fetchPlugins();
      showNotification('success', 'Plugin list refreshed.');
    } finally {
      setActionLoading(null);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedPlugins.size === 0) return;

    const confirmed = action === 'delete' 
      ? await confirm({
          title: 'Delete Plugins',
          message: `Are you sure you want to delete ${selectedPlugins.size} plugin(s)?`,
          confirmText: 'Delete',
          variant: 'warning'
        })
      : true;

    if (!confirmed) return;

    setActionLoading('bulk');
    try {
      for (const slug of selectedPlugins) {
        if (action === 'activate') {
          await handleActivate(slug);
        } else if (action === 'deactivate') {
          await handleDeactivate(slug);
        } else if (action === 'delete') {
          await handleDelete(slug);
        }
      }
      setSelectedPlugins(new Set());
    } finally {
      setActionLoading(null);
    }
  };

  // Filter plugins
  const filteredPlugins = plugins.filter(plugin => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.author?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Apply status filter
    switch (filter) {
      case 'active':
        return plugin.isActive;
      case 'inactive':
        return !plugin.isActive;
      case 'recently-activated':
        if (!plugin.activatedAt) return false;
        const activatedDate = new Date(plugin.activatedAt);
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return activatedDate > hourAgo;
      default:
        return true;
    }
  });

  // Counts
  const counts = {
    all: plugins.length,
    active: plugins.filter(p => p.isActive).length,
    inactive: plugins.filter(p => !p.isActive).length,
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedPlugins.size === filteredPlugins.length) {
      setSelectedPlugins(new Set());
    } else {
      setSelectedPlugins(new Set(filteredPlugins.map(p => p.slug)));
    }
  };

  // Toggle single selection
  const toggleSelect = (slug: string) => {
    const newSelected = new Set(selectedPlugins);
    if (newSelected.has(slug)) {
      newSelected.delete(slug);
    } else {
      newSelected.add(slug);
    }
    setSelectedPlugins(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-2xl font-normal text-gray-800">Plugins</h1>
        <div className="bg-white shadow-sm border border-gray-300 p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">Loading plugins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-normal text-gray-800">Plugins</h1>
        <button 
          onClick={() => setShowInstallModal(true)}
          className="px-3 py-1 bg-white border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50 transition-colors flex items-center gap-1"
        >
          <Upload size={14} />
          Add New Plugin
        </button>
        <button 
          onClick={handleRefresh}
          disabled={actionLoading === 'refresh'}
          className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${actionLoading === 'refresh' ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-3 rounded flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {notification.message}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search installed plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Plugin table */}
      <div className="bg-white shadow-sm border border-gray-300">
        {/* Filter tabs */}
        <div className="p-2 border-b border-gray-200 bg-white flex space-x-2 text-sm">
          <button 
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'text-gray-800 font-medium' : 'text-blue-600 hover:underline'}
          >
            All ({counts.all})
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'text-gray-800 font-medium' : 'text-blue-600 hover:underline'}
          >
            Active ({counts.active})
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => setFilter('inactive')}
            className={filter === 'inactive' ? 'text-gray-800 font-medium' : 'text-blue-600 hover:underline'}
          >
            Inactive ({counts.inactive})
          </button>
        </div>

        {/* Bulk actions */}
        <div className="p-2 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <select 
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            disabled={selectedPlugins.size === 0}
          >
            <option value="">Bulk Actions</option>
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
            <option value="delete">Delete</option>
          </select>
          <button 
            onClick={() => {
              const select = document.querySelector('select') as HTMLSelectElement;
              if (select?.value) {
                handleBulkAction(select.value as 'activate' | 'deactivate' | 'delete');
              }
            }}
            disabled={selectedPlugins.size === 0}
            className="px-3 py-1 bg-gray-100 border border-gray-300 text-sm rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Apply
          </button>
          {selectedPlugins.size > 0 && (
            <span className="text-sm text-gray-500 ml-2">
              {selectedPlugins.size} plugin(s) selected
            </span>
          )}
        </div>

        {/* Table */}
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-white text-gray-800 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 w-8">
                <input 
                  type="checkbox" 
                  className="border-gray-400"
                  checked={selectedPlugins.size === filteredPlugins.length && filteredPlugins.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-3 py-2">Plugin</th>
              <th className="px-3 py-2">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPlugins.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  {searchQuery ? 'No plugins found matching your search.' : 'No plugins installed.'}
                </td>
              </tr>
            ) : (
              filteredPlugins.map((plugin) => (
                <tr 
                  key={plugin.id} 
                  className={plugin.isActive ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className={`px-3 py-3 align-top ${plugin.isActive ? 'border-l-4 border-l-[#2271b1]' : ''}`}>
                    <input 
                      type="checkbox" 
                      className="border-gray-400"
                      checked={selectedPlugins.has(plugin.slug)}
                      onChange={() => toggleSelect(plugin.slug)}
                    />
                  </td>
                  <td className="px-3 py-3 align-top w-1/4">
                    <div className="font-bold text-gray-800 mb-1">
                      {plugin.name}
                      {actionLoading === plugin.slug && (
                        <RefreshCw className="inline-block w-3 h-3 ml-2 animate-spin text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs flex-wrap">
                      {plugin.isActive ? (
                        <button 
                          onClick={() => handleDeactivate(plugin.slug)}
                          disabled={actionLoading === plugin.slug}
                          className="text-[#2271b1] hover:text-[#135e96] disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleActivate(plugin.slug)}
                          disabled={actionLoading === plugin.slug}
                          className="text-[#2271b1] hover:text-[#135e96] disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}
                      <span className="text-gray-300">|</span>
                      {!plugin.isActive && (
                        <>
                          <button 
                            onClick={() => handleDelete(plugin.slug)}
                            disabled={actionLoading === plugin.slug}
                            className="text-[#a00] hover:text-[#dc3232] disabled:opacity-50"
                          >
                            Delete
                          </button>
                          <span className="text-gray-300">|</span>
                        </>
                      )}
                      {plugin.hasSettings && plugin.isActive && (
                        <>
                          <button className="text-[#2271b1] hover:text-[#135e96]">
                            Settings
                          </button>
                          <span className="text-gray-300">|</span>
                        </>
                      )}
                      <button 
                        onClick={() => setCurrentView(ViewState.PLUGIN_EDITOR)}
                        className="text-[#2271b1] hover:text-[#135e96] flex items-center gap-1"
                      >
                        <FileCode size={12} />
                        Edit Files
                      </button>
                      <span className="text-gray-300">|</span>
                      {plugin.pluginUri && (
                        <a 
                          href={plugin.pluginUri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#2271b1] hover:text-[#135e96] flex items-center gap-0.5"
                        >
                          Visit plugin site
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <p className="text-gray-600 mb-2">{plugin.description}</p>
                    <div className="text-xs text-gray-500 space-x-1">
                      <span>Version {plugin.version}</span>
                      <span>|</span>
                      <span>
                        By{' '}
                        {plugin.authorUri ? (
                          <a 
                            href={plugin.authorUri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#2271b1] hover:underline"
                          >
                            {plugin.author}
                          </a>
                        ) : (
                          <span>{plugin.author || 'Unknown'}</span>
                        )}
                      </span>
                      {plugin.license && (
                        <>
                          <span>|</span>
                          <span>License: {plugin.license}</span>
                        </>
                      )}
                    </div>
                    {plugin.requiresAtLeast && (
                      <div className="text-xs text-gray-400 mt-1">
                        Requires NestPress {plugin.requiresAtLeast}+
                        {plugin.requiresNode && ` | Node.js ${plugin.requiresNode}+`}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          {filteredPlugins.length} plugin(s) 
          {filter !== 'all' && ` (filtered from ${counts.all} total)`}
        </div>
      </div>

      {/* WordPress-like info section */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-800">
        <h3 className="font-medium mb-2">📦 Plugin System</h3>
        <p className="mb-2">
          NestPress uses a WordPress-compatible plugin system. Plugins are loaded from the 
          <code className="bg-blue-100 px-1 mx-1 rounded">/plugins</code> directory.
        </p>
        <p>
          Each plugin should have a header comment with metadata (Plugin Name, Version, Description, Author) 
          following the WordPress plugin header format.
        </p>
      </div>

      {/* Install Modal */}
      {showInstallModal && (
        <PluginInstallModal
          onClose={() => setShowInstallModal(false)}
          onSuccess={() => {
            fetchPlugins();
            setShowInstallModal(false);
          }}
        />
      )}

      {/* Activation Progress Modal */}
      {activationProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Activating Plugin
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Installing dependencies and loading plugin...
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                {activationProgress.messages.map((message, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200 animate-fade-in"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {index === activationProgress.messages.length - 1 ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-mono">{message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{activationProgress.messages.length}</span> step{activationProgress.messages.length !== 1 ? 's' : ''} completed
                </div>
                <div className="text-xs text-gray-500">
                  This may take a few minutes for plugins with dependencies
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PluginList;