/**
 * Identity Service Module
 * 
 * @description
 * This module provides services for fetching personnel identity data from the API.
 * It handles all API interactions related to personnel/employee identities including data retrieval
 * and proper error handling.
 * 
 * @purpose
 * To centralize identity-related API calls and provide a clean interface
 * for components to interact with personnel identity data.
 * 
 * @constraints
 * - Requires a properly configured API instance with base URL
 * - Response structure must match the expected IdentityApiResponse format
 * - Network connectivity required for all operations
 * 
 * @requirements
 * - axios library for HTTP requests
 * - Proper error handling with meaningful error messages
 * - Type safety for all operations
 * 
 * @example
 * ```typescript
 * // Fetch all identities
 * import { IdentityService } from 'lib/api/services/identity';
 * 
 * try {
 *   const identities = await IdentityService.getIdentities();
 *   console.log(identities); // Array of Identity objects
 * } catch (error) {
 *   console.error('Failed to load identities:', error.message);
 * }
 * 
 * // Fetch a specific identity
 * try {
 *   const identity = await IdentityService.getIdentityById("123");
 *   console.log(identity); // Identity object
 * } catch (error) {
 *   console.error('Failed to load identity:', error.message);
 * }
 * ```
 */


/**
 * Identity interface representing a personnel entity from the API
 */
export interface ApiIdentity {
  id: string;
  keycloakId: string;
  email: string;
  name: string;
  preferredUsername: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  role: string;
  jobTitle?: string;
}

/**
 * Simplified Identity interface for frontend use
 */
export interface Identity {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  avatar?: string;
  jobTitle?: string;
}

/**
 * Error response interface
 */
interface ErrorResponse {
  message: string;
  status: number;
}

/**
 * Generate initials for avatar placeholder
 * @param name Full name
 * @returns Initials (up to 2 characters)
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

/**
 * Generate a consistent avatar color based on name
 * @param name Full name
 * @returns Hex color code
 */
const getAvatarColor = (name: string): string => {
  const colors = [
    '#1976d2', // Blue
    '#388e3c', // Green
    '#d32f2f', // Red
    '#7b1fa2', // Purple
    '#0288d1', // Light Blue
    '#f57c00', // Orange
    '#5c6bc0', // Indigo
    '#009688', // Teal
    '#e64a19', // Deep Orange
    '#5d4037', // Brown
  ];

  // Generate a consistent index based on the name
  const charSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

/**
 * Maps an API Identity to a frontend Identity
 * @param apiIdentity Identity from API
 * @returns Frontend Identity object with additional UI properties
 */
const mapApiIdentityToFrontend = (apiIdentity: ApiIdentity): Identity => {
  const initials = getInitials(apiIdentity.name);
  const color = getAvatarColor(apiIdentity.name);

  // Generate a data URL for avatar placeholder with initials
  const avatarPlaceholder = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="${color.replace('#', '%23')}" /><text x="50%" y="50%" dy=".1em" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold" font-size="16">${initials}</text></svg>`;

  return {
    id: apiIdentity.id,
    name: apiIdentity.name,
    email: apiIdentity.email,
    username: apiIdentity.preferredUsername,
    role: apiIdentity.role.toUpperCase(),
    avatar: avatarPlaceholder,
    jobTitle: apiIdentity.jobTitle
  };
};

/**
 * Identity service providing API interaction functionality for personnel identities
 */
export const IdentityService = {
  /**
   * Get all personnel
   * @returns Promise with personnel data
   */
  getPersonnel: async (): Promise<Identity[]> => {
    try {
      const response = await fetch('/api/identities', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch personnel: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch personnel');
      }

      const data: ApiIdentity[] = await response.json();
      // Map API identities to frontend format with additional UI properties
      return data.map(mapApiIdentityToFrontend);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch personnel';
      console.error('Error fetching personnel:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get personnel by ID
   * @param id Personnel ID
   * @returns Promise with personnel data
   */
  getPersonnelById: async (id: string): Promise<Identity> => {
    try {
      const response = await fetch(`/api/identities/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch personnel with ID ${id}: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || `Failed to fetch personnel with ID ${id}`);
      }

      const data: ApiIdentity = await response.json();
      return mapApiIdentityToFrontend(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch personnel with ID ${id}`;
      console.error(`Error fetching personnel ${id}:`, errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Search personnel by name or department
   * @param query Search query
   * @returns Promise with filtered personnel data
   */
  searchPersonnel: async (query: string): Promise<Identity[]> => {
    try {
      const params = new URLSearchParams({ q: query });
      const response = await fetch(`/api/identities/search?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to search personnel: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to search personnel');
      }

      const data: ApiIdentity[] = await response.json();
      return data.map(mapApiIdentityToFrontend);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search personnel';
      console.error('Error searching personnel:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

