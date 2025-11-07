"use client";

/**
 * ClientBrowserModal Component
 *
 * @description
 * A modal wrapper for the ClientBrowser component, providing a convenient
 * way to display client selection in a dialog/modal format.
 *
 * @usage
 * ```tsx
 * const [open, setOpen] = useState(false);
 * const [selectedClient, setSelectedClient] = useState<Client | null>(null);
 *
 * <ClientBrowserModal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onSelectClient={(client) => {
 *     setSelectedClient(client);
 *     setOpen(false);
 *   }}
 *   selectedClient={selectedClient}
 * />
 * ```
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import ClientBrowser, { ClientBrowserProps, ClientBrowserMode } from "./ClientBrowser";
import { Client } from "../../../../lib/api/types/client";
import NewClientModal from "./NewClientModal";

/**
 * Props for ClientBrowserModal component
 */
export interface ClientBrowserModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Currently selected client(s) */
  selectedClient?: Client | Client[] | null;
  /** Callback when a client is selected */
  onSelectClient?: (client: Client) => void;
  /** Callback when multiple clients are selected */
  onSelectClients?: (clients: Client[]) => void;
  /** Enable multi-select mode */
  multiSelect?: boolean;
  /** Modal title */
  title?: string;
  /** Modal subtitle/description */
  subtitle?: string;
  /** Display mode for the browser */
  mode?: ClientBrowserMode;
  /** Show create new client button */
  showCreateButton?: boolean;
  /** Callback when create button is clicked */
  onCreateClient?: () => void;
  /** Max width of the modal */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  /** Full width modal */
  fullWidth?: boolean;
  /** Show confirm/cancel buttons in footer */
  showFooterActions?: boolean;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Callback when confirm is clicked (only if showFooterActions is true) */
  onConfirm?: () => void;
  /** Additional ClientBrowser props */
  browserProps?: Partial<ClientBrowserProps>;
}

/**
 * ClientBrowserModal Component
 */
export default function ClientBrowserModal({
  open,
  onClose,
  selectedClient,
  onSelectClient,
  onSelectClients,
  multiSelect = false,
  title = "Select Client",
  subtitle = "Choose a client from the list below",
  mode = "compact",
  showCreateButton = true,
  onCreateClient,
  maxWidth = "md",
  fullWidth = true,
  showFooterActions = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  browserProps,
}: ClientBrowserModalProps) {
  const [internalSelection, setInternalSelection] = useState<Client | null>(null);
  const [internalSelections, setInternalSelections] = useState<Client[]>([]);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  // Handle client selection
  const handleSelectClient = (client: Client) => {
    if (showFooterActions) {
      // If using footer actions, store selection internally
      setInternalSelection(client);
    } else {
      // Otherwise, immediately call the callback
      onSelectClient?.(client);
    }
  };

  const handleSelectClients = (clients: Client[]) => {
    if (showFooterActions) {
      setInternalSelections(clients);
    } else {
      onSelectClients?.(clients);
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    if (multiSelect) {
      onSelectClients?.(internalSelections);
    } else {
      if (internalSelection) {
        onSelectClient?.(internalSelection);
      }
    }
    onConfirm?.();
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    setInternalSelection(null);
    setInternalSelections([]);
    onClose();
  };

  // Handle new client created
  const handleClientCreated = (newClient: Client) => {
    // Close the new client modal
    setShowNewClientModal(false);

    // If there's a custom onCreateClient callback, call it
    if (onCreateClient) {
      onCreateClient();
    }

    // Optionally auto-select the newly created client
    if (!multiSelect && onSelectClient) {
      onSelectClient(newClient);
    }
  };

  // Handle create button click
  const handleCreateClick = () => {
    setShowNewClientModal(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
          },
        }}
      >
        {/* Header */}
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pb: 1,
              borderBottom: "2px solid",
              borderColor: "primary.main",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <IconButton
              onClick={handleClose}
              edge="end"
              sx={{
                bgcolor: "action.hover",
                "&:hover": {
                  bgcolor: "action.selected",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ p: 3, minHeight: 400 }}>
          <ClientBrowser
            selectedClient={showFooterActions ? (multiSelect ? internalSelections : internalSelection) : selectedClient}
            onSelectClient={handleSelectClient}
            onSelectClients={handleSelectClients}
            multiSelect={multiSelect}
            mode={mode}
            showCreateButton={showCreateButton}
            onCreateClient={handleCreateClick}
            height="100%"
            showRefresh={true}
            {...browserProps}
          />
        </DialogContent>

        {/* Footer Actions */}
        {showFooterActions && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              disabled={multiSelect ? internalSelections.length === 0 : !internalSelection}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {confirmText}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* New Client Modal */}
      <NewClientModal
        open={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        onClientCreated={handleClientCreated}
      />
    </>
  );
}

