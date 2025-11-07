/**
 * Client Type Definitions
 *
 * @description
 * Shared TypeScript interfaces for client-related data structures.
 * These types are used across the application for type safety and consistency.
 */

/**
 * Client Type interface
 */
export interface ClientType {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/**
 * Full Client interface matching API response
 */
export interface Client {
  id: number;
  name: string;
  group: string | null;
  contact_name: string;
  contact_position: string;
  contact_email: string;
  contact_phone: string;
  referral_from: string;
  date_of_first_project: string;
  status: string;
  priority_number: number;
  created_at: string;
  updated_at: string;
  type: ClientType;
}

/**
 * Simplified client interface for selection/display
 */
export interface ClientSelection {
  id: number;
  name: string;
  contact_name: string;
  contact_email: string;
  type: string;
}

/**
 * Client filter options
 */
export interface ClientFilters {
  searchQuery?: string;
  typeId?: number | null;
  status?: string;
  priorityNumber?: number;
}

/**
 * Client sort options
 */
export type ClientSortField = 'name' | 'contact_name' | 'created_at' | 'priority_number';
export type ClientSortOrder = 'asc' | 'desc';

export interface ClientSortOptions {
  field: ClientSortField;
  order: ClientSortOrder;
}

