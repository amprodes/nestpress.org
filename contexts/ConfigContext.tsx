import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { 
  SystemConfig, 
  WizardState, 
  WizardStep,
  AppMode,
  DatabaseConfig,
  AIConfig,
  PaymentConfig,
  StorageConfig,
} from '../types';
import { 
  systemConfigApi, 
  healthApi, 
  SystemConfigResponse,
  TestConnectionResult,
  AdminCredentials,
  TestDatabaseConnectionDto,
  TestAIConnectionDto,
  TestPaymentConnectionDto,
} from '../services/api';

// Default configurations
const defaultDatabaseConfig: DatabaseConfig = {
  provider: 'none',
  enabled: false,
  configured: false,
};

const defaultAIConfig: AIConfig = {
  provider: 'none',
  enabled: false,
  configured: false,
};

const defaultPaymentConfig: PaymentConfig = {
  provider: 'none',
  enabled: false,
  configured: false,
};

const defaultStorageConfig: StorageConfig = {
  provider: 'none',
  enabled: false,
  configured: false,
};

const defaultSystemConfig: SystemConfig = {
  initialized: false,
  database: defaultDatabaseConfig,
  ai: defaultAIConfig,
  payment: defaultPaymentConfig,
  storage: defaultStorageConfig,
};

const defaultWizardSteps: WizardStep[] = [
  {
    id: 'language',
    title: 'Language',
    description: 'Choose your language',
    icon: 'globe',
    required: true,
    completed: false,
    category: 'custom',
  },
  {
    id: 'database',
    title: 'Database',
    description: 'Connect your database',
    icon: 'database',
    required: true,
    completed: false,
    category: 'database',
  },
  {
    id: 'site-info',
    title: 'Site Information',
    description: 'Site title and admin email',
    icon: 'settings',
    required: true,
    completed: false,
    category: 'custom',
  },
  {
    id: 'ai',
    title: 'AI Services',
    description: 'Configure AI providers',
    icon: 'sparkles',
    required: false,
    completed: false,
    category: 'ai',
  },
  {
    id: 'payment',
    title: 'Payments',
    description: 'Set up payment processing',
    icon: 'credit-card',
    required: false,
    completed: false,
    category: 'payment',
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Finish setup',
    icon: 'check-circle',
    required: true,
    completed: false,
    category: 'custom',
  },
];

const defaultWizardState: WizardState = {
  currentStep: 0,
  steps: defaultWizardSteps,
  isComplete: false,
  skippedSteps: [],
};

// Context type
interface ConfigContextType {
  // System config
  systemConfig: SystemConfig;
  updateDatabaseConfig: (config: Partial<DatabaseConfig>) => Promise<void>;
  updateAIConfig: (config: Partial<AIConfig>) => Promise<void>;
  updatePaymentConfig: (config: Partial<PaymentConfig>) => Promise<void>;
  updateStorageConfig: (config: Partial<StorageConfig>) => Promise<void>;
  
  // Wizard state
  wizardState: WizardState;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;
  skipStep: (stepId: string) => void;
  completeStep: (stepId: string) => void;
  completeWizard: () => Promise<AdminCredentials | null>;
  resetWizard: () => Promise<void>;
  
  // App mode
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  
  // Loading and connection state
  isLoading: boolean;
  apiConnected: boolean;
  error: string | null;
  
  // Connection testing
  testDatabaseConnection: (config: TestDatabaseConnectionDto) => Promise<TestConnectionResult>;
  testAIConnection: (config: TestAIConnectionDto) => Promise<TestConnectionResult>;
  testPaymentConnection: (config: TestPaymentConnectionDto) => Promise<TestConnectionResult>;
  
  // Admin credentials (shown only once after setup)
  adminCredentials: AdminCredentials | null;
  clearAdminCredentials: () => void;
  
  // Connection status
  connectionStatus: {
    database: { tested: boolean; connected: boolean; error?: string };
    ai: { tested: boolean; connected: boolean; error?: string };
    payment: { tested: boolean; connected: boolean; error?: string };
  };
  
  // Validation helpers
  validateDatabaseConfig: () => boolean;
  validateAIConfig: () => boolean;
  validatePaymentConfig: () => boolean;
  
