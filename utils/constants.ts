/**
 * Application Constants
 * Centralized constants to avoid magic strings and improve maintainability
 */

// Storage Keys
export const STORAGE_KEYS = {
  CONFIG: 'nestpress_config',
  WIZARD: 'nestpress_wizard',
  THEME: 'nestpress_theme',
  AUTH_TOKEN: 'nestpress_auth',
} as const;

// API Endpoints (for future use)
export const API_ENDPOINTS = {
  POSTS: '/api/posts',
  PAGES: '/api/pages',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  USERS: '/api/users',
  MEDIA: '/api/media',
  SETTINGS: '/api/settings',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_FILE_TYPES: ['application/pdf', 'application/msword', 'text/plain'],
} as const;

// SEO limits
export const SEO_LIMITS = {
  TITLE_MAX_LENGTH: 60,
  DESCRIPTION_MAX_LENGTH: 160,
  KEYWORDS_MAX_COUNT: 10,
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  PHONE: /^\+?[\d\s-()]+$/,
} as const;

// Default timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  DEBOUNCE_SEARCH: 300, // 300ms
  AUTO_SAVE: 60000, // 1 minute
} as const;

// Theme defaults
export const THEME_DEFAULTS = {
  LAYOUT: 'full-width' as const,
  PRIMARY_COLOR: '#2563eb',
  FONT_HEADING: 'Inter',
  FONT_BODY: 'Inter',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  API_KEY_REQUIRED: 'API key is required for this operation.',
  INVALID_CONFIG: 'Invalid configuration. Please check your settings.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  DELETED: 'Item deleted successfully.',
  PUBLISHED: 'Content published successfully.',
  COPIED: 'Copied to clipboard.',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
