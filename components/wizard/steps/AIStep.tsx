import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  ExternalLink, 
  AlertCircle,
  Brain,
  Wand2,
  Bot,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useConfig } from '../../../contexts/ConfigContext';
import { AIProvider } from '../../../types';

interface AIOption {
  id: AIProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  docsUrl: string;
  models: string[];
}

const aiOptions: AIOption[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s most capable AI model for text and multimodal tasks',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    docsUrl: 'https://ai.google.dev/docs',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 and GPT-3.5 models for advanced language understanding',
    icon: <Brain className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500',
    docsUrl: 'https://platform.openai.com/docs',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude models known for helpful, harmless, and honest responses',
    icon: <Bot className="w-8 h-8" />,
    color: 'from-orange-500 to-amber-500',
    docsUrl: 'https://docs.anthropic.com/',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  },
];

const AIStep: React.FC = () => {
  const { systemConfig, updateAIConfig, skipStep, completeStep } = useConfig();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(
    systemConfig.ai.provider as AIProvider || 'none'
  );

  const handleSelectProvider = (provider: AIProvider) => {
    setSelectedProvider(provider);
    updateAIConfig({ 
      provider, 
      enabled: true,
      configured: false,
    });
  };

  const handleSkip = () => {
    updateAIConfig({ provider: 'none', enabled: false, configured: false });
    skipStep('ai');
  };

  const selectedOption = aiOptions.find(o => o.id === selectedProvider);

  return (
    <div className="py-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
          <Wand2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Configure AI Services</h2>
        <p className="text-slate-400">
          Power your content generation with advanced AI models
        </p>
      </div>

      {/* Provider Selection */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {aiOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelectProvider(option.id)}
            className={`relative p-5 rounded-xl border-2 text-left transition-all ${
              selectedProvider === option.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            {selectedProvider === option.id && (
              <div className="absolute top-3 right-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
            
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-3 text-white`}>
              {option.icon}
            </div>
            
            <h3 className="text-white font-semibold mb-1">{option.name}</h3>
            <p className="text-slate-400 text-xs mb-2 line-clamp-2">{option.description}</p>
            
            <a 
              href={option.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center text-blue-400 text-xs hover:text-blue-300"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Docs
            </a>
          </button>
        ))}
      </div>

      {/* Configuration Form */}
      {selectedProvider !== 'none' && selectedOption && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">
            {selectedOption.name} Configuration
          </h3>
          
          <AIConfigForm 
            provider={selectedProvider} 
            models={selectedOption.models}
            docsUrl={selectedOption.docsUrl}
          />
        </div>
      )}

      {/* Use Cases Preview */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6 mb-6">
        <h4 className="text-white font-medium mb-4">AI Features in NestPress</h4>
        <div className="grid grid-cols-2 gap-4">
          <FeatureItem 
            title="Content Generation"
            description="Generate blog posts, product descriptions, and pages"
          />
          <FeatureItem 
            title="SEO Optimization"
            description="Auto-generate meta titles, descriptions, and keywords"
          />
          <FeatureItem 
            title="Image Alt Text"
            description="Automatically describe images for accessibility"
          />
          <FeatureItem 
            title="Smart Suggestions"
            description="Get content improvement recommendations"
          />
        </div>
      </div>

      {/* Skip Option */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleSkip}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Skip for now — AI features will be disabled
        </button>
      </div>
    </div>
  );
};

// AI Configuration Form
const AIConfigForm: React.FC<{
  provider: AIProvider;
  models: string[];
  docsUrl: string;
}> = ({ provider, models, docsUrl }) => {
  const { systemConfig, updateAIConfig, completeStep, testAIConnection, connectionStatus } = useConfig();
  const config = systemConfig.ai as any;
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const handleChange = (field: string, value: string) => {
    updateAIConfig({ [field]: value });
    // Clear test result when config changes
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!config.apiKey) {
      setTestResult({ success: false, message: 'API key is required' });
      return;
    }
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testAIConnection({
        provider,
        apiKey: config.apiKey,
        model: config.model || models[0],
      });
      setTestResult(result);
    } catch (error: any) {
      setTestResult({ success: false, message: error.message || 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    updateAIConfig({ configured: true, enabled: true });
    completeStep('ai');
  };

  const getApiKeyPlaceholder = () => {
    switch (provider) {
      case 'gemini': return 'AIzaSy...';
      case 'openai': return 'sk-...';
      case 'anthropic': return 'sk-ant-...';
      default: return 'Enter API key';
    }
  };

  const getApiKeyUrl = () => {
    switch (provider) {
      case 'gemini': return 'https://aistudio.google.com/app/apikey';
      case 'openai': return 'https://platform.openai.com/api-keys';
      case 'anthropic': return 'https://console.anthropic.com/';
      default: return docsUrl;
    }
  };

  const isConnected = connectionStatus.ai.connected || testResult?.success;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          API Key <span className="text-red-400">*</span>
        </label>
        <input
          type="password"
          value={config.apiKey || ''}
          onChange={(e) => handleChange('apiKey', e.target.value)}
          placeholder={getApiKeyPlaceholder()}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {provider === 'openai' && (
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Organization ID <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="text"
            value={config.organizationId || ''}
            onChange={(e) => handleChange('organizationId', e.target.value)}
            placeholder="org-..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Default Model
        </label>
        <select
          value={config.model || models[0]}
          onChange={(e) => handleChange('model', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>

      {/* Connection Test Result */}
      {testResult && (
        <div className={`flex items-center space-x-3 p-4 rounded-lg ${
          testResult.success 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <p className={testResult.success ? 'text-green-400' : 'text-red-400'}>
            {testResult.message}
          </p>
        </div>
      )}

      <div className="pt-4 flex space-x-3">
        <button
          onClick={handleTestConnection}
          disabled={testing || !config.apiKey}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            testing || !config.apiKey
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
        >
          {testing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Testing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Test API Key</span>
            </>
          )}
        </button>
        <button
          onClick={handleSave}
          disabled={!isConnected}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            isConnected
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>Save Configuration</span>
        </button>
      </div>

      {!isConnected && config.apiKey && (
        <p className="text-yellow-400 text-sm text-center">
          Test your API key before saving
        </p>
      )}

      <div className="flex items-start space-x-3 p-4 bg-slate-700/50 rounded-lg">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-slate-300 text-sm">
          Get your API key from{' '}
          <a 
            href={getApiKeyUrl()} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:underline"
          >
            {provider === 'gemini' ? 'Google AI Studio' : provider === 'openai' ? 'OpenAI Platform' : 'Anthropic Console'}
          </a>
        </p>
      </div>
    </div>
  );
};

// Feature Item Component
const FeatureItem: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <div className="flex items-start space-x-3">
    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Check className="w-4 h-4 text-purple-400" />
    </div>
    <div>
      <p className="text-white text-sm font-medium">{title}</p>
      <p className="text-slate-400 text-xs">{description}</p>
    </div>
  </div>
);

export default AIStep;
