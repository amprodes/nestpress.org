/**
 * AI Theme Factory - Admin UI Component
 * 
 * Features:
 * - URL input form for target website
 * - Real-time SSE progress tracking
 * - Phase indicators with progress bars
 * - Error handling and retry
 * - Theme download link on completion
 */

import React, { useState } from 'react';
import { AlertCircle, Download, Loader, CheckCircle, Globe } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  phase: number;
  message: string;
  error: string | null;
  downloadUrl: string | null;
  themeName: string | null;
}

export default function ThemeFactoryAdminPage() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    phase: 1,
    message: '',
    error: null,
    downloadUrl: null,
    themeName: null,
  });

  const handleGenerate = async () => {
    if (!url.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a valid URL' }));
      return;
    }

    setState({
      isGenerating: true,
      progress: 0,
      phase: 1,
      message: 'Starting theme generation...',
      error: null,
      downloadUrl: null,
      themeName: null,
    });

    try {
      // Start generation
      const response = await fetch(`${API_BASE_URL}/plugins/ai-theme-factory/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Generation failed');
      }

      const jobId = data.jobId;
      console.log('[ThemeFactory] Job started:', jobId);

      // Add 500ms delay before connecting to SSE (backend needs time to set up stream)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Connect to SSE for progress
      const eventSource = new EventSource(`${API_BASE_URL}/plugins/ai-theme-factory/progress/${jobId}`);

      eventSource.onmessage = (event) => {
        console.log('[ThemeFactory] SSE message:', event.data);
        
        try {
          const update = JSON.parse(event.data);

          if (update.type === 'phase') {
            setState(prev => ({
              ...prev,
              phase: update.phase,
              progress: update.progress,
              message: update.message,
            }));
          } else if (update.type === 'complete') {
            setState(prev => ({
              ...prev,
              isGenerating: false,
              progress: 100,
              message: 'Theme generation complete!',
              downloadUrl: update.downloadUrl,
              themeName: update.themeName,
            }));
            eventSource.close();
          } else if (update.type === 'error') {
            setState(prev => ({
              ...prev,
              isGenerating: false,
              error: update.message,
            }));
            eventSource.close();
          }
        } catch (err) {
          console.error('[ThemeFactory] Failed to parse SSE:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('[ThemeFactory] SSE error:', err);
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: 'Connection lost. Please check backend logs.',
        }));
        eventSource.close();
      };

    } catch (error: any) {
      console.error('[ThemeFactory] Generation error:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message || 'Failed to start theme generation',
      }));
    }
  };

  const phases = [
    { num: 1, label: 'Analysis', range: '10-30%' },
    { num: 2, label: 'Resources', range: '30-50%' },
    { num: 3, label: 'Assembly', range: '50-70%' },
    { num: 4, label: 'AI Transform', range: '70-88%' },
    { num: 5, label: 'Package', range: '89-100%' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Theme Factory</h1>
        <p className="text-gray-600">
          Clone any website into a NestPress theme using AI. Enter a URL to get started.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-6 mb-6">
        <label className="block mb-2 font-medium">Target Website URL</label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={state.isGenerating}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={state.isGenerating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {state.isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Theme'
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Generation Failed</p>
            <p className="text-red-700 text-sm mt-1">{state.error}</p>
          </div>
        </div>
      )}

      {/* Progress Display */}
      {(state.isGenerating || state.downloadUrl) && (
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-6">
          {/* Phase Indicators */}
          <div className="mb-6">
            <div className="flex justify-between mb-4">
              {phases.map((phase) => (
                <div
                  key={phase.num}
                  className={`flex flex-col items-center ${
                    state.phase === phase.num
                      ? 'text-blue-600'
                      : state.phase > phase.num
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                      state.phase === phase.num
                        ? 'bg-blue-100 border-2 border-blue-600'
                        : state.phase > phase.num
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    {state.phase > phase.num ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      phase.num
                    )}
                  </div>
                  <span className="text-xs font-medium">{phase.label}</span>
                  <span className="text-xs text-gray-500">{phase.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {state.message || 'Processing...'}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {state.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>

          {/* Download Button */}
          {state.downloadUrl && state.themeName && (
            <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-900">Theme Ready!</p>
                  <p className="text-sm text-green-700 mt-1">
                    {state.themeName} has been generated successfully
                  </p>
                </div>
                <a
                  href={state.downloadUrl}
                  download
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">What Gets Generated</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Complete theme structure</li>
            <li>✓ 7 core templates (home, single, page, archive, etc.)</li>
            <li>✓ Template parts (header, footer, sidebar)</li>
            <li>✓ Design system from original site</li>
            <li>✓ Optimized images and assets</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-bold text-purple-900 mb-2">AI-Powered Features</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>✓ Layout analysis with Gemini Vision</li>
            <li>✓ Static HTML → Dynamic React components</li>
            <li>✓ Automatic menu integration</li>
            <li>✓ Widget area detection</li>
            <li>✓ WordPress v3 theme.json</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
