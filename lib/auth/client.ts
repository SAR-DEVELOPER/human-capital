// lib/auth/client.ts
// Client-side authentication utilities

import type { User } from '@/lib/auth/types';

/**
 * Decode JWT token payload without verification
 * Note: This is for client-side display only, NOT for security validation
 * Server-side must always verify tokens properly
 */
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      throw new Error('Invalid token format');
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Get cookie value by name (client-side only)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // Server-side
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

/**
 * Get current user from auth_session cookie
 * Returns decoded JWT payload with user information
 */
export function getCurrentUser(): User | null {
  const token = getCookie('auth_session');

  if (!token) {
    return null;
  }

  const decoded = decodeJWT(token);
  
  // If decoded token doesn't have required 'sub' field, return null
  if (!decoded || !decoded.sub) {
    return null;
  }

  // Type assertion: decoded token should match User interface
  // The sub field is required and we've checked it exists
  return decoded as User;
}

/**
 * Get user's display name from JWT payload
 * Falls back through: name -> given_name + family_name -> preferred_username -> email -> sub
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Unknown User';

  if (user.name) return user.name;

  if (user.given_name || user.family_name) {
    return [user.given_name, user.family_name].filter(Boolean).join(' ');
  }

  if (user.preferred_username) return user.preferred_username;

  if (user.email) return user.email;

  if (user.sub) return user.sub;

  return 'Unknown User';
}

/**
 * Get user's primary role from JWT payload
 * Checks realm_access roles first, then resource_access
 */
export function getUserRole(user: User | null): string {
  if (!user) return 'User';

  // Check realm roles
  if (user.realm_access?.roles && user.realm_access.roles.length > 0) {
    // Filter out default keycloak roles
    const filteredRoles = user.realm_access.roles.filter(
      role => !['offline_access', 'uma_authorization', 'default-roles-*'].some(
        pattern => role.includes(pattern) || role.startsWith('default-roles')
      )
    );

    if (filteredRoles.length > 0) {
      return filteredRoles[0];
    }
  }

  // Check roles array (if directly in JWT)
  if (user.roles && user.roles.length > 0) {
    return user.roles[0];
  }

  return 'User';
}
