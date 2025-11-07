"use client";

/**
 * ClientBrowser Component
 *
 * @description
 * A reusable, flexible client browsing component that can be embedded anywhere.
 * Supports searching, filtering, sorting, and client selection.
 *
 * @features
 * - Search by name, contact, email, or group
 * - Filter by client type and status
 * - Sort by various fields
 * - Single or multi-select mode
 * - Responsive table layout
 * - Loading and error states
 * - Inline client creation
 * - Customizable display columns
 *
 * @usage
 * ```tsx
 * // Standalone on a page
 * <ClientBrowser
 *   onSelectClient={(client) => console.log(client)}
 *   selectedClient={selectedClient}
 * />
 *
 * // In a modal or container
 * <Box sx={{ height: 500 }}>
 *   <ClientBrowser
 *     mode="compact"
 *     onSelectClient={handleSelect}
 *   />
 * </Box>
 * ```
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  TablePagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Business as BusinessIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { ClientService } from "../../../../lib/api/services/client";
import { Client, ClientType, ClientSortField, ClientSortOrder } from "../../../../lib/api/types/client";

/**
 * Display mode for the browser
 * - full: Show all features and columns
 * - compact: Minimal view for modals/dialogs
 * - simple: Basic table without filters
 */
export type ClientBrowserMode = "full" | "compact" | "simple";

/**
 * Columns to display in the table
 */
export type ClientBrowserColumn =
  | "name"
  | "contact"
  | "type"
  | "status"
  | "priority"
  | "group"
  | "actions";

/**
 * Props for ClientBrowser component
 */
export interface ClientBrowserProps {
  /** Currently selected client(s) */
  selectedClient?: Client | Client[] | null;
  /** Callback when a client is selected */
  onSelectClient?: (client: Client) => void;
  /** Callback when multiple clients are selected (multi-select mode) */
  onSelectClients?: (clients: Client[]) => void;
  /** Enable multi-select mode */
  multiSelect?: boolean;
  /** Display mode */
  mode?: ClientBrowserMode;
  /** Columns to display */
  columns?: ClientBrowserColumn[];
  /** Show create new client button */
  showCreateButton?: boolean;
  /** Callback when create button is clicked */
  onCreateClient?: () => void;
  /** Initial filter values */
  initialFilters?: {
    searchQuery?: string;
    typeId?: number;
    status?: string;
  };
  /** Custom height for the container */
  height?: string | number;
  /** Enable pagination */
  enablePagination?: boolean;
  /** Rows per page (if pagination enabled) */
  rowsPerPage?: number;
  /** Disable selection (view-only mode) */
  viewOnly?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Show refresh button */
  showRefresh?: boolean;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Default columns for each mode
 */
const DEFAULT_COLUMNS: Record<ClientBrowserMode, ClientBrowserColumn[]> = {
  full: ["name", "contact", "type", "status", "priority", "actions"],
  compact: ["name", "contact", "type", "actions"],
  simple: ["name", "contact", "actions"],
};

/**
 * ClientBrowser Component
 */
export default function ClientBrowser({
  selectedClient = null,
  onSelectClient,
  onSelectClients,
  multiSelect = false,
  mode = "full",
  columns,
  showCreateButton = true,
  onCreateClient,
  initialFilters = {},
  height = "auto",
  enablePagination = false,
  rowsPerPage: initialRowsPerPage = 10,
  viewOnly = false,
  emptyMessage = "No clients found",
  showRefresh = true,
  className,
}: ClientBrowserProps) {
  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || "");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<number | "">(
    initialFilters.typeId || ""
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>(
    initialFilters.status || ""
  );

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Multi-select state
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  // Determine which columns to show
  const displayColumns = columns || DEFAULT_COLUMNS[mode];

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsData, typesData] = await Promise.all([
        ClientService.getClients(),
        ClientService.getClientTypes(),
      ]);
      setClients(clientsData);
      setClientTypes(typesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.contact_name.toLowerCase().includes(query) ||
          client.contact_email.toLowerCase().includes(query) ||
          (client.group && client.group.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (selectedTypeFilter !== "") {
      filtered = filtered.filter((client) => client.type.id === selectedTypeFilter);
    }

    // Apply status filter
    if (selectedStatusFilter) {
      filtered = filtered.filter((client) => client.status === selectedStatusFilter);
    }

    return filtered;
  }, [clients, searchQuery, selectedTypeFilter, selectedStatusFilter]);

  // Paginated clients
  const paginatedClients = useMemo(() => {
    if (!enablePagination) return filteredClients;
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredClients.slice(start, end);
  }, [filteredClients, page, rowsPerPage, enablePagination]);

