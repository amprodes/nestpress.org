import * as Joi from 'joi';

/**
 * Configuration validation schema using Joi
 * Validates all environment variables on application startup
 * 
 * Note: Provider-specific credentials are only validated when that provider is selected.
 * Empty strings are treated as undefined to allow unused providers to have empty values.
 */
export const configValidationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  // JWT (required for production, has defaults for development)
  JWT_SECRET: Joi.string().min(32).default('nestpress-dev-secret-key-change-in-production-32chars'),
  JWT_EXPIRATION: Joi.string().default('24h'),
  JWT_REFRESH_SECRET: Joi.string().min(32).default('nestpress-dev-refresh-secret-change-in-prod-32char'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // Database Provider - defaults to mongodb for local development
  DATABASE_PROVIDER: Joi.string()
    .valid('firebase', 'mongodb', 'dynamodb', 'supabase')
    .default('mongodb'),

  // Firebase (optional - only needed when DATABASE_PROVIDER=firebase)
  FIREBASE_PROJECT_ID: Joi.string().allow('').optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().allow('').optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().allow('').optional(),
  FIREBASE_DATABASE_URL: Joi.string().allow('').optional(),

  // MongoDB (has sensible default for local development)
  MONGODB_URI: Joi.string().default('mongodb://localhost:27017/nestpress'),

  // DynamoDB (optional - only needed when DATABASE_PROVIDER=dynamodb)
  AWS_REGION: Joi.string().allow('').default('us-east-1'),
  AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  DYNAMODB_ENDPOINT: Joi.string().allow('').optional(),

  // Supabase (optional - only needed when DATABASE_PROVIDER=supabase)
  SUPABASE_URL: Joi.string().allow('').optional(),
  SUPABASE_KEY: Joi.string().allow('').optional(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().allow('').optional(),

  // AI Provider - optional, features work without it
  AI_PROVIDER: Joi.string()
    .valid('gemini', 'openai', 'anthropic', 'none')
    .default('none'),
  GEMINI_API_KEY: Joi.string().allow('').optional(),
  OPENAI_API_KEY: Joi.string().allow('').optional(),
  OPENAI_MODEL: Joi.string().default('gpt-4-turbo-preview'),
  ANTHROPIC_API_KEY: Joi.string().allow('').optional(),
  ANTHROPIC_MODEL: Joi.string().default('claude-3-opus-20240229'),

  // Payment Provider - optional, e-commerce works without it
  PAYMENT_PROVIDER: Joi.string()
    .valid('stripe', 'paypal', 'square', 'none')
    .default('none'),
  STRIPE_SECRET_KEY: Joi.string().allow('').optional(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().allow('').optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().allow('').optional(),
  PAYPAL_CLIENT_ID: Joi.string().allow('').optional(),
  PAYPAL_CLIENT_SECRET: Joi.string().allow('').optional(),
  PAYPAL_MODE: Joi.string().valid('sandbox', 'live').default('sandbox'),
  SQUARE_ACCESS_TOKEN: Joi.string().allow('').optional(),
  SQUARE_ENVIRONMENT: Joi.string().valid('sandbox', 'production').default('sandbox'),
  SQUARE_APPLICATION_ID: Joi.string().allow('').optional(),

  // CORS
  CORS_ORIGINS: Joi.string().default('http://localhost:5173,http://localhost:3001'),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),

  // Media
  MEDIA_UPLOAD_PATH: Joi.string().default('./uploads'),
  MEDIA_MAX_SIZE: Joi.number().default(10485760), // 10MB
});
