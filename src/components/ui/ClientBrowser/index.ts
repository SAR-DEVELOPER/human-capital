/**
 * ClientBrowser Module
 *
 * @description
 * Reusable client browsing components that can be used anywhere in the application.
 *
 * @exports
 * - ClientBrowser: Core browsing component
 * - ClientBrowserModal: Modal wrapper component
 * - Types and interfaces
 */

export { default as ClientBrowser } from "./ClientBrowser";
export { default as ClientBrowserModal } from "./ClientBrowserModal";

export type {
  ClientBrowserProps,
  ClientBrowserMode,
  ClientBrowserColumn,
} from "./ClientBrowser";

export type {
  ClientBrowserModalProps,
} from "./ClientBrowserModal";

// Re-export client types for convenience
export type {
  Client,
  ClientType,
  ClientSelection,
  ClientFilters,
  ClientSortField,
  ClientSortOrder,
  ClientSortOptions,
} from "../../../../lib/api/types/client";

// Re-export client service for convenience
export { ClientService } from "../../../../lib/api/services/client";
export type { CreateClientRequest } from "../../../../lib/api/services/client";