  // Refresh config from backend
  refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(defaultSystemConfig);
  const [wizardState, setWizardState] = useState<WizardState>(defaultWizardState);
  const [appMode, setAppMode] = useState<AppMode>('setup');
  const [isLoading, setIsLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials | null>(null);
  const [connectionStatus, setConnectionStatus] = useState({
    database: { tested: false, connected: false, error: undefined as string | undefined },
    ai: { tested: false, connected: false, error: undefined as string | undefined },
    payment: { tested: false, connected: false, error: undefined as string | undefined },
  });

  // Load config from backend
  const loadConfigFromBackend = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if API is available
      const apiAvailable = await healthApi.checkApi();
      setApiConnected(apiAvailable);
      
      if (!apiAvailable) {
        setError('Backend API is not available. Please ensure the server is running.');
        setIsLoading(false);
        return;
      }
      
      // Load config from backend
      const backendConfig = await systemConfigApi.getConfig();
      
      // Map backend config to frontend format
      const mappedConfig: SystemConfig = {
        initialized: backendConfig.initialized,
        setupCompletedAt: backendConfig.setupCompletedAt,
        database: {
          provider: backendConfig.database.provider as any,
          enabled: backendConfig.database.enabled,
          configured: backendConfig.database.configured,
        },
        ai: {
          provider: backendConfig.ai.provider as any,
          enabled: backendConfig.ai.enabled,
          configured: backendConfig.ai.configured,
        },
        payment: {
          provider: backendConfig.payment.provider as any,
          enabled: backendConfig.payment.enabled,
          configured: backendConfig.payment.configured,
        },
        storage: {
          provider: backendConfig.storage.provider as any,
          enabled: backendConfig.storage.enabled,
          configured: backendConfig.storage.configured,
        },
      };
      
      setSystemConfig(mappedConfig);
      
      // Update connection status from backend
      setConnectionStatus({
        database: {
          tested: backendConfig.database.connectionTested || false,
          connected: backendConfig.database.connectionStatus === 'connected',
          error: backendConfig.database.connectionError,
        },
        ai: {
          tested: backendConfig.ai.connectionTested || false,
          connected: backendConfig.ai.connectionStatus === 'connected',
          error: backendConfig.ai.connectionError,
        },
        payment: {
          tested: backendConfig.payment.connectionTested || false,
          connected: backendConfig.payment.connectionStatus === 'connected',
          error: backendConfig.payment.connectionError,
        },
      });
      
      // If system is initialized, mark wizard as complete
      if (backendConfig.initialized) {
        setWizardState(prev => ({
          ...prev,
          isComplete: true,
          steps: prev.steps.map(s => ({ ...s, completed: true })),
        }));
        setAppMode('admin');
      } else {
        setAppMode('setup');
      }
      
    } catch (err) {
      console.error('Failed to load config from backend:', err);
      setError('Failed to load configuration from backend.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadConfigFromBackend();
  }, [loadConfigFromBackend]);

  // Determine app mode based on config
  useEffect(() => {
    if (systemConfig.initialized) {
      setAppMode('admin');
    } else if (!isLoading) {
      setAppMode('setup');
    }
  }, [systemConfig.initialized, isLoading]);

  // Sync config to backend
  const syncConfigToBackend = useCallback(async (config: SystemConfig) => {
    if (!apiConnected) {
      throw new Error('Cannot sync config: Backend API not connected');
    }
    
    await systemConfigApi.updateConfig({
      database: config.database as any,
      ai: config.ai as any,
      payment: config.payment as any,
      storage: config.storage as any,
    });
  }, [apiConnected]);

  // Database config update - local state only during wizard, syncs on complete
  const updateDatabaseConfig = useCallback(async (config: Partial<DatabaseConfig>) => {
    const updatedConfig = {
      ...systemConfig,
      database: {
        ...systemConfig.database,
        ...config,
        lastUpdated: new Date().toISOString(),
      } as DatabaseConfig,
    };
    
    setSystemConfig(updatedConfig);
    
    // Only sync if system is already initialized (post-setup changes)
    if (systemConfig.initialized && apiConnected) {
      await syncConfigToBackend(updatedConfig);
    }
  }, [apiConnected, systemConfig, syncConfigToBackend]);

