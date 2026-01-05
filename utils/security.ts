/**
 * Security Utilities
 * XSS prevention, input sanitization, and secure storage helpers
 */

import DOMPurify from 'dompurify';

// WordPress Compatibility Helpers - TEMPORARY FILE MARKER
// This will be moved to wp.ts

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify with secure defaults
 */
export const sanitizeHTML = (dirty: string): string => {
  if (!dirty) return '';
  
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'img',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'hr',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'target', 'rel', 'width', 'height',
      'style', // Be cautious with style - consider more restrictions
    ],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'], // For links to open in new tabs
  });
};

/**
 * Sanitize plain text - removes all HTML tags
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

/**
 * Sanitize URL to prevent javascript: and data: protocol attacks
 */
export const sanitizeURL = (url: string): string => {
  if (!url) return '';
  
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  if (dangerousProtocols.some(proto => trimmed.startsWith(proto))) {
    return '';
  }
  
  // Only allow http, https, mailto, tel protocols
  const allowedProtocols = ['http://', 'https://', 'mailto:', 'tel:', '//', '/'];
  if (!allowedProtocols.some(proto => trimmed.startsWith(proto)) && !trimmed.startsWith('#')) {
    // If no protocol, assume relative URL or add https
    return url.startsWith('/') ? url : `https://${url}`;
  }
  
  return url;
};

/**
 * Escape HTML entities for safe display in text contexts
 */
export const escapeHTML = (str: string): string => {
  if (!str) return '';
  
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  
  return str.replace(/[&<>"'`=/]/g, char => htmlEntities[char]);
};

/**
 * Validate and sanitize email address
 */
export const sanitizeEmail = (email: string): string | null => {
  if (!email) return null;
  
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return null;
  }
  
  return trimmed;
};

/**
 * Generate a cryptographically secure random ID
 */
export const generateSecureId = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, x => chars[x % chars.length]).join('');
};

/**
 * Hash a string using SHA-256 (for non-security critical use)
 * Note: For password hashing, use bcrypt on the server
 */
export const hashString = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Secure localStorage wrapper with optional expiration
 */
export const secureStorage = {
  set: <T>(key: string, value: T, expiresInMs?: number): void => {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        expires: expiresInMs ? Date.now() + expiresInMs : null,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      
      // Check expiration
      if (item.expires && Date.now() > item.expires) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value as T;
    } catch (error) {
      return null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
    }
  },
};

/**
 * Mask sensitive data for display (e.g., API keys)
 */
export const maskSensitiveData = (value: string, visibleChars: number = 4): string => {
  if (!value || value.length <= visibleChars * 2) {
    return '••••••••';
  }
  
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const masked = '•'.repeat(Math.min(value.length - visibleChars * 2, 8));
  
  return `${start}${masked}${end}`;
};

/**
 * Validate JSON structure to prevent prototype pollution
 */
export const safeJSONParse = <T>(json: string, defaultValue: T): T => {
  try {
    const parsed = JSON.parse(json);
    
    // Prevent prototype pollution
    if (typeof parsed === 'object' && parsed !== null) {
      if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
        return defaultValue;
      }
    }
    
    return parsed as T;
  } catch {
    return defaultValue;
  }
};

/**
 * Rate limiter for preventing abuse
 */
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests: number[] = [];
  
  return {
    isAllowed: (): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Remove old requests
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }
      
      if (requests.length >= maxRequests) {
        return false;
      }
      
      requests.push(now);
      return true;
    },
    
    reset: (): void => {
      requests.length = 0;
    },
  };
};

/**
 * Content Security Policy nonce generator
 */
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
};

// ============================================================================
// WORDPRESS COMPATIBILITY HELPERS (wp.ts content)
// These will be extracted to a separate file
// ============================================================================

/**
 * WordPress Compatibility Helpers
 * 
 * These helpers normalize WordPress field names across frontend components.
 * They read WP-standard fields first (post_title, post_content, etc.) and
 * fall back to legacy field names for backward compatibility.
 */

import { PostStatus } from '../types';

/**
 * Get post title with WP field preference
 */
export const getPostTitle = (post: any): string => {
  return post?.post_title ?? post?.title ?? '(Untitled)';
};

/**
 * Get post slug with WP field preference
 */
export const getPostSlug = (post: any): string => {
  return post?.post_name ?? post?.slug ?? '';
};

/**
 * Get post content with WP field preference
 */
export const getPostContent = (post: any): string => {
  return post?.post_content ?? post?.content ?? '';
};

/**
 * Get post excerpt with WP field preference
 */
export const getPostExcerpt = (post: any): string => {
  return post?.post_excerpt ?? post?.excerpt ?? '';
};

/**
 * Get post date with WP field preference
 */
export const getPostDate = (post: any): string => {
  return post?.post_date ?? post?.date ?? post?.createdAt ?? new Date().toISOString();
};

/**
 * Get post type with WP field preference
 */
export const getPostType = (post: any): 'post' | 'page' => {
  const type = post?.post_type ?? post?.type ?? 'post';
  return type === 'page' ? 'page' : 'post';
};

/**
 * Get post categories (array)
 */
export const getPostCategories = (post: any): string[] => {
  return post?.categories ?? [];
};

/**
 * Get post tags (array)
 */
export const getPostTags = (post: any): string[] => {
  return post?.tags ?? [];
};

/**
 * Get post author name
 */
export const getPostAuthor = (post: any): string => {
  return post?.post_author_name ?? post?.author?.name ?? post?.author ?? 'Unknown';
};

/**
 * Get raw post status from WordPress or legacy fields
 */
export const getPostStatusRaw = (post: any): string => {
  return post?.post_status ?? post?.status ?? 'draft';
};

/**
 * Get post status label normalized to frontend enum values
 */
export const getPostStatusLabel = (post: any): PostStatus => {
  const status = String(getPostStatusRaw(post)).toLowerCase();
  
  // WordPress statuses
  if (status === 'publish' || status === 'published') return PostStatus.PUBLISHED;
  if (status === 'trash' || status === 'trashed') return PostStatus.TRASH;
  
  // Draft, pending, private, auto-draft, inherit, etc.
  return PostStatus.DRAFT;
};

/**
 * Get WordPress post ID (prefers ID over id)
 */
export const getPostId = (post: any): string => {
  const wpId = post?.ID;
  if (wpId !== undefined && wpId !== null) {
    return String(wpId);
  }
  return post?.id ?? post?._id ?? Date.now().toString();
};

/**
 * Check if post has WP fields (versus only legacy fields)
 */
export const hasWPFields = (post: any): boolean => {
  return !!(post?.post_title || post?.post_content || post?.post_status || post?.post_date);
};

