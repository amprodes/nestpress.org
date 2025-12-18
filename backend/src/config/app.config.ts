import { registerAs } from '@nestjs/config';

/**
 * Application configuration namespace
 */
export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3001',
  ],
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  media: {
    uploadPath: process.env.MEDIA_UPLOAD_PATH || './uploads',
    maxSize: parseInt(process.env.MEDIA_MAX_SIZE || '10485760', 10),
  },
}));
