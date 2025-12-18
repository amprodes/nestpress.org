import { SetMetadata } from '@nestjs/common';

/**
 * User roles enum
 */
export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  SUBSCRIBER = 'subscriber',
}

/**
 * Roles decorator - restricts access to specific roles
 * Usage: @Roles(Role.ADMIN, Role.EDITOR)
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
