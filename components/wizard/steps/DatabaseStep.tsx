import React, { useState } from 'react';
import { 
  Database, 
  Check, 
  ExternalLink, 
  AlertCircle,
  Flame,
  Leaf,
  Zap,
  Server,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useConfig } from '../../../contexts/ConfigContext';
import { DatabaseProvider } from '../../../types';

interface DatabaseOption {
  id: DatabaseProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  docsUrl: string;
}

const databaseOptions: DatabaseOption[] = [
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Google\'s realtime database with built-in auth and hosting',
    icon: <Flame className="w-8 h-8" />,
    color: 'from-orange-500 to-yellow-500',
    docsUrl: 'https://firebase.google.com/docs',
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'Flexible NoSQL database for modern applications',
    icon: <Leaf className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500',
    docsUrl: 'https://www.mongodb.com/docs/',
  },
  {
    id: 'dynamodb',
    name: 'DynamoDB',
    description: 'AWS managed NoSQL with single-digit millisecond latency',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-purple-500 to-indigo-500',
    docsUrl: 'https://aws.amazon.com/dynamodb/',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Open source Firebase alternative with PostgreSQL',
    icon: <Server className="w-8 h-8" />,
    color: 'from-emerald-500 to-teal-500',
    docsUrl: 'https://supabase.com/docs',
  },
];

const DatabaseStep: React.FC = () => {
  const { systemConfig, updateDatabaseConfig, skipStep, completeStep } = useConfig();
  const [selectedProvider, setSelectedProvider] = useState<DatabaseProvider>(
    systemConfig.database.provider as DatabaseProvider || 'none'
  );

  const handleSelectProvider = (provider: DatabaseProvider) => {
    setSelectedProvider(provider);
    updateDatabaseConfig({ 
      provider, 
      enabled: true,
      configured: false,
    });
  };

  const handleSkip = () => {
    updateDatabaseConfig({ provider: 'none', enabled: false, configured: false });
    skipStep('database');
  };

  return (
    <div className="py-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
          <Database className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Database</h2>
        <p className="text-slate-400">
          Select a database provider or skip to use local storage
        </p>
      </div>

      {/* Provider Selection */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {databaseOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelectProvider(option.id)}
            className={`relative p-6 rounded-xl border-2 text-left transition-all ${
              selectedProvider === option.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            {selectedProvider === option.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-4 text-white`}>
              {option.icon}
            </div>
            
            <h3 className="text-white font-semibold text-lg mb-1">{option.name}</h3>
            <p className="text-slate-400 text-sm mb-3">{option.description}</p>
            
            <a 
              href={option.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center text-blue-400 text-sm hover:text-blue-300"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Documentation
            </a>
          </button>
        ))}
      </div>

      {/* Configuration Form */}
      {selectedProvider !== 'none' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-6">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <span className="capitalize">{selectedProvider}</span> Configuration
          </h3>
          
          {selectedProvider === 'firebase' && <FirebaseForm />}
          {selectedProvider === 'mongodb' && <MongoDBForm />}
          {selectedProvider === 'dynamodb' && <DynamoDBForm />}
          {selectedProvider === 'supabase' && <SupabaseForm />}
        </div>
      )}

      {/* Skip Option */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleSkip}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Skip for now — use local storage instead
        </button>
      </div>
    </div>
  );
};

// Firebase Configuration Form
const FirebaseForm: React.FC = () => {
  const { systemConfig, updateDatabaseConfig, completeStep } = useConfig();
  const config = systemConfig.database as any;
  
  const handleChange = (field: string, value: string) => {
    updateDatabaseConfig({ [field]: value });
  };

  const handleSave = () => {
    updateDatabaseConfig({ configured: true, enabled: true });
    completeStep('database');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField 
          label="API Key" 
          value={config.apiKey || ''} 
          onChange={(v) => handleChange('apiKey', v)}
          placeholder="AIzaSy..."
          type="password"
        />
        <InputField 
          label="Auth Domain" 
          value={config.authDomain || ''} 
          onChange={(v) => handleChange('authDomain', v)}
          placeholder="your-app.firebaseapp.com"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField 
          label="Project ID" 
          value={config.projectId || ''} 
          onChange={(v) => handleChange('projectId', v)}
          placeholder="your-project-id"
          required
        />
        <InputField 
          label="Storage Bucket" 
          value={config.storageBucket || ''} 
          onChange={(v) => handleChange('storageBucket', v)}
          placeholder="your-app.appspot.com"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField 
          label="Messaging Sender ID" 
          value={config.messagingSenderId || ''} 
          onChange={(v) => handleChange('messagingSenderId', v)}
          placeholder="123456789012"
        />
        <InputField 
          label="App ID" 
          value={config.appId || ''} 
          onChange={(v) => handleChange('appId', v)}
          placeholder="1:123456789:web:abc123"
        />
      </div>
      
      <div className="pt-4">
        <button
          onClick={handleSave}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Save Firebase Configuration
        </button>
      </div>
      
      <InfoBox>
        Get your Firebase config from the{' '}
        <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          Firebase Console
        </a>
        {' '}→ Project Settings → Your Apps
      </InfoBox>
    </div>
  );
};

