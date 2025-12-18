import { SetMetadata } from '@nestjs/common';

/**
 * Public decorator - marks routes as accessible without authentication
 * Usage: @Public() on controller or method
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
