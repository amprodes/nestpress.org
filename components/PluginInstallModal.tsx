import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import { pluginsApi } from '../services/api';
import { useToast } from './Toast';
import { useModal } from './Modal';

interface PluginInstallModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Plugin Install/Upload Modal
 * WordPress equivalent: wp-admin/plugin-install.php
 */
const PluginInstallModal: React.FC<PluginInstallModalProps> = ({ onClose, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: showError } = useToast();
  const { alert } = useModal();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.zip')) {
      showError('Please upload a ZIP file containing the plugin');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError('Plugin file must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const plugin = await pluginsApi.upload(selectedFile);
      success(`Plugin "${plugin.name}" installed successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to install plugin');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Install Plugin</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload 
              size={48} 
              className={`mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`}
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle size={20} />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-700 font-medium mb-2">
                  Drop plugin ZIP file here or
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-4">
                  Maximum size: 10MB
                </p>
              </>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Plugin Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Plugin must be in ZIP format</li>
                  <li>Must contain an index.ts or index.tsx file</li>
                  <li>Should have valid plugin header metadata</li>
                  <li>Follow NestPress plugin structure</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Documentation Link */}
          <div className="mt-4 text-sm text-gray-600">
            Need help? Check out the{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              Plugin Development Guide
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Installing...
              </>
            ) : (
              <>
                <Upload size={16} />
                Install Plugin
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PluginInstallModal;
