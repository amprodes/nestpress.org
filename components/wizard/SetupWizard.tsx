import React, { useState } from 'react';
import { 
  Rocket, 
  Database, 
  Sparkles, 
  CreditCard, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Check,
  AlertCircle,
  ExternalLink,
  Wifi,
  WifiOff,
  Copy,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';
import DatabaseStep from './steps/DatabaseStep';
import AIStep from './steps/AIStep';
import PaymentStep from './steps/PaymentStep';

const SetupWizard: React.FC = () => {
  const { wizardState, nextStep, prevStep, goToStep, completeWizard, apiConnected, adminCredentials, clearAdminCredentials } = useConfig();
  const { currentStep, steps } = wizardState;
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const getStepIcon = (iconName: string, isActive: boolean, isCompleted: boolean) => {
    const className = `w-6 h-6 ${isActive ? 'text-white' : isCompleted ? 'text-green-600' : 'text-gray-400'}`;
    
    switch (iconName) {
      case 'rocket': return <Rocket className={className} />;
      case 'database': return <Database className={className} />;
      case 'sparkles': return <Sparkles className={className} />;
      case 'credit-card': return <CreditCard className={className} />;
      case 'check-circle': return <CheckCircle className={className} />;
      default: return <CheckCircle className={className} />;
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'welcome':
        return <WelcomeStep />;
      case 'database':
        return <DatabaseStep />;
      case 'ai':
        return <AIStep />;
      case 'payment':
        return <PaymentStep />;
      case 'complete':
        return <CompleteStep onComplete={completeWizard} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Sidebar - Step Navigation */}
      <aside className="w-80 bg-slate-800/50 border-r border-slate-700 p-6 flex flex-col">
        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">NestPress</h1>
              <p className="text-slate-400 text-sm">Setup Wizard</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <nav className="flex-1 space-y-2">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = step.completed;
            const isPast = index < currentStep;
            
            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : isPast || isCompleted
                    ? 'text-slate-300 hover:bg-slate-700/50'
                    : 'text-slate-500 hover:bg-slate-700/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive 
                    ? 'bg-blue-500' 
                    : isCompleted 
                    ? 'bg-green-500/20 border-2 border-green-500' 
                    : 'bg-slate-700'
                }`}>
                  {isCompleted && !isActive ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    getStepIcon(step.icon, isActive, isCompleted)
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${isActive ? 'text-white' : ''}`}>{step.title}</p>
                  <p className={`text-sm ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                    {step.description}
                  </p>
                </div>
                {!step.required && (
                  <span className="text-xs bg-slate-600 px-2 py-1 rounded text-slate-300">
                    Optional
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Help Link */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          {/* Backend Connection Status */}
          <div className={`flex items-center text-sm mb-4 ${apiConnected ? 'text-green-400' : 'text-yellow-400'}`}>
            {apiConnected ? (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                <span>Backend Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 mr-2" />
                <span>Offline Mode</span>
              </>
            )}
          </div>
          <a href="#" className="flex items-center text-slate-400 hover:text-white text-sm transition-colors">
            <ExternalLink className="w-4 h-4 mr-2" />
            Need help? View documentation
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation Footer */}
        <footer className="border-t border-slate-700 bg-slate-800/50 px-8 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                currentStep === 0
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2 text-slate-500">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'w-6 bg-blue-500' 
                      : index < currentStep 
                      ? 'bg-green-500' 
                      : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={completeWizard}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Complete Setup</span>
              </button>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
};

// Welcome Step Component
const WelcomeStep: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/25">
        <Rocket className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-4">
        Welcome to NestPress
      </h1>
      <p className="text-xl text-slate-400 mb-8 max-w-xl mx-auto">
        Let's configure your CMS in just a few steps. You can always change these settings later.
      </p>

      <div className="grid grid-cols-3 gap-6 mt-12">
        <FeatureCard 
          icon={<Database className="w-8 h-8" />}
          title="Multi-Database"
          description="Connect Firebase, MongoDB, DynamoDB, or Supabase"
        />
        <FeatureCard 
          icon={<Sparkles className="w-8 h-8" />}
          title="AI Powered"
          description="Integrate Gemini, OpenAI, or Anthropic for content generation"
        />
        <FeatureCard 
          icon={<CreditCard className="w-8 h-8" />}
          title="Payments Ready"
          description="Accept payments with Stripe, PayPal, or Square"
        />
      </div>

      <div className="mt-12 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="flex items-start space-x-4">
          <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <h3 className="text-white font-medium mb-1">All steps are optional</h3>
            <p className="text-slate-400 text-sm">
              You can skip any configuration step and set it up later from the admin dashboard.
              NestPress will work with default local settings until you configure external services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
    <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center mb-4 text-blue-400">
      {icon}
    </div>
    <h3 className="text-white font-semibold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm">{description}</p>
  </div>
);

// Complete Step Component
const CompleteStep: React.FC<{ onComplete: () => Promise<any> }> = ({ onComplete }) => {
  const { systemConfig, validateDatabaseConfig, validateAIConfig, validatePaymentConfig, connectionStatus, adminCredentials, clearAdminCredentials } = useConfig();
  const [isCompleting, setIsCompleting] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);
  
  const configurations = [
    { 
      name: 'Database', 
      provider: systemConfig.database.provider,
      configured: systemConfig.database.provider !== 'none',
      valid: validateDatabaseConfig(),
      connected: connectionStatus.database.connected,
    },
    { 
      name: 'AI Services', 
      provider: systemConfig.ai.provider,
      configured: systemConfig.ai.provider !== 'none',
      valid: validateAIConfig(),
      connected: connectionStatus.ai.connected,
    },
    { 
      name: 'Payments', 
      provider: systemConfig.payment.provider,
      configured: systemConfig.payment.provider !== 'none',
      valid: validatePaymentConfig(),
      connected: connectionStatus.payment.connected,
    },
  ];

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const result = await onComplete();
      if (result) {
        setCredentials(result);
      }
    } catch (error) {
      console.error('Failed to complete setup:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Show credentials modal if we have them
  if (credentials || adminCredentials) {
    const creds = credentials || adminCredentials!;
    return (
      <div className="py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/25">
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">
            Setup Complete!
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Your super admin account has been created. Save these credentials - they will only be shown once!
          </p>
        </div>

        {/* Credentials Card */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-8 max-w-md mx-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Email</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={creds.email}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono"
                />
                <button
                  onClick={() => copyToClipboard(creds.email, 'email')}
                  className="px-3 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                >
                  {copied === 'email' ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-300" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-slate-400 text-sm mb-2">Password</label>
              <div className="flex items-center space-x-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={creds.password}
                  readOnly
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-300" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-300" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(creds.password, 'password')}
                  className="px-3 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                >
                  {copied === 'password' ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-400 text-sm">
                Save these credentials securely! This password will not be shown again.
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={() => {
              clearAdminCredentials();
              window.location.reload();
            }}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-xl shadow-blue-500/25"
          >
            <Rocket className="w-5 h-5" />
            <span>Go to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/25">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">
          You're All Set!
        </h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Review your configuration below. You can always modify these settings from the admin dashboard.
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="space-y-4 mb-12">
        {configurations.map((config) => (
          <div 
            key={config.name}
            className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                config.configured 
                  ? config.connected 
                    ? 'bg-green-500/20' 
                    : config.valid
                    ? 'bg-yellow-500/20'
                    : 'bg-red-500/20'
                  : 'bg-slate-700'
              }`}>
                {config.configured ? (
                  config.connected ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : config.valid ? (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </div>
              <div>
                <p className="text-white font-medium">{config.name}</p>
                <p className="text-slate-400 text-sm capitalize">
                  {config.configured ? config.provider : 'Not configured'}
                </p>
              </div>
            </div>
            <div className="text-right">
              {config.configured && config.connected && (
                <span className="text-green-400 text-sm">Connected</span>
              )}
              {config.configured && !config.connected && config.valid && (
                <span className="text-yellow-400 text-sm">Not tested</span>
              )}
              {config.configured && !config.valid && (
                <span className="text-red-400 text-sm">Missing credentials</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Launch Button */}
      <div className="text-center">
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-xl shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isCompleting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Setting up...</span>
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5" />
              <span>Launch NestPress Dashboard</span>
            </>
          )}
        </button>
        <p className="text-slate-500 text-sm mt-4">
          A super admin account will be created for you
        </p>
      </div>
    </div>
  );
};

export default SetupWizard;
