import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  ExternalLink, 
  AlertCircle,
  ShieldCheck,
  Lock,
  Globe
} from 'lucide-react';
import { useConfig } from '../../../contexts/ConfigContext';
import { PaymentProvider } from '../../../types';

interface PaymentOption {
  id: PaymentProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  docsUrl: string;
  features: string[];
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'The most developer-friendly payment platform',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
      </svg>
    ),
    color: 'from-indigo-500 to-purple-500',
    docsUrl: 'https://stripe.com/docs',
    features: ['Cards', 'Apple Pay', 'Google Pay', 'Bank transfers', 'SEPA'],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Trusted by millions of customers worldwide',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082h-2.19c-1.564 0-2.903 1.147-3.15 2.7l-1.12 7.106a.641.641 0 0 0 .633.74h3.36c.524 0 .968-.382 1.05-.9l.897-5.68c.082-.52.526-.9 1.05-.9h.664c4.298 0 7.664-1.747 8.647-6.797.395-2.02.158-3.592-.635-4.064z"/>
      </svg>
    ),
    color: 'from-blue-500 to-cyan-500',
    docsUrl: 'https://developer.paypal.com/docs',
    features: ['PayPal Balance', 'Cards', 'Pay Later', 'Venmo', 'Crypto'],
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Unified commerce platform for online and in-person',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 0A4.5 4.5 0 0 0 0 4.5v15A4.5 4.5 0 0 0 4.5 24h15a4.5 4.5 0 0 0 4.5-4.5v-15A4.5 4.5 0 0 0 19.5 0h-15zM6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
      </svg>
    ),
    color: 'from-slate-700 to-slate-900',
    docsUrl: 'https://developer.squareup.com/docs',
    features: ['Cards', 'Gift Cards', 'Invoices', 'Subscriptions'],
  },
];

