import { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Stack,
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  TablePagination,
} from "@mui/material";
import {
  People,
  PersonAdd,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Search,
} from "@mui/icons-material";

import { getUsers, deleteUser } from "../../api/users.api";
import { hasPermission } from "../../utils/hasPermission";
import { useAuth } from "../../auth/useAuth";

import Loader from "../../components/Loader";
import AppSnackbar from "../../components/AppSnackbar";
import ConfirmDialog from "../../components/ConfirmDialog";
import UserForm from "./UserForm";

interface User {
  id: string;
  fullName: string;
  username: string;
  mobileNumber?: string;
  role: string;
  isActive: boolean;
}

export default function UserList() {
  const { state } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();

  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Pagination & Search
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const loadUsers = async (searchTerm = search, pageNum = page, pageSize = rowsPerPage) => {
    setLoading(true);
    try {
      const res = await getUsers(searchTerm, pageNum + 1, pageSize); // API uses 1-based indexing
      setUsers(res.data.items || res.data);
      setTotalRecords(res.data.totalRecords || res.data.length || 0);
    } catch (err: unknown) {
      setSnackbar({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await deleteUser(deleteId);
      setSnackbar({
        type: "success",
        message: "User deleted successfully",
      });
      await loadUsers();
    } catch (err: unknown) {
      setSnackbar({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete user",
      });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Effect for pagination and search changes
  useEffect(() => {
    loadUsers(search, page, rowsPerPage);
  }, [page, rowsPerPage]);

  // Debounced search effect - skip when auto-filling
  useEffect(() => {
    if (isAutoFilling) {
      setIsAutoFilling(false); // Reset flag
      return; // Don't trigger search effect for auto-fill
    }

    const timeoutId = setTimeout(() => {
      setPage(0); // Reset to first page when searching
      loadUsers(search, 0, rowsPerPage);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [search, isAutoFilling]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
            color: "white"
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <People />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  User Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage system users and their access levels
                </Typography>
              </Box>
            </Box>

            {hasPermission(state.permissions, "USER_CREATE") && (
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)"
                  }
                }}
                onClick={() => {
                  setEditId(undefined);
                  setOpenForm(true);
                }}
              >
                Add User
              </Button>
            )}
          </Stack>
        </Box>

        {/* Search & Filters */}
        <Box sx={{ p: 3, pt: 0 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name, username, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0); // Reset to first page when searching
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 400,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              }
            }}
          />
        </Box>

        {/* Table */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Full Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Username
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Mobile Number
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Role
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", width: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 6 }}>
                    <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                      <People sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6">No users found</Typography>
                      <Typography variant="body2">
                        Start by adding your first user
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow
                    key={u.id}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "grey.50" },
                      transition: "background-color 0.2s ease"
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {u.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {u.fullName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {u.username}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {u.mobileNumber || "Not provided"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        sx={{
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {u.isActive ? (
                          <>
                            <CheckCircle sx={{ color: "success.main", fontSize: 18 }} />
                            <Typography variant="body2" color="success.main">
                              Active
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Cancel sx={{ color: "error.main", fontSize: 18 }} />
                            <Typography variant="body2" color="error.main">
                              Inactive
                            </Typography>
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {hasPermission(state.permissions, "USER_EDIT") && (
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              sx={{
                                bgcolor: "primary.light",
                                color: "primary.main",
                                "&:hover": {
                                  bgcolor: "primary.main",
                                  color: "white"
                                }
                              }}
                              onClick={() => {
                                setEditId(u.id);
                                setOpenForm(true);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {hasPermission(state.permissions, "USER_DELETE") && (
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              sx={{
                                bgcolor: "error.light",
                                color: "error.main",
                                "&:hover": {
                                  bgcolor: "error.main",
                                  color: "white"
                                }
                              }}
                              onClick={() => setDeleteId(u.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalRecords}
            page={page}
            onPageChange={(_event, newPage) => {
              setPage(newPage);
            }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              "& .MuiTablePagination-toolbar": {
                py: 2,
              },
            }}
          />
        </Box>
      </Paper>

      {/* Dialogs & Feedback */}
      <UserForm
        open={openForm}
        userId={editId}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          loadUsers();
        }}
      />

      <Loader open={loading} />

      {snackbar && (
        <AppSnackbar
          open
          severity={snackbar.type}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Are you sure you want to delete this user?"
        onConfirm={confirmDelete}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
}
