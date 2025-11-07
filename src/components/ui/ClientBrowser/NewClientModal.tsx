"use client";

/**
 * NewClientModal Component
 *
 * @description
 * A modal for creating new clients with simplified form fields (name, group, typeId).
 * Fetches client types from the API and allows users to quickly add new clients.
 *
 * @usage
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <NewClientModal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onClientCreated={(newClient) => {
 *     console.log('New client created:', newClient);
 *     setOpen(false);
 *   }}
 * />
 * ```
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { ClientService, CreateClientSimpleRequest } from "../../../../lib/api/services/client";
import { Client, ClientType } from "../../../../lib/api/types/client";

/**
 * Props for NewClientModal component
 */
export interface NewClientModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when a new client is successfully created */
  onClientCreated?: (client: Client) => void;
}

/**
 * NewClientModal Component
 */
export default function NewClientModal({
  open,
  onClose,
  onClientCreated,
}: NewClientModalProps) {
  // Form state
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [typeId, setTypeId] = useState<number | "">("");

  // Client types state
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typesError, setTypesError] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load client types when modal opens
  useEffect(() => {
    if (open) {
      loadClientTypes();
    }
  }, [open]);

  // Fetch client types from API
  const loadClientTypes = async () => {
    setLoadingTypes(true);
    setTypesError("");
    try {
      const types = await ClientService.getClientTypes();
      setClientTypes(types);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load client types";
      setTypesError(errorMessage);
      console.error("Error loading client types:", err);
    } finally {
      setLoadingTypes(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      setError("Client name is required");
      return;
    }
    if (!typeId) {
      setError("Client type is required");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const clientData: CreateClientSimpleRequest = {
        name: name.trim(),
        group: group.trim() || undefined,
        typeId: typeId as number,
      };

      const newClient = await ClientService.createClientSimple(clientData);

      setSuccess(true);

      // Call callback after a brief delay to show success message
      setTimeout(() => {
        onClientCreated?.(newClient);
        handleClose();
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create client";
      setError(errorMessage);
      console.error("Error creating client:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle close and reset form
  const handleClose = () => {
    setName("");
    setGroup("");
    setTypeId("");
    setError("");
    setSuccess(false);
    onClose();
  };

  // Check if form is valid
  const isFormValid = name.trim() && typeId;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AddIcon sx={{ color: "primary.main", fontSize: 28 }} />
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: "bold",
                color: "primary.main",
              }}
            >
              Add New Client
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            edge="end"
            disabled={submitting}
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
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert severity="success">
              Client created successfully!
            </Alert>
          )}

          {/* Types Loading Error */}
          {typesError && (
            <Alert severity="warning">
              {typesError}
              <Button
                size="small"
                onClick={loadClientTypes}
                sx={{ ml: 2 }}
              >
                Retry
              </Button>
            </Alert>
          )}

          {/* Client Name Field */}
          <TextField
            label="Client Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            disabled={submitting}
            placeholder="Enter client name"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Group Field (Optional) */}
          <TextField
            label="Group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            fullWidth
            disabled={submitting}
            placeholder="Enter group name (optional)"
            helperText="Optional: Group or category for this client"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Client Type Dropdown */}
          <TextField
            select
            label="Client Type"
            value={typeId}
            onChange={(e) => {
              const value = e.target.value;
              setTypeId(value === "" ? "" : Number(value));
            }}
            fullWidth
            required
            disabled={submitting || loadingTypes}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
            InputProps={{
              endAdornment: loadingTypes ? (
                <CircularProgress size={20} sx={{ mr: 2 }} />
              ) : null,
            }}
          >
            {clientTypes.length === 0 && !loadingTypes ? (
              <MenuItem value="" disabled>
                No client types available
              </MenuItem>
            ) : (
              clientTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  <Box>
                    <Typography variant="body1">{type.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </TextField>
        </Box>
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={submitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {submitting ? "Creating..." : "Create Client"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

