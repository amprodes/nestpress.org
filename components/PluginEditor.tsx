import React, { useState, useEffect } from 'react';
import { Code, Save, AlertTriangle, FileCode, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { pluginsApi } from '../services/api';
import { useToast } from './Toast';
import { useModal } from './Modal';
import { DataCard, DataCardHeader, DataCardBody } from './common/DataCard';

/**
 * Plugin Editor Component
 * WordPress equivalent: wp-admin/plugin-editor.php
 * 
 * Allows editing plugin files directly in the admin interface.
 * Supports multi-file plugins with directory tree navigation.
 */

interface PluginFile {
  path: string;
  name: string;
  content?: string;
  isDirectory: boolean;
  children?: PluginFile[];
}

const PluginEditor: React.FC = () => {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileTree, setFileTree] = useState<PluginFile[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const { success, error: showError } = useToast();
  const { confirm, alert } = useModal();

  // Fetch available plugins
  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const data = await pluginsApi.getAll();
      setPlugins(data);
      if (data.length > 0 && !selectedPlugin) {
        setSelectedPlugin(data[0].slug);
      }
    } catch (err) {
      console.error('Failed to fetch plugins:', err);
    }
  };

  // Load plugin files when plugin is selected
  useEffect(() => {
    if (selectedPlugin) {
      loadPluginFiles(selectedPlugin);
    }
  }, [selectedPlugin]);

  const loadPluginFiles = async (pluginSlug: string) => {
    setLoading(true);
    try {
      const response = await pluginsApi.getFiles(pluginSlug);
      setFileTree(response.files || []);
      // Auto-select index.ts if available
      const indexFile = findIndexFile(response.files || []);
      if (indexFile) {
        setSelectedFile(indexFile.path);
        await loadFileContent(pluginSlug, indexFile.path);
      }
    } catch (err) {
      showError('Failed to load plugin files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const findIndexFile = (files: PluginFile[]): PluginFile | null => {
    for (const file of files) {
      if (file.name === 'index.ts' || file.name === 'index.tsx') {
        return file;
      }
      if (file.isDirectory && file.children) {
        const found = findIndexFile(file.children);
        if (found) return found;
      }
    }
    return null;
  };

  const loadFileContent = async (pluginSlug: string, filePath: string) => {
    setLoading(true);
    try {
      const response = await pluginsApi.getFileContent(pluginSlug, filePath);
      setFileContent(response.content);
      setOriginalContent(response.content);
      setSelectedFile(filePath);
    } catch (err) {
      showError('Failed to load file content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPlugin || !selectedFile) return;

    const confirmed = await confirm({
      title: 'Save Plugin File',
      message: 'Are you sure you want to save changes to this plugin file? This may affect site functionality if there are errors.',
      confirmText: 'Save Changes',
      variant: 'warning',
    });

    if (!confirmed) return;

    setSaving(true);
    try {
      await pluginsApi.updateFileContent(selectedPlugin, selectedFile, fileContent);
      setOriginalContent(fileContent);
      success('Plugin file saved successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save plugin file');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderFileTree = (files: PluginFile[], level = 0) => {
    return files.map(file => (
      <div key={file.path}>
        {file.isDirectory ? (
          <>
            <button
              onClick={() => toggleFolder(file.path)}
              className="flex items-center gap-2 px-3 py-1.5 w-full hover:bg-gray-50 text-sm text-gray-700"
              style={{ paddingLeft: `${(level * 16) + 12}px` }}
            >
              {expandedFolders.has(file.path) ? (
                <ChevronDown size={14} className="text-gray-400" />
              ) : (
                <ChevronRight size={14} className="text-gray-400" />
              )}
              <FolderOpen size={14} className="text-blue-500" />
              <span className="font-medium">{file.name}</span>
            </button>
            {expandedFolders.has(file.path) && file.children && (
              <div>{renderFileTree(file.children, level + 1)}</div>
            )}
          </>
        ) : (
          <button
            onClick={() => loadFileContent(selectedPlugin, file.path)}
            className={`flex items-center gap-2 px-3 py-1.5 w-full hover:bg-gray-50 text-sm ${
              selectedFile === file.path ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
            }`}
            style={{ paddingLeft: `${(level * 16) + 28}px` }}
          >
            <FileCode size={14} className="text-gray-400" />
            <span>{file.name}</span>
          </button>
        )}
      </div>
    ));
  };

  const hasUnsavedChanges = fileContent !== originalContent;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Code className="text-blue-600" size={28} />
            <h1 className="text-3xl font-semibold text-gray-900">Plugin File Editor</h1>
          </div>
          <p className="text-gray-600">
            Edit your plugin files directly from the WordPress-style admin interface.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
          <div className="text-sm text-yellow-800">
            <strong className="font-semibold">Caution:</strong> Making changes to plugins can break your site if done incorrectly.
            Always test on a staging environment first.
          </div>
        </div>

        {/* Plugin Selector */}
        <DataCard className="mb-6">
          <DataCardBody>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Plugin to Edit:
          </label>
          <select
            value={selectedPlugin}
            onChange={(e) => setSelectedPlugin(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {plugins.map(plugin => (
              <option key={plugin.slug} value={plugin.slug}>
                {plugin.name} - {plugin.version}
              </option>
            ))}
          </select>
          </DataCardBody>
        </DataCard>

        {/* Editor Layout */}
        <DataCard className="overflow-hidden">
          <div className="flex h-[600px]">
            {/* File Tree Sidebar */}
            <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
              <div className="p-3 border-b border-gray-200 bg-white">
                <h3 className="text-sm font-semibold text-gray-700">Plugin Files</h3>
              </div>
              {loading && fileTree.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">Loading files...</div>
              ) : (
                <div className="py-2">{renderFileTree(fileTree)}</div>
              )}
            </div>

            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              {/* Editor Header */}
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FileCode size={16} />
                  <span className="font-mono">{selectedFile || 'No file selected'}</span>
                  {hasUnsavedChanges && (
                    <span className="text-orange-600 font-medium">• Modified</span>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={!selectedFile || saving || !hasUnsavedChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Code Textarea */}
              <div className="flex-1 overflow-hidden">
                {selectedFile ? (
                  <textarea
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none border-none"
                    style={{ 
                      fontFamily: "'Fira Code', 'Consolas', monospace",
                      lineHeight: '1.6',
                      tabSize: 2
                    }}
                    spellCheck={false}
                    placeholder="Select a file to edit..."
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <FileCode size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Select a file from the sidebar to begin editing</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Editor Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
                <div>
                  Lines: {fileContent.split('\n').length} | Characters: {fileContent.length}
                </div>
                <div>
                  TypeScript
                </div>
              </div>
            </div>
          </div>
        </DataCard>

        {/* Documentation */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Plugin Development Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use TypeScript for better type safety and IDE support</li>
            <li>• Always implement error handling in plugin hooks</li>
            <li>• Test your changes thoroughly before activating plugins</li>
            <li>• Use the NestPress Plugin API for WordPress-compatible hooks</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PluginEditor;