const PaymentStep: React.FC = () => {
  const { systemConfig, updatePaymentConfig, skipStep, completeStep } = useConfig();
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(
    systemConfig.payment.provider as PaymentProvider || 'none'
  );

  const handleSelectProvider = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    updatePaymentConfig({ 
      provider, 
      enabled: true,
      configured: false,
    });
  };

  const handleSkip = () => {
    updatePaymentConfig({ provider: 'none', enabled: false, configured: false });
    skipStep('payment');
  };

  const selectedOption = paymentOptions.find(o => o.id === selectedProvider);

  return (
    <div className="py-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Set Up Payments</h2>
        <p className="text-slate-400">
          Accept payments securely from customers worldwide
        </p>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center space-x-6 mb-8">
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <span>PCI Compliant</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          <Lock className="w-5 h-5 text-green-500" />
          <span>256-bit Encryption</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          <Globe className="w-5 h-5 text-green-500" />
          <span>Global Coverage</span>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {paymentOptions.map((option) => (
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
            <p className="text-slate-400 text-xs mb-3">{option.description}</p>
            
            {/* Payment Methods */}
            <div className="flex flex-wrap gap-1">
              {option.features.slice(0, 3).map(feature => (
                <span 
                  key={feature}
                  className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Configuration Form */}
      {selectedProvider !== 'none' && selectedOption && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">
            {selectedOption.name} Configuration
          </h3>
          
          {selectedProvider === 'stripe' && <StripeForm />}
          {selectedProvider === 'paypal' && <PayPalForm />}
          {selectedProvider === 'square' && <SquareForm />}
        </div>
      )}

      {/* Skip Option */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleSkip}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Skip for now — e-commerce features will be limited
        </button>
      </div>
    </div>
  );
};

// Stripe Configuration Form
const StripeForm: React.FC = () => {
  const { systemConfig, updatePaymentConfig, completeStep } = useConfig();
  const config = systemConfig.payment as any;
  
  const handleChange = (field: string, value: any) => {
    updatePaymentConfig({ [field]: value });
  };

  const handleSave = () => {
    updatePaymentConfig({ configured: true, enabled: true });
    completeStep('payment');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Publishable Key <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={config.publishableKey || ''}
            onChange={(e) => handleChange('publishableKey', e.target.value)}
            placeholder="pk_test_..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Secret Key <span className="text-red-400">*</span>
          </label>
          <input
            type="password"
            value={config.secretKey || ''}
            onChange={(e) => handleChange('secretKey', e.target.value)}
            placeholder="sk_test_..."
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Webhook Secret <span className="text-slate-500">(optional)</span>
        </label>
        <input
          type="password"
          value={config.webhookSecret || ''}
          onChange={(e) => handleChange('webhookSecret', e.target.value)}
          placeholder="whsec_..."
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={config.testMode ?? true}
          onChange={(e) => handleChange('testMode', e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <span className="text-slate-300">Enable Test Mode</span>
      </label>

      {config.testMode && (
        <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-200 text-sm">
            Test mode enabled. Use test card 4242 4242 4242 4242 for testing.
          </p>
        </div>
      )}

      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={!config.publishableKey || !config.secretKey}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            config.publishableKey && config.secretKey
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          Save Stripe Configuration
        </button>
      </div>

      <InfoBox>
        Get your API keys from the{' '}
        <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          Stripe Dashboard
        </a>
        {' '}→ Developers → API keys
      </InfoBox>
    </div>
  );
};

// PayPal Configuration Form
const PayPalForm: React.FC = () => {
  const { systemConfig, updatePaymentConfig, completeStep } = useConfig();
  const config = systemConfig.payment as any;
  
  const handleChange = (field: string, value: any) => {
    updatePaymentConfig({ [field]: value });
  };

  const handleSave = () => {
    updatePaymentConfig({ configured: true, enabled: true });
    completeStep('payment');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Client ID <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={config.clientId || ''}
          onChange={(e) => handleChange('clientId', e.target.value)}
          placeholder="AY..."
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Client Secret <span className="text-red-400">*</span>
        </label>
        <input
          type="password"
          value={config.clientSecret || ''}
          onChange={(e) => handleChange('clientSecret', e.target.value)}
          placeholder="EM..."
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={config.sandbox ?? true}
          onChange={(e) => handleChange('sandbox', e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <span className="text-slate-300">Sandbox Mode (Testing)</span>
      </label>

      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={!config.clientId || !config.clientSecret}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            config.clientId && config.clientSecret
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          Save PayPal Configuration
        </button>
      </div>

      <InfoBox>
        Get your credentials from the{' '}
        <a href="https://developer.paypal.com/dashboard/applications/live" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          PayPal Developer Dashboard
        </a>
        {' '}→ My Apps & Credentials
      </InfoBox>
    </div>
  );
};

// Square Configuration Form
const SquareForm: React.FC = () => {
  const { systemConfig, updatePaymentConfig, completeStep } = useConfig();
  const config = systemConfig.payment as any;
  
  const handleChange = (field: string, value: any) => {
    updatePaymentConfig({ [field]: value });
  };

  const handleSave = () => {
    updatePaymentConfig({ configured: true, enabled: true });
    completeStep('payment');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Application ID <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={config.applicationId || ''}
          onChange={(e) => handleChange('applicationId', e.target.value)}
          placeholder="sandbox-sq0idb-..."
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Access Token <span className="text-red-400">*</span>
        </label>
        <input
          type="password"
          value={config.accessToken || ''}
          onChange={(e) => handleChange('accessToken', e.target.value)}
          placeholder="EAAAlg..."
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Location ID <span className="text-slate-500">(optional)</span>
        </label>
        <input
          type="text"
          value={config.locationId || ''}
          onChange={(e) => handleChange('locationId', e.target.value)}
          placeholder="L..."
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={config.sandbox ?? true}
          onChange={(e) => handleChange('sandbox', e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <span className="text-slate-300">Sandbox Mode (Testing)</span>
      </label>

      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={!config.applicationId || !config.accessToken}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            config.applicationId && config.accessToken
              ? 'bg-slate-600 hover:bg-slate-500 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          Save Square Configuration
        </button>
      </div>

      <InfoBox>
        Get your credentials from the{' '}
        <a href="https://developer.squareup.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          Square Developer Dashboard
        </a>
        {' '}→ Applications
      </InfoBox>
    </div>
  );
};

// Info Box Component
const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start space-x-3 p-4 bg-slate-700/50 rounded-lg">
    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
    <p className="text-slate-300 text-sm">{children}</p>
  </div>
);

export default PaymentStep;
