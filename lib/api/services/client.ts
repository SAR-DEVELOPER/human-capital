/**
 * Client Service Module
 *
 * @description
 * This module provides services for fetching and managing client data from the API.
 * It handles all API interactions related to clients including data retrieval,
 * creation, and proper error handling.
 *
 * @purpose
 * To centralize client-related API calls and provide a clean interface
 * for components to interact with client data.
 *
 * @example
 * ```typescript
 * import { ClientService } from 'lib/api/services/client';
 *
 * // Fetch all clients
 * const clients = await ClientService.getClients();
 *
 * // Fetch client types
 * const types = await ClientService.getClientTypes();
 *
 * // Search clients
 * const results = await ClientService.searchClients('acme');
 *
 * // Create new client
 * const newClient = await ClientService.createClient({...});
 * ```
 */

import { Client, ClientType } from "../types/client";

/**
 * Error response interface
 */
interface ErrorResponse {
  message: string;
  status: number;
}

/**
 * Create client request payload
 */
export interface CreateClientRequest {
  name: string;
  group?: string | null;
  contact_name: string;
  contact_position: string;
  contact_email: string;
  contact_phone: string;
  referral_from?: string;
  type_id: number;
  status?: string;
  priority_number?: number;
}

/**
 * Simplified create client request payload for new client creation
 */
export interface CreateClientSimpleRequest {
  name: string;
  group?: string;
  typeId: number;
}

/**
 * Client service providing API interaction functionality for client entities
 */
export const ClientService = {
  /**
   * Get all clients
   * @returns Promise with array of clients
   */
  getClients: async (): Promise<Client[]> => {
    try {
      const response = await fetch('/api/clients', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch clients: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch clients');
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
      console.error('Error fetching clients:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get client by ID
   * @param id Client ID
   * @returns Promise with client data
   */
  getClientById: async (id: number): Promise<Client> => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch client with ID ${id}: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || `Failed to fetch client with ID ${id}`);
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch client with ID ${id}`;
      console.error(`Error fetching client ${id}:`, errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get all client types
   * @returns Promise with array of client types
   */
  getClientTypes: async (): Promise<ClientType[]> => {
    try {
      const response = await fetch('/api/clients/types', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch client types: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch client types');
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch client types';
      console.error('Error fetching client types:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Search clients by query string
   * @param query Search query
   * @returns Promise with array of matching clients
   */
  searchClients: async (query: string): Promise<Client[]> => {
    try {
      const params = new URLSearchParams({ q: query });
      const response = await fetch(`/api/clients/search?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to search clients: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to search clients');
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search clients';
      console.error('Error searching clients:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Create a new client
   * @param clientData Client creation data
   * @returns Promise with created client
   */
  createClient: async (clientData: CreateClientRequest): Promise<Client> => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to create client: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to create client');
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create client';
      console.error('Error creating client:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Create a new client with simplified data
   * @param clientData Simplified client creation data (name, group, typeId)
   * @returns Promise with created client
   */
  createClientSimple: async (clientData: CreateClientSimpleRequest): Promise<Client> => {
    try {
      const response = await fetch('/api/clients/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to create client: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to create client');
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create client';
      console.error('Error creating client:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Update an existing client
   * @param id Client ID
   * @param clientData Updated client data
   * @returns Promise with updated client
   */
  updateClient: async (id: number, clientData: Partial<CreateClientRequest>): Promise<Client> => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to update client ${id}: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || `Failed to update client ${id}`);
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to update client ${id}`;
      console.error(`Error updating client ${id}:`, errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Delete a client
   * @param id Client ID
   * @returns Promise with success status
   */
  deleteClient: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to delete client ${id}: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || `Failed to delete client ${id}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to delete client ${id}`;
      console.error(`Error deleting client ${id}:`, errorMessage);
      throw new Error(errorMessage);
    }
  },
};