  // AI config update
  const updateAIConfig = useCallback(async (config: Partial<AIConfig>) => {
    const updatedConfig = {
      ...systemConfig,
      ai: {
        ...systemConfig.ai,
        ...config,
        lastUpdated: new Date().toISOString(),
      } as AIConfig,
    };
    
    setSystemConfig(updatedConfig);
    
    // Only sync if system is already initialized (post-setup changes)
    if (systemConfig.initialized && apiConnected) {
      await syncConfigToBackend(updatedConfig);
    }
  }, [apiConnected, systemConfig, syncConfigToBackend]);

  // Payment config update
  const updatePaymentConfig = useCallback(async (config: Partial<PaymentConfig>) => {
    const updatedConfig = {
      ...systemConfig,
      payment: {
        ...systemConfig.payment,
        ...config,
        lastUpdated: new Date().toISOString(),
      } as PaymentConfig,
    };
    
    setSystemConfig(updatedConfig);
    
    // Only sync if system is already initialized (post-setup changes)
    if (systemConfig.initialized && apiConnected) {
      await syncConfigToBackend(updatedConfig);
    }
  }, [apiConnected, systemConfig, syncConfigToBackend]);

  // Storage config update
  const updateStorageConfig = useCallback(async (config: Partial<StorageConfig>) => {
    const updatedConfig = {
      ...systemConfig,
      storage: {
        ...systemConfig.storage,
        ...config,
        lastUpdated: new Date().toISOString(),
      } as StorageConfig,
    };
    
    setSystemConfig(updatedConfig);
    
    // Only sync if system is already initialized (post-setup changes)
    if (systemConfig.initialized && apiConnected) {
      await syncConfigToBackend(updatedConfig);
    }
  }, [apiConnected, systemConfig, syncConfigToBackend]);