  // Handlers
  const handleSelectClient = (client: Client) => {
    if (viewOnly) return;

    if (multiSelect) {
      const isSelected = selectedClients.some((c) => c.id === client.id);
      const newSelection = isSelected
        ? selectedClients.filter((c) => c.id !== client.id)
        : [...selectedClients, client];
      setSelectedClients(newSelection);
      onSelectClients?.(newSelection);
    } else {
      onSelectClient?.(client);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTypeFilter("");
    setSelectedStatusFilter("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedTypeFilter !== "") count++;
    if (selectedStatusFilter) count++;
    return count;
  };

  const isClientSelected = (client: Client): boolean => {
    if (multiSelect) {
      return selectedClients.some((c) => c.id === client.id);
    }
    if (Array.isArray(selectedClient)) {
      return selectedClient.some((c) => c.id === client.id);
    }
    return selectedClient?.id === client.id;
  };

  // Get unique statuses from clients
  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(clients.map((c) => c.status))).filter(Boolean);
  }, [clients]);

  return (
    <Box className={className} sx={{ height, display: "flex", flexDirection: "column" }}>
      {/* Header Section */}
      {mode !== "simple" && (
        <Box sx={{ mb: 2 }}>
          {/* Action Buttons */}
          {(showCreateButton || showRefresh) && (
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              {showCreateButton && onCreateClient && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onCreateClient}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  New Client
                </Button>
              )}
              {showRefresh && (
                <Tooltip title="Refresh client list">
                  <IconButton onClick={fetchData} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}

          {/* Search and Filters */}
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            {/* Search Bar */}
            <TextField
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{
                flex: 1,
                minWidth: "200px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery("")}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Type Filter */}
            {mode === "full" && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value as number | "")}
                  label="Type"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>All Types</em>
                  </MenuItem>
                  {clientTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Status Filter */}
            {mode === "full" && displayColumns.includes("status") && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>All Statuses</em>
                  </MenuItem>
                  {uniqueStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Clear Filters */}
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                startIcon={<FilterListIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Clear ({getActiveFiltersCount()})
              </Button>
            )}
          </Box>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              {searchQuery.trim() && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  size="small"
                  onDelete={() => setSearchQuery("")}
                  color="primary"
                  variant="outlined"
                />
              )}
              {selectedTypeFilter !== "" && (
                <Chip
                  label={`Type: ${clientTypes.find((t) => t.id === selectedTypeFilter)?.name}`}
                  size="small"
                  onDelete={() => setSelectedTypeFilter("")}
                  color="secondary"
                  variant="outlined"
                />
              )}
              {selectedStatusFilter && (
                <Chip
                  label={`Status: ${selectedStatusFilter}`}
                  size="small"
                  onDelete={() => setSelectedStatusFilter("")}
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper
        sx={{
          flex: 1,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <TableContainer sx={{ maxHeight: enablePagination ? "auto" : "100%" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {displayColumns.includes("name") && (
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}>
                    Client Name
                  </TableCell>
                )}
                {displayColumns.includes("contact") && (
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}>
                    Contact
                  </TableCell>
                )}
                {displayColumns.includes("type") && (
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}>
                    Type
                  </TableCell>
                )}
                {displayColumns.includes("status") && (
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}>
                    Status
                  </TableCell>
                )}
                {displayColumns.includes("priority") && (
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}>
                    Priority
                  </TableCell>
                )}
                {displayColumns.includes("group") && (
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}>
                    Group
                  </TableCell>
                )}
                {displayColumns.includes("actions") && !viewOnly && (
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}>
                    Action
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={displayColumns.length} align="center">
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                      <CircularProgress size={24} sx={{ mr: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Loading clients...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginatedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={displayColumns.length} align="center">
                    <Typography variant="body2" sx={{ py: 4, color: "text.secondary" }}>
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClients.map((client, index) => {
                  const isSelected = isClientSelected(client);
                  return (
                    <TableRow
                      key={client.id}
                      sx={{
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                        bgcolor: isSelected
                          ? "success.lighter"
                          : index % 2 === 0
                          ? "background.paper"
                          : "action.hover",
                        borderLeft: isSelected ? "4px solid" : "4px solid transparent",
                        borderLeftColor: "success.main",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {displayColumns.includes("name") && (
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <BusinessIcon
                              sx={{
                                mr: 1.5,
                                color: isSelected ? "success.main" : "primary.main",
                              }}
                            />
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: isSelected ? 600 : "normal",
                                }}
                              >
                                {client.name}
                              </Typography>
                              {client.group && displayColumns.includes("group") === false && (
                                <Typography variant="caption" color="text.secondary">
                                  {client.group}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                      {displayColumns.includes("contact") && (
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {client.contact_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {client.contact_email}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {client.contact_position}
                            </Typography>
                          </Box>
                        </TableCell>
                      )}
                      {displayColumns.includes("type") && (
                        <TableCell>
                          <Chip
                            label={client.type.name}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
                      )}
                      {displayColumns.includes("status") && (
                        <TableCell>
                          <Chip
                            label={client.status}
                            size="small"
                            color={client.status === "Active" ? "success" : "default"}
                          />
                        </TableCell>
                      )}
                      {displayColumns.includes("priority") && (
                        <TableCell>
                          <Chip label={client.priority_number} size="small" variant="outlined" />
                        </TableCell>
                      )}
                      {displayColumns.includes("group") && (
                        <TableCell>
                          <Typography variant="body2">{client.group || "-"}</Typography>
                        </TableCell>
                      )}
                      {displayColumns.includes("actions") && !viewOnly && (
                        <TableCell>
                          <Button
                            size="small"
                            variant={isSelected ? "contained" : "outlined"}
                            onClick={() => handleSelectClient(client)}
                            startIcon={isSelected ? <CheckIcon /> : undefined}
                            sx={{
                              borderRadius: 1.5,
                              textTransform: "none",
                              fontWeight: 600,
                              ...(isSelected && {
                                bgcolor: "success.main",
                                "&:hover": {
                                  bgcolor: "success.dark",
                                },
                              }),
                            }}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {enablePagination && !loading && paginatedClients.length > 0 && (
          <TablePagination
            component="div"
            count={filteredClients.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </Paper>

      {/* Results Summary */}
      {!loading && clients.length > 0 && mode !== "simple" && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Showing {paginatedClients.length} of {filteredClients.length} clients
            {filteredClients.length !== clients.length && ` (${clients.length} total)`}
          </Typography>
          {multiSelect && selectedClients.length > 0 && (
            <Typography variant="caption" color="primary">
              {selectedClients.length} client{selectedClients.length > 1 ? "s" : ""} selected
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

