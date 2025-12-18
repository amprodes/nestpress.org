import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';
import { HeaderSettings } from '../../types';
import { useModal } from '../Modal';
import { tokenManager } from '../../services/api';
import { DataCard, DataCardHeader, DataCardBody } from '../common/DataCard';

const API_BASE = 'http://localhost:4000/api/v1';

const AppearanceHeader: React.FC = () => {
  const [settings, setSettings] = useState<HeaderSettings>({
    logoText: 'NestPress',
    tagline: 'A Modern CMS',
    showTagline: true,
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    height: 80,
    sticky: true,
    transparent: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/appearance/header`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch header settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const { alert } = useModal();

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = tokenManager.getAccessToken();
      await fetch(`${API_BASE}/appearance/header`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings),
      });
      await alert({
        title: 'Success',
        message: 'Header settings saved!',
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      await alert({
        title: 'Error',
        message: 'Failed to save settings',
        variant: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading header settings...</div>;
  }

  return (
    <div className="max-w-4xl">
      <DataCard>
        <DataCardHeader actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        }>
          Header Settings
        </DataCardHeader>

        <DataCardBody className="space-y-6">
        {/* Logo & Branding */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Logo & Branding</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Text</label>
            <input
              type="text"
              value={settings.logoText || ''}
              onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
            <input
              type="text"
              value={settings.tagline || ''}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.showTagline}
              onChange={(e) => setSettings({ ...settings, showTagline: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show tagline</span>
          </label>
        </div>

        {/* Colors */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Colors</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Layout</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
            <input
              type="number"
              value={settings.height}
              onChange={(e) => setSettings({ ...settings, height: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="60"
              max="200"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.sticky}
              onChange={(e) => setSettings({ ...settings, sticky: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Sticky header (stays visible on scroll)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.transparent}
              onChange={(e) => setSettings({ ...settings, transparent: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Transparent background on homepage</span>
          </label>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Preview</h4>
          <div
            className="border border-gray-200 rounded overflow-hidden"
            style={{
              backgroundColor: settings.backgroundColor,
              color: settings.textColor,
              height: `${settings.height}px`,
            }}
          >
            <div className="h-full flex items-center justify-between px-6">
              <div>
                <div className="font-bold text-xl">{settings.logoText}</div>
                {settings.showTagline && (
                  <div className="text-sm opacity-75">{settings.tagline}</div>
                )}
              </div>
              <div className="flex gap-4 text-sm">
                <span>Home</span>
                <span>Blog</span>
                <span>About</span>
                <span>Contact</span>
              </div>
            </div>
          </div>
        </div>
        </DataCardBody>
      </DataCard>
    </div>
  );
};

export default AppearanceHeader;