// MongoDB Configuration Form
const MongoDBForm: React.FC = () => {
  const { systemConfig, updateDatabaseConfig, completeStep, testDatabaseConnection, connectionStatus } = useConfig();
  const config = systemConfig.database as any;
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const handleChange = (field: string, value: any) => {
    updateDatabaseConfig({ [field]: value });
    // Clear test result when config changes
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!config.connectionString) {
      setTestResult({ success: false, message: 'Connection string is required' });
      return;
    }
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testDatabaseConnection({
        provider: 'mongodb',
        uri: config.connectionString,
      });
      setTestResult(result);
    } catch (error: any) {
      setTestResult({ success: false, message: error.message || 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    updateDatabaseConfig({ configured: true, enabled: true });
    completeStep('database');
  };

  const isConnected = connectionStatus.database.connected || testResult?.success;

  return (
    <div className="space-y-4">
      <InputField 
        label="Connection String" 
        value={config.connectionString || ''} 
        onChange={(v) => handleChange('connectionString', v)}
        placeholder="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
        required
      />
      <InputField 
        label="Database Name" 
        value={config.databaseName || ''} 
        onChange={(v) => handleChange('databaseName', v)}
        placeholder="nestpress"
      />
      
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={config.useAtlas || false}
          onChange={(e) => handleChange('useAtlas', e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <span className="text-slate-300">Using MongoDB Atlas (cloud)</span>
      </label>

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
          disabled={testing || !config.connectionString}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            testing || !config.connectionString
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
              <Database className="w-5 h-5" />
              <span>Test Connection</span>
            </>
          )}
        </button>
        <button
          onClick={handleSave}
          disabled={!isConnected}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            isConnected
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>Save Configuration</span>
        </button>
      </div>

      {!isConnected && config.connectionString && (
        <p className="text-yellow-400 text-sm text-center">
          Test connection before saving
        </p>
      )}
      
      <InfoBox>
        Get your connection string from{' '}
        <a href="https://cloud.mongodb.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          MongoDB Atlas
        </a>
        {' '}→ Connect → Drivers
      </InfoBox>
    </div>
  );
};

// DynamoDB Configuration Form
const DynamoDBForm: React.FC = () => {
  const { systemConfig, updateDatabaseConfig, completeStep } = useConfig();
  const config = systemConfig.database as any;
  
  const handleChange = (field: string, value: string) => {
    updateDatabaseConfig({ [field]: value });
  };

  const handleSave = () => {
    updateDatabaseConfig({ configured: true, enabled: true });
    completeStep('database');
  };

  const awsRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-central-1',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">AWS Region</label>
        <select
          value={config.region || ''}
          onChange={(e) => handleChange('region', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a region</option>
          {awsRegions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>
      
      <InputField 
        label="Access Key ID" 
        value={config.accessKeyId || ''} 
        onChange={(v) => handleChange('accessKeyId', v)}
        placeholder="AKIA..."
        type="password"
        required
      />
      <InputField 
        label="Secret Access Key" 
        value={config.secretAccessKey || ''} 
        onChange={(v) => handleChange('secretAccessKey', v)}
        placeholder="Your secret key"
        type="password"
        required
      />
      <InputField 
        label="Table Name" 
        value={config.tableName || ''} 
        onChange={(v) => handleChange('tableName', v)}
        placeholder="nestpress-table"
      />
      
      <div className="pt-4">
        <button
          onClick={handleSave}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          Save DynamoDB Configuration
        </button>
      </div>
      
      <InfoBox>
        Create IAM credentials in the{' '}
        <a href="https://console.aws.amazon.com/iam/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          AWS Console
        </a>
        {' '}with DynamoDB access permissions
      </InfoBox>
    </div>
  );
};

// Supabase Configuration Form
const SupabaseForm: React.FC = () => {
  const { systemConfig, updateDatabaseConfig, completeStep } = useConfig();
  const config = systemConfig.database as any;
  
  const handleChange = (field: string, value: string) => {
    updateDatabaseConfig({ [field]: value });
  };

  const handleSave = () => {
    updateDatabaseConfig({ configured: true, enabled: true });
    completeStep('database');
  };

  return (
    <div className="space-y-4">
      <InputField 
        label="Project URL" 
        value={config.url || ''} 
        onChange={(v) => handleChange('url', v)}
        placeholder="https://your-project.supabase.co"
        required
      />
      <InputField 
        label="Anon Key (Public)" 
        value={config.anonKey || ''} 
        onChange={(v) => handleChange('anonKey', v)}
        placeholder="eyJhbGciOiJI..."
        type="password"
        required
      />
      <InputField 
        label="Service Role Key (Private)" 
        value={config.serviceRoleKey || ''} 
        onChange={(v) => handleChange('serviceRoleKey', v)}
        placeholder="eyJhbGciOiJI..."
        type="password"
      />
      
      <div className="pt-4">
        <button
          onClick={handleSave}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
        >
          Save Supabase Configuration
        </button>
      </div>
      
      <InfoBox>
        Get your API keys from the{' '}
        <a href="https://app.supabase.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          Supabase Dashboard
        </a>
        {' '}→ Settings → API
      </InfoBox>
    </div>
  );
};

// Reusable Input Field Component
const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}> = ({ label, value, onChange, placeholder, type = 'text', required }) => (
  <div>
    <label className="block text-slate-300 text-sm font-medium mb-2">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

// Info Box Component
const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start space-x-3 p-4 bg-slate-700/50 rounded-lg">
    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
    <p className="text-slate-300 text-sm">{children}</p>
  </div>
);

export default DatabaseStep;
