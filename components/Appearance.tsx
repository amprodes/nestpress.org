import React, { useState, useEffect } from 'react';
import { Plus, Eye, Check, Palette, Search, ExternalLink, Upload, FolderOpen, FileCode, Trash2 } from 'lucide-react';
import { useCMS } from '../contexts/CMSContext';
import { ViewState, Theme } from '../types';
import { themesApi } from '../services/api';
import { useModal } from './Modal';
import { DataCard, DataCardHeader, DataCardBody, DataCardHover } from './common/DataCard';

// ============================================
// WordPress-like Appearance Management
// Themes contain templates - no separate templates tab
// ============================================

interface ThemeTemplateInfo {
  name: string;
  file: string;
  type: 'index' | 'single' | 'page' | 'archive' | 'category' | 'search' | '404';
  description: string;
}

interface InstalledTheme {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  thumbnail: string;
  templates: ThemeTemplateInfo[];
  isActive: boolean;
}

// Theme Card Component
const ThemeCard: React.FC<{
  theme: InstalledTheme;
  isActive: boolean;
  onPreview: () => void;
  onActivate: () => void;
  onViewTemplates: () => void;
  onDelete: () => void;
}> = ({ theme, isActive, onPreview, onActivate, onViewTemplates, onDelete }) => {
  return (
    <DataCardHover className="">
      {/* Theme Screenshot */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 border-b border-gray-300">
        <img 
          src={theme.thumbnail} 
          alt={theme.name}
          className="w-full h-full object-cover"
        />
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
          <button 
            onClick={onActivate}
            className="w-full max-w-[140px] px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Activate
          </button>
          <button 
            onClick={onPreview}
            className="w-full max-w-[140px] px-4 py-2 bg-white text-gray-900 text-sm hover:bg-gray-100 transition-colors"
          >
            Live Preview
          </button>
        </div>
      </div>
      
      {/* Theme Info */}
      <div className="p-4">
        <h3 className="font-semibold text-base text-gray-900 mb-1">{theme.name}</h3>
        <p className="text-sm text-gray-600 mb-2">By {theme.author}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <button 
            onClick={onViewTemplates}
            className="hover:text-blue-600 hover:underline"
          >
            Theme Details
          </button>
          {theme.id !== 'default' && (
            <button 
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </DataCardHover>
  );
};

const Appearance: React.FC = () => {
  const { 
    themes, 
    activeThemeId, 
    setActiveTheme, 
    setPreviewThemeId, 
    setCurrentView,
  } = useCMS();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [installedThemes, setInstalledThemes] = useState<InstalledTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<InstalledTheme | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGeneratedThemes, setShowGeneratedThemes] = useState(false);
  const [generatedThemes, setGeneratedThemes] = useState<any[]>([]);
  const [loadingGenerated, setLoadingGenerated] = useState(false);
  
  const activeTheme = themes?.find(t => t.id === activeThemeId);
  
  // Fetch installed themes from the /themes folder via API
  const fetchInstalledThemes = async () => {
    try {
      setLoading(true);
      // Force rescan to pick up newly generated themes
      const themesArray = await themesApi.rescan();
      setInstalledThemes(themesArray.map((t: any) => ({
          ...t,
          isActive: t.id === activeThemeId
        })));
    } catch (error) {
      console.error('Failed to fetch themes:', error);
        // Fallback to scanning /themes folder structure
        setInstalledThemes([{
          id: 'default',
          name: 'NestPress Default',
          version: '1.0.0',
          author: 'NestPress Team',
          description: 'The default NestPress theme with WordPress-like template hierarchy',
          thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format',
          templates: [
            { name: 'Index', file: 'index.tsx', type: 'index', description: 'Homepage / Front Page template' },
            { name: 'Single', file: 'single.tsx', type: 'single', description: 'Single post template' },
            { name: 'Page', file: 'page.tsx', type: 'page', description: 'Static page template' },
            { name: 'Archive', file: 'archive.tsx', type: 'archive', description: 'Blog archive / listing' },
            { name: 'Category', file: 'category.tsx', type: 'category', description: 'Category archive template' },
            { name: 'Search', file: 'search.tsx', type: 'search', description: 'Search results template' },
            { name: '404', file: '404.tsx', type: '404', description: 'Not found error page' },
          ],
          isActive: activeThemeId === 'default' || activeThemeId === 'developer',
        }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstalledThemes();
  }, [activeThemeId]);
  
  const filteredThemes = installedThemes.filter(theme => 
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handlePreview = (themeId: string) => {
    setPreviewThemeId(themeId);
    setCurrentView(ViewState.THEME_PREVIEW);
  };
  
  const handleActivate = async (themeId: string) => {
    try {
      // Activate theme via API (uses authenticated request)
      await themesApi.activate(themeId);
      setActiveTheme(themeId);
      // Update local state
      setInstalledThemes(prev => prev.map(t => ({
        ...t,
        isActive: t.id === themeId
      })));
    } catch (error) {
      console.error('Failed to activate theme:', error);
      // Fallback - just update locally
      setActiveTheme(themeId);
    }
  };

  const handleUploadTheme = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      await alert({
        title: 'Invalid File',
        message: 'Please upload a ZIP file containing the theme',
        variant: 'warning'
      });
      return;
    }

    setIsUploading(true);
    try {
      const newTheme = await themesApi.upload(file);
      // API returns theme with templates included
      setInstalledThemes(prev => [...prev, { ...(newTheme as any), isActive: false }]);
      await alert({
        title: 'Success',
        message: `Theme "${newTheme.name}" installed successfully!`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to upload theme:', error);
      await alert({
        title: 'Error',
        message: 'Failed to upload theme. Make sure the backend is running and you are logged in.',
        variant: 'error'
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const { confirm, alert } = useModal();

  const handleShowGeneratedThemes = async () => {
    setShowGeneratedThemes(true);
    setLoadingGenerated(true);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      const response = await fetch(`${API_BASE_URL}/plugins/ai-theme-factory/themes`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch generated themes');
      }
      
      const data = await response.json();
      setGeneratedThemes(data.data || []);
    } catch (error) {
      console.error('Failed to fetch generated themes:', error);
      setGeneratedThemes([]);
    } finally {
      setLoadingGenerated(false);
    }
  };

  const handleInstallGeneratedTheme = async (slug: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      
      // Download from the plugin's download endpoint
      const downloadUrl = `${API_BASE_URL}/plugins/ai-theme-factory/download/${slug}`;
      const downloadResponse = await fetch(downloadUrl);
      
      if (!downloadResponse.ok) {
        throw new Error('Failed to download theme');
      }
      
      const blob = await downloadResponse.blob();
      const file = new File([blob], `${slug}.zip`, { type: 'application/zip' });
      
      // Upload it via the theme-manager API
      const formData = new FormData();
      formData.append('theme', file);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/theme-manager/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('nestpress_access_token')}`
        },
        body: formData
      });
      
      const data = await uploadResponse.json();
      
      if (data.success || uploadResponse.ok) {
        await alert({
          title: 'Success',
          message: `Theme "${slug}" installed successfully!`,
          variant: 'success'
        });
        setShowGeneratedThemes(false);
        // Refetch themes instead of reloading page
        await fetchInstalledThemes();
      } else {
        await alert({
          title: 'Error',
          message: data.message || 'Installation failed',
          variant: 'error'
        });
      }
    } catch (error: any) {
      await alert({
        title: 'Error',
        message: `Installation failed: ${error.message}`,
        variant: 'error'
      });
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (themeId === 'default') {
      await alert({
        title: 'Cannot Delete',
        message: 'Cannot delete the default theme',
        variant: 'warning'
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Theme',
      message: 'Are you sure you want to delete this theme?',
      confirmText: 'Delete',
      variant: 'warning'
    });
    if (!confirmed) {
      return;
    }

    try {
      await themesApi.delete(themeId);
      setInstalledThemes(prev => prev.filter(t => t.id !== themeId));
      if (selectedTheme?.id === themeId) {
        setSelectedTheme(null);
      }
    } catch (error) {
      console.error('Failed to delete theme:', error);
      await alert({
        title: 'Error',
        message: 'Failed to delete theme. Make sure you are logged in.',
        variant: 'error'
      });
    }
  };

  // Template type icon mapping
  const getTemplateIcon = (type: string) => {
    const icons: Record<string, string> = {
      index: '🏠',
      single: '📄',
      page: '📃',
      archive: '📚',
      category: '🏷️',
      search: '🔍',
      '404': '❌',
    };
    return icons[type] || '📄';
  };

  const renderThemesTab = () => {
    const activeTheme = installedThemes.find(t => t.isActive);
    
    return (
    <div className="space-y-6">
      {/* Current Theme - WordPress style */}
      {activeTheme && (
        <DataCard>
          <DataCardHeader>Current Theme</DataCardHeader>
          <DataCardBody>
            <div className="flex gap-6">
              <div className="w-80 flex-shrink-0">
                <img 
                  src={activeTheme.thumbnail} 
                  alt={activeTheme.name}
                  className="w-full border border-gray-300 shadow-sm"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-normal text-gray-900 mb-2">
                  {activeTheme.name}
                </h2>
                <p className="text-gray-600 mb-3">
                  {activeTheme.description}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  By {activeTheme.author} | Version {activeTheme.version}
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedTheme(activeTheme)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors border border-blue-600"
                  >
                    Customize
                  </button>
                </div>
              </div>
            </div>
          </DataCardBody>
        </DataCard>
      )}
      
      {/* Add Themes Section - WordPress style */}
      <DataCard>
        <DataCardHeader actions={
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleShowGeneratedThemes}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm hover:bg-purple-700 transition-colors"
            >
              🤖 Install from AI Factory
            </button>
            <label className={`flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
              <Upload size={14} />
              {isUploading ? 'Uploading...' : 'Upload Theme'}
              <input
                type="file"
                accept=".zip"
                onChange={handleUploadTheme}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </>
        }>
          Available Themes
        </DataCardHeader>

        {/* Themes Grid */}
        <DataCardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThemes.filter(t => !t.isActive).map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={theme.isActive}
                onPreview={() => handlePreview(theme.id)}
                onActivate={() => handleActivate(theme.id)}
                onViewTemplates={() => setSelectedTheme(theme)}
                onDelete={() => handleDeleteTheme(theme.id)}
              />
            ))}
          </div>
          {filteredThemes.filter(t => !t.isActive).length === 0 && (
            <p className="text-center text-gray-500 py-8">No themes found matching your search.</p>
          )}
        </DataCardBody>
      </DataCard>

      {/* Theme Details Modal */}
      {selectedTheme && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{selectedTheme.name}</h3>
                <button
                  onClick={() => setSelectedTheme(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{selectedTheme.description}</p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FileCode size={16} />
                Templates in /themes/{selectedTheme.id}/templates/
              </h4>
              <div className="space-y-3">
                {(selectedTheme.templates || []).map(template => (
                  <div 
                    key={template.file}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTemplateIcon(template.type)}</span>
                      <div>
                        <h5 className="font-medium text-gray-900">{template.name}</h5>
                        <p className="text-sm text-gray-500">{template.description}</p>
                        <code className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                          {template.file}
                        </code>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400 uppercase">{template.type}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>WordPress-like behavior:</strong> Templates are automatically selected based on the URL:
                </p>
                <ul className="text-sm text-amber-700 mt-2 space-y-1">
                  <li>• <code>/</code> → index.tsx (front page)</li>
                  <li>• <code>/blog/post-slug</code> → single.tsx</li>
                  <li>• <code>/about</code> → page.tsx</li>
                  <li>• <code>/blog</code> → archive.tsx</li>
                  <li>• <code>/category/news</code> → category.tsx</li>
                  <li>• <code>/search?q=...</code> → search.tsx</li>
                  <li>• Not found → 404.tsx</li>
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTheme(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
              {!selectedTheme.isActive && (
                <button
                  onClick={() => {
                    handleActivate(selectedTheme.id);
                    setSelectedTheme(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Activate Theme
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated Themes Install Modal */}
      {showGeneratedThemes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">🤖 Install from AI Theme Factory</h3>
                <button
                  onClick={() => setShowGeneratedThemes(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Select a generated theme to install to your /themes directory</p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingGenerated ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Loading generated themes...</p>
                </div>
              ) : generatedThemes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No generated themes available</p>
                  <p className="text-sm text-gray-400">Generate themes using Appearance → AI Theme Factory</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedThemes.map((theme: any) => (
                    <div key={theme.slug} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <h4 className="font-semibold text-gray-900 mb-2">{theme.themeName || theme.slug}</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Generated from: <span className="text-blue-600">{theme.targetUrl || 'Unknown'}</span>
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Size: {((theme.fileSize || 0) / 1024).toFixed(1)} KB</span>
                        <span>Files: {theme.totalFiles || 0}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInstallGeneratedTheme(theme.slug)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors rounded"
                        >
                          🚀 Install
                        </button>
                        <a
                          href={`${import.meta.env.VITE_API_URL}/plugins/ai-theme-factory/download/${theme.slug}`}
                          download
                          className="px-4 py-2 bg-green-600 text-white text-sm hover:bg-green-700 transition-colors rounded"
                        >
                          📥
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
  };
  
  return renderThemesTab();
};

export default Appearance;
