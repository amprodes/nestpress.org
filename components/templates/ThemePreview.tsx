import React from 'react';
import { X, Check, ExternalLink, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useCMS } from '../../contexts/CMSContext';
import { ViewState } from '../../types';
import WebsiteFrontend from './WebsiteFrontend';

const ThemePreview: React.FC = () => {
  const { 
    themes, 
    previewThemeId, 
    setPreviewThemeId, 
    activeThemeId, 
    setActiveTheme,
    setCurrentView 
  } = useCMS();
  
  const [viewport, setViewport] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Use previewThemeId, activeThemeId, or first theme as fallback
  const effectiveThemeId = previewThemeId || activeThemeId || themes[0]?.id;
  const previewTheme = themes.find(t => t.id === effectiveThemeId) || themes[0];
  const isCurrentlyActive = effectiveThemeId === activeThemeId;
  
  const handleActivate = () => {
    if (effectiveThemeId) {
      setActiveTheme(effectiveThemeId);
    }
  };
  
  const handleClose = () => {
    setPreviewThemeId(null);
    setCurrentView(ViewState.DASHBOARD);
  };
  
  const getViewportClass = () => {
    switch (viewport) {
      case 'tablet':
        return 'max-w-[768px]';
      case 'mobile':
        return 'max-w-[375px]';
      default:
        return 'w-full';
    }
  };
  
  // If no themes loaded yet, show loading
  if (themes.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading themes...</p>
        </div>
      </div>
    );
  }
  
  if (!previewTheme) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">No theme available for preview</p>
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Preview Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <div>
            <h2 className="text-white font-medium">{previewTheme.name}</h2>
            <p className="text-gray-400 text-sm">
              {isCurrentlyActive ? 'Currently Active' : 'Preview Mode'}
            </p>
          </div>
        </div>
        
        {/* Viewport Toggles */}
        <div className="flex items-center bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-2 rounded-md transition-colors ${
              viewport === 'desktop' 
                ? 'bg-gray-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Desktop"
          >
            <Monitor size={18} />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-2 rounded-md transition-colors ${
              viewport === 'tablet' 
                ? 'bg-gray-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Tablet"
          >
            <Tablet size={18} />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-2 rounded-md transition-colors ${
              viewport === 'mobile' 
                ? 'bg-gray-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="Mobile"
          >
            <Smartphone size={18} />
          </button>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
          >
            <ExternalLink size={16} />
            <span>Open in New Tab</span>
          </button>
          
          {!isCurrentlyActive && (
            <button
              onClick={handleActivate}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Check size={16} />
              <span>Activate Theme</span>
            </button>
          )}
        </div>
      </header>
      
      {/* Preview Frame */}
      <div className="flex-1 overflow-hidden bg-gray-900 p-4">
        <div 
          className={`mx-auto h-full overflow-auto bg-white rounded-lg shadow-2xl transition-all duration-300 ${getViewportClass()}`}
        >
          <WebsiteFrontend themeId={effectiveThemeId} isPreview={true} />
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
