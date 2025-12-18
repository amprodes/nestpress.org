import { registerAs } from '@nestjs/config';

export type AIProvider = 'gemini' | 'openai' | 'anthropic';

/**
 * AI Provider configuration namespace
 * Supports multiple AI providers for content generation
 */
export default registerAs('ai', () => ({
  provider: (process.env.AI_PROVIDER as AIProvider) || 'gemini',

  // Google Gemini
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-1.5-flash',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    organization: process.env.OPENAI_ORGANIZATION,
  },

  // Anthropic
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
  },

  // Rate limiting for AI endpoints
  rateLimit: {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  },
}));
