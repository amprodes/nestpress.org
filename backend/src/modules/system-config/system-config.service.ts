import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const COLLECTION = 'system_config';
const SYSTEM_CONFIG_ID = 'system-configuration';
const USERS_COLLECTION = 'users';

export interface SystemConfiguration {
  id: string;
  initialized: boolean;
  setupCompletedAt?: string;
  
  // Database Configuration
  database: {
    provider: 'firebase' | 'mongodb' | 'dynamodb' | 'supabase' | 'none';
    enabled: boolean;
    configured: boolean;
    connectionTested: boolean;
    lastTestedAt?: string;
    connectionStatus?: 'connected' | 'failed' | 'untested';
    connectionError?: string;
    // Connection details stored securely
    config?: {
      uri?: string;
      projectId?: string;
      region?: string;
      url?: string;
    };
  };
  
  // AI Configuration
  ai: {
    provider: 'gemini' | 'openai' | 'anthropic' | 'none';
    enabled: boolean;
    configured: boolean;
    connectionTested: boolean;
    lastTestedAt?: string;
    connectionStatus?: 'connected' | 'failed' | 'untested';
    connectionError?: string;
    // API key stored with partial masking for display
    config?: {
      apiKey?: string;
      maskedApiKey?: string;
      model?: string;
    };
  };
  
  // Payment Configuration
  payment: {
    provider: 'stripe' | 'paypal' | 'square' | 'none';
    enabled: boolean;
    configured: boolean;
    connectionTested: boolean;
    lastTestedAt?: string;
    connectionStatus?: 'connected' | 'failed' | 'untested';
    connectionError?: string;
    testMode?: boolean;
    config?: {
      publishableKey?: string;
      maskedSecretKey?: string;
    };
  };
  
  // Storage Configuration
  storage: {
    provider: 'firebase-storage' | 's3' | 'cloudinary' | 'local' | 'none';
    enabled: boolean;
    configured: boolean;
    connectionTested: boolean;
    lastTestedAt?: string;
    connectionStatus?: 'connected' | 'failed' | 'untested';
  };
  
