import { registerAs } from '@nestjs/config';

export type DatabaseProvider = 'firebase' | 'mongodb' | 'dynamodb' | 'supabase';

/**
 * Database configuration namespace
 * Supports multiple database providers
 */
export default registerAs('database', () => ({
  provider: (process.env.DATABASE_PROVIDER as DatabaseProvider) || 'firebase',

  // Firebase configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    databaseUrl: process.env.FIREBASE_DATABASE_URL,
  },

  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nestpress',
  },

  // DynamoDB configuration
  dynamodb: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.DYNAMODB_ENDPOINT, // Optional: for local development
  },

  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
}));