  // Wizard navigation
  const nextStep = () => {
    setWizardState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.steps.length - 1),
    }));
  };

  const prevStep = () => {
    setWizardState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  };

  const goToStep = (stepIndex: number) => {
    setWizardState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(stepIndex, prev.steps.length - 1)),
    }));
  };

  const skipStep = (stepId: string) => {
    setWizardState(prev => ({
      ...prev,
      skippedSteps: [...prev.skippedSteps, stepId],
    }));
    nextStep();
  };

  const completeStep = (stepId: string) => {
    setWizardState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      ),
    }));
  };

  const completeWizard = useCallback(async (): Promise<AdminCredentials | null> => {
    // Re-check API connection before completing
    const isApiAvailable = await healthApi.checkApi();
    if (!isApiAvailable) {
      throw new Error('Cannot complete wizard: Backend API not connected. Please ensure the server is running.');
    }
    setApiConnected(true);
    
    // Update local state
    setWizardState(prev => ({
      ...prev,
      isComplete: true,
      steps: prev.steps.map(step => ({ ...step, completed: true })),
    }));
    
    const updatedConfig = {
      ...systemConfig,
      initialized: true,
      setupCompletedAt: new Date().toISOString(),
    };
    
    setSystemConfig(updatedConfig);
    
    // Sync with backend
    try {
      const result = await systemConfigApi.completeSetup();
      
      // Check if admin credentials were returned
      if (result.adminCredentials) {
        setAdminCredentials(result.adminCredentials);
        setAppMode('admin');
        return result.adminCredentials;
      }
      
      setAppMode('admin');
      return null;
    } catch (err) {
      console.error('Failed to sync wizard completion with backend:', err);
      throw err;
    }
  }, [systemConfig]);

  const resetWizard = useCallback(async () => {
    if (!apiConnected) {
      throw new Error('Cannot reset wizard: Backend API not connected');
    }
    
    setWizardState(defaultWizardState);
    setSystemConfig(defaultSystemConfig);
    
    // Sync with backend
    try {
      await systemConfigApi.resetSetup();
    } catch (err) {
      console.error('Failed to sync wizard reset with backend:', err);
      throw err;
    }
    
    setAppMode('setup');
  }, [apiConnected]);

  // Connection testing functions
  const testDatabaseConnection = useCallback(async (config: TestDatabaseConnectionDto): Promise<TestConnectionResult> => {
    try {
      const result = await systemConfigApi.testDatabaseConnection(config);
      setConnectionStatus(prev => ({
        ...prev,
        database: {
          tested: true,
          connected: result.success,
          error: result.success ? undefined : result.message,
        },
      }));
      return result;
    } catch (err: any) {
      const errorResult = { success: false, message: err.message || 'Connection test failed' };
      setConnectionStatus(prev => ({
        ...prev,
        database: { tested: true, connected: false, error: errorResult.message },
      }));
      return errorResult;
    }
  }, []);

  const testAIConnection = useCallback(async (config: TestAIConnectionDto): Promise<TestConnectionResult> => {
    try {
      const result = await systemConfigApi.testAIConnection(config);
      setConnectionStatus(prev => ({
        ...prev,
        ai: {
          tested: true,
          connected: result.success,
          error: result.success ? undefined : result.message,
        },
      }));
      return result;
    } catch (err: any) {
      const errorResult = { success: false, message: err.message || 'Connection test failed' };
      setConnectionStatus(prev => ({
        ...prev,
        ai: { tested: true, connected: false, error: errorResult.message },
      }));
      return errorResult;
    }
  }, []);

  const testPaymentConnection = useCallback(async (config: TestPaymentConnectionDto): Promise<TestConnectionResult> => {
    try {
      const result = await systemConfigApi.testPaymentConnection(config);
      setConnectionStatus(prev => ({
        ...prev,
        payment: {
          tested: true,
          connected: result.success,
          error: result.success ? undefined : result.message,
        },
      }));
      return result;
    } catch (err: any) {
      const errorResult = { success: false, message: err.message || 'Connection test failed' };
      setConnectionStatus(prev => ({
        ...prev,
        payment: { tested: true, connected: false, error: errorResult.message },
      }));
      return errorResult;
    }
  }, []);

  // Clear admin credentials (after user has saved them)
  const clearAdminCredentials = useCallback(() => {
    setAdminCredentials(null);
  }, []);

  // Refresh config from backend
  const refreshConfig = useCallback(async () => {
    await loadConfigFromBackend();
  }, [loadConfigFromBackend]);

  // Validation helpers
  const validateDatabaseConfig = (): boolean => {
    const { database } = systemConfig;
    if (database.provider === 'none') return true; // Skip is valid
    
    switch (database.provider) {
      case 'firebase':
        const fb = database as any;
        return !!(fb.apiKey && fb.projectId);
      case 'mongodb':
        const mongo = database as any;
        return !!(mongo.connectionString);
      case 'dynamodb':
        const dynamo = database as any;
        return !!(dynamo.region && dynamo.accessKeyId && dynamo.secretAccessKey);
      case 'supabase':
        const supa = database as any;
        return !!(supa.url && supa.anonKey);
      default:
        return false;
    }
  };

  const validateAIConfig = (): boolean => {
    const { ai } = systemConfig;
    if (ai.provider === 'none') return true;
    
    switch (ai.provider) {
      case 'gemini':
      case 'openai':
      case 'anthropic':
        return !!(ai as any).apiKey;
      default:
        return false;
    }
  };

  const validatePaymentConfig = (): boolean => {
    const { payment } = systemConfig;
    if (payment.provider === 'none') return true;
    
    switch (payment.provider) {
      case 'stripe':
        const stripe = payment as any;
        return !!(stripe.publishableKey && stripe.secretKey);
      case 'paypal':
        const pp = payment as any;
        return !!(pp.clientId && pp.clientSecret);
      case 'square':
        const sq = payment as any;
        return !!(sq.applicationId && sq.accessToken);
      default:
        return false;
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        systemConfig,
        updateDatabaseConfig,
        updateAIConfig,
        updatePaymentConfig,
        updateStorageConfig,
        wizardState,
        nextStep,
        prevStep,
        goToStep,
        skipStep,
        completeStep,
        completeWizard,
        resetWizard,
        appMode,
        setAppMode,
        isLoading,
        apiConnected,
        error,
        testDatabaseConnection,
        testAIConnection,
        testPaymentConnection,
        adminCredentials,
        clearAdminCredentials,
        connectionStatus,
        validateDatabaseConfig,
        validateAIConfig,
        validatePaymentConfig,
        refreshConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