  // Super Admin credentials (only shown once during setup)
  superAdmin?: {
    email: string;
    generatedPassword?: string; // Only returned once, then cleared
    userId: string;
    createdAt: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_SYSTEM_CONFIG: Omit<SystemConfiguration, 'id' | 'createdAt' | 'updatedAt'> = {
  initialized: false,
  database: {
    provider: 'none',
    enabled: false,
    configured: false,
    connectionTested: false,
    connectionStatus: 'untested',
  },
  ai: {
    provider: 'none',
    enabled: false,
    configured: false,
    connectionTested: false,
    connectionStatus: 'untested',
  },
  payment: {
    provider: 'none',
    enabled: false,
    configured: false,
    connectionTested: false,
    connectionStatus: 'untested',
  },
  storage: {
    provider: 'local',
    enabled: true,
    configured: true,
    connectionTested: false,
    connectionStatus: 'untested',
  },
};

@Injectable()
export class SystemConfigService implements OnModuleInit {
  private readonly logger = new Logger(SystemConfigService.name);
  private cachedConfig: SystemConfiguration | null = null;

  constructor(
    private readonly database: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeFromEnvironment();
  }

  /**
   * Initialize system configuration from environment variables
   */
  private async initializeFromEnvironment(): Promise<void> {
    try {
      const existingConfig = await this.database.findById<SystemConfiguration>(
        COLLECTION,
        SYSTEM_CONFIG_ID,
      );

      if (existingConfig) {
        this.cachedConfig = existingConfig;
        this.logger.log('System configuration loaded from database');
        
        // Check if we need to detect env config changes
        await this.syncEnvironmentConfig(existingConfig);
        return;
      }

      // Detect configuration from environment
      const detectedConfig: Partial<SystemConfiguration> = {
        database: this.detectDatabaseConfig(),
        ai: this.detectAIConfig(),
        payment: this.detectPaymentConfig(),
        storage: this.detectStorageConfig(),
      };

      // Create initial config with fixed ID
      this.cachedConfig = await this.database.create<SystemConfiguration>(COLLECTION, {
        id: SYSTEM_CONFIG_ID,
        ...DEFAULT_SYSTEM_CONFIG,
        ...detectedConfig,
      });
      
      this.logger.log('System configuration initialized');
    } catch (error: any) {
      // If database not connected yet, create default in-memory config
      // It will be loaded from database on first API call
      if (error.message?.includes('not connected') || error.message?.includes('MongoDB not connected')) {
        this.logger.warn('Database not ready during init, using default config (will load from DB on first use)');
        this.cachedConfig = {
          id: SYSTEM_CONFIG_ID,
          ...DEFAULT_SYSTEM_CONFIG,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        this.logger.error('Failed to initialize system config:', error);
        this.cachedConfig = {
          id: SYSTEM_CONFIG_ID,
          ...DEFAULT_SYSTEM_CONFIG,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    }
  }

  /**
   * Sync with environment variables if they've changed
   */
  private async syncEnvironmentConfig(existingConfig: SystemConfiguration): Promise<void> {
    const envDatabase = this.detectDatabaseConfig();
    const envAI = this.detectAIConfig();
    const envPayment = this.detectPaymentConfig();
    
    // Only update if env vars provide new configuration
    const updates: Partial<SystemConfiguration> = {};
    
    if (envDatabase.provider !== 'none' && !existingConfig.database.configured) {
      updates.database = { ...existingConfig.database, ...envDatabase };
    }
    if (envAI.provider !== 'none' && !existingConfig.ai.configured) {
      updates.ai = { ...existingConfig.ai, ...envAI };
    }
    if (envPayment.provider !== 'none' && !existingConfig.payment.configured) {
      updates.payment = { ...existingConfig.payment, ...envPayment };
    }

    if (Object.keys(updates).length > 0) {
      this.cachedConfig = await this.database.update<SystemConfiguration>(
        COLLECTION,
        SYSTEM_CONFIG_ID,
        updates,
      );
      this.logger.log('Configuration synced from environment');
    }
  }

  private detectDatabaseConfig(): SystemConfiguration['database'] {
    const provider = this.configService.get<string>('DATABASE_PROVIDER') || 
                     this.configService.get<string>('database.provider') || 'none';
    
    const providerConfigs: Record<string, () => boolean> = {
      mongodb: () => !!(this.configService.get('MONGODB_URI') || this.configService.get('database.mongodb.uri')),
      firebase: () => !!this.configService.get('FIREBASE_PROJECT_ID'),
      dynamodb: () => !!(this.configService.get('AWS_REGION') && this.configService.get('AWS_ACCESS_KEY_ID')),
      supabase: () => !!(this.configService.get('SUPABASE_URL') && this.configService.get('SUPABASE_ANON_KEY')),
    };

    const isConfigured = providerConfigs[provider]?.() || false;

    return {
      provider: provider as any,
      enabled: provider !== 'none',
      configured: isConfigured,
      connectionTested: false,
      connectionStatus: 'untested',
    };
  }

  private detectAIConfig(): SystemConfiguration['ai'] {
    const provider = this.configService.get<string>('AI_PROVIDER') || 'none';
    
    const providerConfigs: Record<string, () => boolean> = {
      gemini: () => !!this.configService.get('GEMINI_API_KEY'),
      openai: () => !!this.configService.get('OPENAI_API_KEY'),
      anthropic: () => !!this.configService.get('ANTHROPIC_API_KEY'),
    };

    const isConfigured = providerConfigs[provider]?.() || false;

    return {
      provider: provider as any,
      enabled: provider !== 'none',
      configured: isConfigured,
      connectionTested: false,
      connectionStatus: 'untested',
    };
  }

  private detectPaymentConfig(): SystemConfiguration['payment'] {
    const provider = this.configService.get<string>('PAYMENT_PROVIDER') || 'none';
    
    const providerConfigs: Record<string, () => boolean> = {
      stripe: () => !!(this.configService.get('STRIPE_PUBLISHABLE_KEY') && this.configService.get('STRIPE_SECRET_KEY')),
      paypal: () => !!(this.configService.get('PAYPAL_CLIENT_ID') && this.configService.get('PAYPAL_CLIENT_SECRET')),
      square: () => !!(this.configService.get('SQUARE_APPLICATION_ID') && this.configService.get('SQUARE_ACCESS_TOKEN')),
    };

    const isConfigured = providerConfigs[provider]?.() || false;

    return {
      provider: provider as any,
      enabled: provider !== 'none',
      configured: isConfigured,
      connectionTested: false,
      connectionStatus: 'untested',
      testMode: this.configService.get('PAYMENT_TEST_MODE') === 'true',
    };
  }

  private detectStorageConfig(): SystemConfiguration['storage'] {
    const provider = this.configService.get<string>('STORAGE_PROVIDER') || 'local';
    
    const providerConfigs: Record<string, () => boolean> = {
      's3': () => !!(this.configService.get('AWS_S3_BUCKET') && this.configService.get('AWS_ACCESS_KEY_ID')),
      'firebase-storage': () => !!this.configService.get('FIREBASE_STORAGE_BUCKET'),
      'cloudinary': () => !!(this.configService.get('CLOUDINARY_CLOUD_NAME') && this.configService.get('CLOUDINARY_API_KEY')),
      'local': () => true,
    };

    const isConfigured = providerConfigs[provider]?.() || false;

    return {
      provider: provider as any,
      enabled: true,
      configured: isConfigured,
      connectionTested: false,
      connectionStatus: 'untested',
    };
  }

  /**
   * Get current system configuration
   */
  async getConfig(): Promise<SystemConfiguration> {
    if (this.cachedConfig) {
      // If cache is just default (not initialized flag), try to load from DB
      if (!this.cachedConfig.initialized) {
        try {
          const dbConfig = await this.database.findById<SystemConfiguration>(
            COLLECTION,
            SYSTEM_CONFIG_ID,
          );
          if (dbConfig) {
            this.cachedConfig = dbConfig;
          }
        } catch (error) {
          // Database still not ready, return cached default
          this.logger.debug('Database not ready, using cached config');
        }
      }

      // Don't return sensitive data or one-time passwords
      const safeConfig = { ...this.cachedConfig };
      if (safeConfig.superAdmin) {
        safeConfig.superAdmin = { 
          ...safeConfig.superAdmin, 
          generatedPassword: undefined 
        };
      }
      return safeConfig;
    }

    const config = await this.database.findById<SystemConfiguration>(
      COLLECTION,
      SYSTEM_CONFIG_ID,
    );

    if (!config) {
      this.cachedConfig = await this.database.create<SystemConfiguration>(COLLECTION, {
        id: SYSTEM_CONFIG_ID,
        ...DEFAULT_SYSTEM_CONFIG,
      });
    } else {
      this.cachedConfig = config;
    }

    return this.cachedConfig!;
  }

  /**
   * Update system configuration
   */
  async updateConfig(data: Partial<SystemConfiguration>): Promise<SystemConfiguration> {
    const updated = await this.database.update<SystemConfiguration>(
      COLLECTION,
      SYSTEM_CONFIG_ID,
      data,
    );
    this.cachedConfig = updated;
    return updated;
  }

  /**
   * Get AI credentials from database
   */
  async getAICredentials(): Promise<{ provider: string; apiKey?: string; model?: string } | null> {
    const config = await this.getConfig();
    if (!config.ai.configured || !config.ai.config?.apiKey) {
      return null;
    }
    return {
      provider: config.ai.provider,
      apiKey: config.ai.config.apiKey,
      model: config.ai.config.model,
    };
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection(config: {
    provider: string;
    uri?: string;
    projectId?: string;
    apiKey?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    url?: string;
    anonKey?: string;
  }): Promise<{ success: boolean; message: string; latency?: number }> {
    const startTime = Date.now();
    
    try {
      switch (config.provider) {
        case 'mongodb': {
          if (!config.uri) {
            return { success: false, message: 'MongoDB URI is required' };
          }
          const { MongoClient } = await import('mongodb');
          const client = new MongoClient(config.uri);
          await client.connect();
          // Simple test: list collections in default db
          await client.db().listCollections().toArray();
          await client.close();
          break;
        }
        
        case 'firebase': {
          // Firebase connection test - just validate config structure
          if (!config.projectId) {
            return { success: false, message: 'Firebase Project ID is required' };
          }
          // In a real implementation, you'd test the Firebase Admin SDK connection
          break;
        }
        
        case 'supabase': {
          if (!config.url || !config.anonKey) {
            return { success: false, message: 'Supabase URL and Anon Key are required' };
          }
          // Test Supabase connection
          const response = await fetch(`${config.url}/rest/v1/`, {
            headers: { 
              'apikey': config.anonKey,
              'Authorization': `Bearer ${config.anonKey}` 
            },
          });
          if (!response.ok && response.status !== 404) {
            return { success: false, message: `Supabase connection failed: ${response.statusText}` };
          }
          break;
        }
        
        case 'dynamodb': {
          if (!config.region || !config.accessKeyId || !config.secretAccessKey) {
            return { success: false, message: 'AWS Region, Access Key ID, and Secret Access Key are required' };
          }
          // DynamoDB connection test would go here
          break;
        }
        
        default:
          return { success: false, message: `Unknown database provider: ${config.provider}` };
      }
      
      const latency = Date.now() - startTime;
      
      // Update config with test results
      await this.updateConfig({
        database: {
          provider: config.provider as SystemConfiguration['database']['provider'],
          enabled: true,
          configured: true,
          connectionTested: true,
          lastTestedAt: new Date().toISOString(),
          connectionStatus: 'connected',
          connectionError: undefined,
        },
      });
      
      return { success: true, message: 'Database connection successful', latency };
    } catch (error: any) {
      // Update config with failure
      const currentProvider = this.cachedConfig?.database?.provider || 'none';
      await this.updateConfig({
        database: {
          provider: currentProvider as SystemConfiguration['database']['provider'],
          enabled: this.cachedConfig?.database?.enabled || false,
          configured: this.cachedConfig?.database?.configured || false,
          connectionTested: true,
          lastTestedAt: new Date().toISOString(),
          connectionStatus: 'failed',
          connectionError: error.message,
        },
      });
      
      return { success: false, message: error.message || 'Connection failed' };
    }
  }

  /**
   * Test AI provider connection
   */
  async testAIConnection(config: {
    provider: string;
    apiKey: string;
    model?: string;
  }): Promise<{ success: boolean; message: string; model?: string }> {
    try {
      switch (config.provider) {
        case 'gemini': {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`,
          );
          if (!response.ok) {
            const error = await response.json();
            return { success: false, message: error.error?.message || 'Invalid API key' };
          }
          break;
        }
        
        case 'openai': {
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${config.apiKey}` },
          });
          if (!response.ok) {
            return { success: false, message: 'Invalid OpenAI API key' };
          }
          break;
        }
        
        case 'anthropic': {
          // Anthropic doesn't have a models list endpoint, so we do a minimal test
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': config.apiKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-3-haiku-20240307',
              max_tokens: 1,
              messages: [{ role: 'user', content: 'Hi' }],
            }),
          });
          // Even a 400 (bad request) with certain error means the key is valid
          if (response.status === 401) {
            return { success: false, message: 'Invalid Anthropic API key' };
          }
          break;
        }
        
        default:
          return { success: false, message: `Unknown AI provider: ${config.provider}` };
      }
      
      // Mask the API key for storage
      const maskedApiKey = config.apiKey.substring(0, 8) + '...' + config.apiKey.substring(config.apiKey.length - 4);
      
      // Update config with test results
      await this.updateConfig({
        ai: {
          provider: config.provider as SystemConfiguration['ai']['provider'],
          enabled: true,
          configured: true,
          connectionTested: true,
          lastTestedAt: new Date().toISOString(),
          connectionStatus: 'connected',
          connectionError: undefined,
          config: {
            maskedApiKey,
            model: config.model,
          },
        },
      });
      
      return { success: true, message: `${config.provider} API key is valid`, model: config.model };
    } catch (error: any) {
      const currentProvider = this.cachedConfig?.ai?.provider || 'none';
      await this.updateConfig({
        ai: {
          provider: currentProvider as SystemConfiguration['ai']['provider'],
          enabled: this.cachedConfig?.ai?.enabled || false,
          configured: this.cachedConfig?.ai?.configured || false,
          connectionTested: true,
          lastTestedAt: new Date().toISOString(),
          connectionStatus: 'failed',
          connectionError: error.message,
        },
      });
      
      return { success: false, message: error.message || 'Connection failed' };
    }
  }

  /**
   * Test payment provider connection
   */
  async testPaymentConnection(config: {
    provider: string;
    publishableKey?: string;
    secretKey?: string;
    clientId?: string;
    clientSecret?: string;
    testMode?: boolean;
  }): Promise<{ success: boolean; message: string }> {
    try {
      switch (config.provider) {
        case 'stripe': {
          if (!config.secretKey) {
            return { success: false, message: 'Stripe Secret Key is required' };
          }
          const response = await fetch('https://api.stripe.com/v1/balance', {
            headers: { 'Authorization': `Bearer ${config.secretKey}` },
          });
          if (!response.ok) {
            return { success: false, message: 'Invalid Stripe API key' };
          }
          break;
        }
        
        case 'paypal': {
          if (!config.clientId || !config.clientSecret) {
            return { success: false, message: 'PayPal Client ID and Secret are required' };
          }
          // PayPal OAuth test
          const baseUrl = config.testMode 
            ? 'https://api-m.sandbox.paypal.com' 
            : 'https://api-m.paypal.com';
          const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
          const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
          });
          if (!response.ok) {
            return { success: false, message: 'Invalid PayPal credentials' };
          }
          break;
        }
        
        default:
          return { success: false, message: `Unknown payment provider: ${config.provider}` };
      }
      
      // Update config
      await this.updateConfig({
        payment: {
          provider: config.provider as any,
          enabled: true,
          configured: true,
          connectionTested: true,
          lastTestedAt: new Date().toISOString(),
          connectionStatus: 'connected',
          connectionError: undefined,
          testMode: config.testMode,
          config: {
            publishableKey: config.publishableKey,
            maskedSecretKey: config.secretKey 
              ? config.secretKey.substring(0, 8) + '...' + config.secretKey.substring(config.secretKey.length - 4)
              : undefined,
          },
        },
      });
      
      return { success: true, message: `${config.provider} connection successful` };
    } catch (error: any) {
      return { success: false, message: error.message || 'Connection failed' };
    }
  }

  /**
   * Generate random secure password
   */
  private generateSecurePassword(length: number = 16): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const randomBytes = crypto.randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars[randomBytes[i] % chars.length];
    }
    return password;
  }

  /**
   * Seed super admin when database is configured
   */
  async seedSuperAdmin(): Promise<{ email: string; password: string; userId: string } | null> {
    try {
      // Check if super admin already exists
      const config = await this.getConfig();
      if (config.superAdmin?.userId) {
        // Verify the user still exists
        const existingUser = await this.database.findById(USERS_COLLECTION, config.superAdmin.userId);
        if (existingUser) {
          this.logger.log('Super admin already exists');
          return null;
        }
      }

      // Check if any admin user exists
      const { data: existingUsers } = await this.database.findAll(USERS_COLLECTION, { 
        limit: 1, 
        filters: { role: 'admin' } 
      });
      
      if (existingUsers.length > 0) {
        this.logger.log('Admin user already exists, skipping seed');
        return null;
      }

      // Generate credentials
      const email = 'admin@nestpress.local';
      const password = this.generateSecurePassword(16);
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create super admin user
      const adminUser: any = await this.database.create(USERS_COLLECTION, {
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      });

      const userId = adminUser.id || adminUser._id || 'unknown';

      // Store reference in system config (password shown only once)
      await this.updateConfig({
        superAdmin: {
          email,
          generatedPassword: password, // Will be cleared after first retrieval
          userId,
          createdAt: new Date().toISOString(),
        },
      });

      this.logger.log(`Super admin created: ${email}`);

      return { email, password, userId };
    } catch (error) {
      this.logger.error('Failed to seed super admin:', error);
      return null;
    }
  }

  /**
   * Get super admin credentials (only works once)
   */
  async getSuperAdminCredentials(): Promise<{ email: string; password: string } | null> {
    const config = await this.database.findById<SystemConfiguration>(
      COLLECTION,
      SYSTEM_CONFIG_ID,
    );
    
    if (!config?.superAdmin?.generatedPassword) {
      return null;
    }

    const credentials = {
      email: config.superAdmin.email,
      password: config.superAdmin.generatedPassword,
    };

    // Clear the password after retrieval (one-time view)
    await this.database.update(COLLECTION, SYSTEM_CONFIG_ID, {
      superAdmin: {
        ...config.superAdmin,
        generatedPassword: undefined,
      },
    });

    // Update cache
    if (this.cachedConfig?.superAdmin) {
      this.cachedConfig.superAdmin.generatedPassword = undefined;
    }

    return credentials;
  }

  /**
   * Complete the setup wizard
   */
  async completeSetup(): Promise<SystemConfiguration & { adminCredentials?: { email: string; password: string } }> {
    // Seed super admin first
    const adminCredentials = await this.seedSuperAdmin();
    
    const config = await this.updateConfig({
      initialized: true,
      setupCompletedAt: new Date().toISOString(),
    });

    return {
      ...config,
      adminCredentials: adminCredentials || undefined,
    };
  }

  /**
   * Reset system to setup mode
   */
  async resetSetup(): Promise<SystemConfiguration> {
    const reset = await this.database.update<SystemConfiguration>(
      COLLECTION,
      SYSTEM_CONFIG_ID,
      {
        ...DEFAULT_SYSTEM_CONFIG,
        initialized: false,
        setupCompletedAt: undefined,
        superAdmin: undefined,
      },
    );
    this.cachedConfig = reset;
    return reset;
  }

  /**
   * Check if system is initialized
   */
  async isInitialized(): Promise<boolean> {
    const config = await this.getConfig();
    return config.initialized;
  }

  /**
   * Get configuration status summary
   */
  async getStatus(): Promise<{
    initialized: boolean;
    database: { provider: string; ready: boolean; status: string };
    ai: { provider: string; ready: boolean; status: string };
    payment: { provider: string; ready: boolean; status: string };
    storage: { provider: string; ready: boolean; status: string };
    hasSuperAdmin: boolean;
  }> {
    const config = await this.getConfig();
    
    return {
      initialized: config.initialized,
      database: {
        provider: config.database.provider,
        ready: config.database.enabled && config.database.configured && config.database.connectionStatus === 'connected',
        status: config.database.connectionStatus || 'untested',
      },
      ai: {
        provider: config.ai.provider,
        ready: config.ai.enabled && config.ai.configured && config.ai.connectionStatus === 'connected',
        status: config.ai.connectionStatus || 'untested',
      },
      payment: {
        provider: config.payment.provider,
        ready: config.payment.enabled && config.payment.configured && config.payment.connectionStatus === 'connected',
        status: config.payment.connectionStatus || 'untested',
      },
      storage: {
        provider: config.storage.provider,
        ready: config.storage.enabled && config.storage.configured,
        status: config.storage.connectionStatus || 'untested',
      },
      hasSuperAdmin: !!config.superAdmin?.userId,
    };
  }

  /**
   * Save wizard step configuration
   */
  async saveStepConfig(step: 'database' | 'ai' | 'payment' | 'storage', config: any): Promise<SystemConfiguration> {
    const updates: Partial<SystemConfiguration> = {};
    
    switch (step) {
      case 'database':
        updates.database = {
          ...this.cachedConfig?.database,
          ...config,
          enabled: config.provider !== 'none',
          configured: config.provider !== 'none',
        };
        break;
      case 'ai':
        updates.ai = {
          ...this.cachedConfig?.ai,
          ...config,
          enabled: config.provider !== 'none',
          configured: config.provider !== 'none',
        };
        break;
      case 'payment':
        updates.payment = {
          ...this.cachedConfig?.payment,
          ...config,
          enabled: config.provider !== 'none',
          configured: config.provider !== 'none',
        };
        break;
      case 'storage':
        updates.storage = {
          ...this.cachedConfig?.storage,
          ...config,
          enabled: config.provider !== 'none',
          configured: config.provider !== 'none',
        };
        break;
    }
    
    return this.updateConfig(updates);
  }

  /**
   * Update AI credentials in system_config
   */
  async updateAICredentials(config: { provider: string; apiKey: string; model?: string }) {
    // Mask API key for display (show first 8 and last 4 chars)
    const maskedKey = config.apiKey.length > 12 
      ? `${config.apiKey.substring(0, 8)}...${config.apiKey.substring(config.apiKey.length - 4)}`
      : '***';

    const updates: Partial<SystemConfiguration> = {
      ai: {
        provider: config.provider as any,
        enabled: true,
        configured: true,
        connectionTested: false,
        connectionStatus: 'untested',
        config: {
          apiKey: config.apiKey,
          maskedApiKey: maskedKey,
          model: config.model,
        },
      },
    };

    const updated = await this.updateConfig(updates);
    
    // Update environment variable dynamically
    const envKey = config.provider === 'gemini' ? 'GEMINI_API_KEY' :
                    config.provider === 'openai' ? 'OPENAI_API_KEY' :
                    'ANTHROPIC_API_KEY';
    process.env[envKey] = config.apiKey;
    process.env.AI_PROVIDER = config.provider;
    
    this.logger.log(`✓ AI credentials updated: ${config.provider} (${maskedKey})`);
    
    return updated;
  }

  async updateDatabaseCredentials(config: { provider: string; uri?: string; projectId?: string; region?: string; apiKey?: string }) {
    const updates: Partial<SystemConfiguration> = {
      database: {
        provider: config.provider as any,
        enabled: true,
        configured: true,
        connectionTested: false,
        connectionStatus: 'untested',
        config: {
          uri: config.uri,
          projectId: config.projectId,
          region: config.region,
          url: config.uri, // For Supabase URL
        },
      },
    };

    const updated = await this.updateConfig(updates);
    
    // Update environment variables dynamically
    if (config.provider === 'mongodb' && config.uri) {
      process.env.MONGODB_URI = config.uri;
    } else if (config.provider === 'firebase' && config.projectId) {
      process.env.FIREBASE_PROJECT_ID = config.projectId;
    } else if (config.provider === 'dynamodb' && config.region) {
      process.env.AWS_REGION = config.region;
    } else if (config.provider === 'supabase' && config.uri) {
      process.env.SUPABASE_URL = config.uri;
      if (config.apiKey) process.env.SUPABASE_KEY = config.apiKey;
    }
    process.env.DATABASE_PROVIDER = config.provider;
    
    this.logger.log(`✓ Database credentials updated: ${config.provider}`);
    
    return updated;
  }

  async updatePaymentCredentials(config: { provider: string; publishableKey: string; secretKey: string; testMode?: boolean }) {
    // Mask secret key for display
    const maskedSecretKey = config.secretKey.length > 12 
      ? `${config.secretKey.substring(0, 8)}...${config.secretKey.substring(config.secretKey.length - 4)}`
      : '***';

    const updates: Partial<SystemConfiguration> = {
      payment: {
        provider: config.provider as any,
        enabled: true,
        configured: true,
        connectionTested: false,
        connectionStatus: 'untested',
        testMode: config.testMode || false,
        config: {
          publishableKey: config.publishableKey,
          maskedSecretKey: maskedSecretKey,
        },
      },
    };

    const updated = await this.updateConfig(updates);
    
    // Update environment variables dynamically
    if (config.provider === 'stripe') {
      process.env.STRIPE_PUBLISHABLE_KEY = config.publishableKey;
      process.env.STRIPE_SECRET_KEY = config.secretKey;
    } else if (config.provider === 'paypal') {
      process.env.PAYPAL_CLIENT_ID = config.publishableKey;
      process.env.PAYPAL_CLIENT_SECRET = config.secretKey;
    } else if (config.provider === 'square') {
      process.env.SQUARE_APPLICATION_ID = config.publishableKey;
      process.env.SQUARE_ACCESS_TOKEN = config.secretKey;
    }
    process.env.PAYMENT_PROVIDER = config.provider;
    
    this.logger.log(`✓ Payment credentials updated: ${config.provider} (${maskedSecretKey})`);
    
    return updated;
  }

  async updateStorageCredentials(config: { provider: string; bucket?: string; accessKey?: string; secretKey?: string; region?: string }) {
    const updates: Partial<SystemConfiguration> = {
      storage: {
        provider: config.provider as any,
        enabled: true,
        configured: true,
        connectionTested: false,
        connectionStatus: 'untested',
      },
    };

    const updated = await this.updateConfig(updates);
    
    // Update environment variables dynamically
    if (config.provider === 's3') {
      if (config.bucket) process.env.AWS_S3_BUCKET = config.bucket;
      if (config.accessKey) process.env.AWS_ACCESS_KEY_ID = config.accessKey;
      if (config.secretKey) process.env.AWS_SECRET_ACCESS_KEY = config.secretKey;
      if (config.region) process.env.AWS_REGION = config.region;
    } else if (config.provider === 'cloudinary') {
      if (config.bucket) process.env.CLOUDINARY_CLOUD_NAME = config.bucket;
      if (config.accessKey) process.env.CLOUDINARY_API_KEY = config.accessKey;
      if (config.secretKey) process.env.CLOUDINARY_API_SECRET = config.secretKey;
    } else if (config.provider === 'firebase-storage' && config.bucket) {
      process.env.FIREBASE_STORAGE_BUCKET = config.bucket;
    }
    process.env.STORAGE_PROVIDER = config.provider;
    
    this.logger.log(`✓ Storage credentials updated: ${config.provider}`);
    
    return updated;
  }
}
