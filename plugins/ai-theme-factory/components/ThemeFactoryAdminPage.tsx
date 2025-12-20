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
  const [generationMode, setGenerationMode] = useState<'exact' | 'nestpress'>('nestpress');
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
        body: JSON.stringify({ 
          url,
          exactClone: generationMode === 'exact'
        }),
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

  const phases = generationMode === 'exact'
    ? [
        { num: 1, label: 'Analysis', range: '10-30%' },
        { num: 2, label: 'Resources', range: '30-60%' },
        { num: 3, label: 'Assembly', range: '60-80%' },
        { num: 4, label: 'Package', range: '80-100%' },
      ]
    : [
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
        <div className="flex gap-3 mb-4">
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

        {/* Generation Mode Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block mb-3 font-medium text-gray-700">Generation Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGenerationMode('exact')}
              disabled={state.isGenerating}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                generationMode === 'exact'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  generationMode === 'exact' ? 'border-blue-500' : 'border-gray-400'
                }`}>
                  {generationMode === 'exact' && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className="font-semibold text-gray-900">📸 Exact Clone</span>
              </div>
              <p className="text-sm text-gray-600 leading-tight">
                100% identical copy of original HTML/CSS without any modifications. Best for testing design accuracy.
              </p>
            </button>

            <button
              onClick={() => setGenerationMode('nestpress')}
              disabled={state.isGenerating}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                generationMode === 'nestpress'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  generationMode === 'nestpress' ? 'border-blue-500' : 'border-gray-400'
                }`}>
                  {generationMode === 'nestpress' && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className="font-semibold text-gray-900">🔄 NestPressify</span>
              </div>
              <p className="text-sm text-gray-600 leading-tight">
                AI-powered conversion to React components with dynamic content, menus, and widgets. Full CMS integration.
              </p>
            </button>
          </div>
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
        {generationMode === 'exact' ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">📸 Exact Clone Mode</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ 100% identical HTML/CSS copy</li>
                <li>✓ No AI conversion or modifications</li>
                <li>✓ All images and assets preserved</li>
                <li>✓ Original JavaScript included</li>
                <li>✓ Fast generation (no AI processing)</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-bold text-amber-900 mb-2">⚠️ Limitations</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>✗ No dynamic content from CMS</li>
                <li>✗ No menu integration</li>
                <li>✗ No widget areas</li>
                <li>✗ Static only (no blog, products)</li>
                <li>→ Use for design testing, then NestPressify</li>
              </ul>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
