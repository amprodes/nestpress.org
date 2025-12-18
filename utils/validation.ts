/**
 * Validation Utilities
 * Input validation, form validation, and data validation helpers
 */

import { VALIDATION_PATTERNS, SEO_LIMITS, FILE_LIMITS } from './constants';

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Field validator type
export type FieldValidator<T> = (value: T) => ValidationResult;

/**
 * Compose multiple validators
 */
export const composeValidators = <T>(...validators: FieldValidator<T>[]): FieldValidator<T> => {
  return (value: T): ValidationResult => {
    const errors: string[] = [];
    
    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        errors.push(...result.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  };
};

/**
 * Required field validator
 */
export const required = (message = 'This field is required'): FieldValidator<unknown> => {
  return (value: unknown): ValidationResult => {
    const isValid = value !== undefined && value !== null && value !== '';
    return {
      isValid,
      errors: isValid ? [] : [message],
    };
  };
};

/**
 * Minimum length validator
 */
export const minLength = (min: number, message?: string): FieldValidator<string> => {
  return (value: string): ValidationResult => {
    const isValid = !value || value.length >= min;
    return {
      isValid,
      errors: isValid ? [] : [message || `Must be at least ${min} characters`],
    };
  };
};

/**
 * Maximum length validator
 */
export const maxLength = (max: number, message?: string): FieldValidator<string> => {
  return (value: string): ValidationResult => {
    const isValid = !value || value.length <= max;
    return {
      isValid,
      errors: isValid ? [] : [message || `Must be no more than ${max} characters`],
    };
  };
};

/**
 * Email validator
 */
export const isEmail = (message = 'Invalid email address'): FieldValidator<string> => {
  return (value: string): ValidationResult => {
    const isValid = !value || VALIDATION_PATTERNS.EMAIL.test(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
    };
  };
};

/**
 * URL validator
 */
export const isURL = (message = 'Invalid URL'): FieldValidator<string> => {
  return (value: string): ValidationResult => {
    const isValid = !value || VALIDATION_PATTERNS.URL.test(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
    };
  };
};

/**
 * Slug validator (URL-friendly string)
 */
export const isSlug = (message = 'Invalid slug format'): FieldValidator<string> => {
  return (value: string): ValidationResult => {
    const isValid = !value || VALIDATION_PATTERNS.SLUG.test(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
    };
  };
};

/**
 * Number range validator
 */
export const inRange = (min: number, max: number, message?: string): FieldValidator<number> => {
  return (value: number): ValidationResult => {
    const isValid = value >= min && value <= max;
    return {
      isValid,
      errors: isValid ? [] : [message || `Must be between ${min} and ${max}`],
    };
  };
};

/**
 * Positive number validator
 */
export const isPositive = (message = 'Must be a positive number'): FieldValidator<number> => {
  return (value: number): ValidationResult => {
    const isValid = value > 0;
    return {
      isValid,
      errors: isValid ? [] : [message],
    };
  };
};

/**
 * Pattern validator
 */
export const matchesPattern = (pattern: RegExp, message: string): FieldValidator<string> => {
  return (value: string): ValidationResult => {
    const isValid = !value || pattern.test(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
    };
  };
};

// ============================================
// Domain-specific validators
// ============================================

/**
 * Validate SEO meta title
 */
export const validateSEOTitle: FieldValidator<string> = composeValidators(
  required('Meta title is required'),
  maxLength(SEO_LIMITS.TITLE_MAX_LENGTH, `Title should be ${SEO_LIMITS.TITLE_MAX_LENGTH} characters or less`)
);

/**
 * Validate SEO meta description
 */
export const validateSEODescription: FieldValidator<string> = composeValidators(
  required('Meta description is required'),
  maxLength(SEO_LIMITS.DESCRIPTION_MAX_LENGTH, `Description should be ${SEO_LIMITS.DESCRIPTION_MAX_LENGTH} characters or less`)
);

/**
 * Validate post/page content
 */
export const validatePostTitle: FieldValidator<string> = composeValidators(
  required('Title is required'),
  minLength(3, 'Title must be at least 3 characters'),
  maxLength(200, 'Title must be 200 characters or less')
);

/**
 * Validate product price
 */
export const validatePrice: FieldValidator<number> = (value: number): ValidationResult => {
  if (value === undefined || value === null) {
    return { isValid: false, errors: ['Price is required'] };
  }
  if (value < 0) {
    return { isValid: false, errors: ['Price cannot be negative'] };
  }
  if (!Number.isFinite(value)) {
    return { isValid: false, errors: ['Invalid price value'] };
  }
  return { isValid: true, errors: [] };
};

/**
 * Validate SKU
 */
export const validateSKU: FieldValidator<string> = composeValidators(
  required('SKU is required'),
  minLength(3, 'SKU must be at least 3 characters'),
  matchesPattern(/^[A-Z0-9-]+$/i, 'SKU can only contain letters, numbers, and hyphens')
);

/**
 * Validate API key format (basic check)
 */
export const validateAPIKey: FieldValidator<string> = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, errors: ['API key is required'] };
  }
  if (value.length < 10) {
    return { isValid: false, errors: ['API key appears to be too short'] };
  }
  // Check for common placeholder values
  const placeholders = ['YOUR_API_KEY', 'API_KEY_HERE', 'REPLACE_ME', 'xxx'];
  if (placeholders.some(p => value.toLowerCase().includes(p.toLowerCase()))) {
    return { isValid: false, errors: ['Please enter a valid API key'] };
  }
  return { isValid: true, errors: [] };
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}
): ValidationResult => {
  const errors: string[] = [];
  const maxSize = options.maxSize || FILE_LIMITS.MAX_FILE_SIZE;
  const allowedTypes = options.allowedTypes || [...FILE_LIMITS.ALLOWED_IMAGE_TYPES, ...FILE_LIMITS.ALLOWED_FILE_TYPES];
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate form object with multiple fields
 */
export const validateForm = <T extends Record<string, unknown>>(
  values: T,
  validators: Partial<Record<keyof T, FieldValidator<T[keyof T]>>>
): { isValid: boolean; errors: Partial<Record<keyof T, string[]>> } => {
  const errors: Partial<Record<keyof T, string[]>> = {};
  let isValid = true;
  
  for (const [field, validator] of Object.entries(validators)) {
    if (validator) {
      const result = (validator as FieldValidator<T[keyof T]>)(values[field as keyof T]);
      if (!result.isValid) {
        isValid = false;
        errors[field as keyof T] = result.errors;
      }
    }
  }
  
  return { isValid, errors };
};

/**
 * Generate slug from title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
};
