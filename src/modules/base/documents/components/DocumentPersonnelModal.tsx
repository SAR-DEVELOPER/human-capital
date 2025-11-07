import { Box, Typography, IconButton, Modal, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, TextField, InputAdornment, Avatar } from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import type { Identity } from "@/lib/api/services/identity";
import { useState } from "react";

interface DocumentPersonnelModalProps {
  open: boolean;
  onClose: () => void;
  personnel: Identity[];
  onSelectPersonnel: (person: Identity) => void;
  loading: boolean;
  error: string;
  onSearch?: (query: string) => void;
}

export default function DocumentPersonnelModal({
  open,
  onClose,
  personnel,
  onSelectPersonnel,
  loading,
  error,
  onSearch,
}: DocumentPersonnelModalProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="document-personnel-modal-title"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "70%" },
          maxWidth: 800,
          maxHeight: "80vh",
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            id="document-personnel-modal-title"
            variant="h5"
            component="h2"
            sx={{ fontWeight: "bold" }}
          >
            Select Personnel
          </Typography>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose the person who will be responsible for this document.
        </Typography>

        {/* Search Field */}
        <TextField
          fullWidth
          placeholder="Search by name or department..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography>Loading personnel...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 4, color: "error.main" }}>
            <Typography>{error}</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1, overflow: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Select</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {personnel.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No personnel found matching your search criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  personnel.map((person) => (
                    <TableRow
                      key={person.id}
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: theme.palette.action.hover },
                      }}
                      onClick={() => onSelectPersonnel(person)}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={person.avatar}
                            alt={person.name}
                            sx={{ width: 32, height: 32, mr: 1.5 }}
                          />
                          <Box>
                            <Typography variant="body2">{person.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {person.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{person.username}</TableCell>
                      <TableCell>
                        <Chip
                          label={person.role}
                          size="small"
                          sx={{
                            backgroundColor: `${theme.palette.primary.main}15`,
                            color: theme.palette.primary.main,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            "&:hover": {
                              borderColor: theme.palette.primary.dark,
                              backgroundColor: `${theme.palette.primary.main}15`,
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPersonnel(person);
                          }}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Modal>
  );
}

