import { useEffect, useState } from "react";
import {
  Button,
  Paper,
  Typography,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Security,
  PersonAdd,
  Edit,
  Delete,
} from "@mui/icons-material";

import { getRoles, deleteRole } from "../../api/roles.api";
import { hasPermission } from "../../utils/hasPermission";
import { useAuth } from "../../auth/useAuth";
import RoleForm from "./RoleForm";
import Loader from "../../components/Loader";
import AppSnackbar from "../../components/AppSnackbar";

interface Role {
  id: string;
  roleName: string;
  description: string;
}

export default function RoleList() {
  const { state } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await getRoles();
      setRoles(res.data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const onEdit = (id: string) => {
    setEditId(id);
    setOpenForm(true);
  };

  const onDelete = async (id: string) => {
    const role = roles.find(r => r.id === id);
    if (!role) return;

    if (!window.confirm(`Delete role "${role.roleName}"?`)) return;

    setLoading(true);
    try {
      await deleteRole(id);
      setSnackbar({
        type: "success",
        message: `Role "${role.roleName}" deleted successfully`
      });
      loadRoles();
    } catch (error) {
      console.error('Failed to delete role:', error);
      setSnackbar({
        type: "error",
        message: "Failed to delete role"
      });
    } finally {
      setLoading(false);
    }
  };

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
            background: "linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)",
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
                <Security />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Role Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage system roles and their permissions
                </Typography>
              </Box>
            </Box>

            {hasPermission(state.permissions, "ROLE_CREATE") && (
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
                Add Role
              </Button>
            )}
          </Stack>
        </Box>

        {/* Table */}
        <Box sx={{ p: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Role Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Description
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", width: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: "center", py: 6 }}>
                    <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                      <Security sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6">No roles found</Typography>
                      <Typography variant="body2">
                        Start by adding your first role
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "grey.50" },
                      transition: "background-color 0.2s ease"
                    }}
                  >
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {r.roleName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {r.description || "No description"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {hasPermission(state.permissions, "ROLE_EDIT") && (
                          <Tooltip title="Edit Role">
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
                              onClick={() => onEdit(r.id)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {hasPermission(state.permissions, "ROLE_DELETE") && (
                          <Tooltip title="Delete Role">
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
                              onClick={() => onDelete(r.id)}
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
        </Box>
      </Paper>

      {/* Role Form */}
      <RoleForm
        open={openForm}
        roleId={editId}
        onClose={() => setOpenForm(false)}
        onSuccess={loadRoles}
      />

      {/* Loading */}
      <Loader open={loading} message="Loading roles..." />

      {/* Snackbar */}
      {snackbar && (
        <AppSnackbar
          open
          severity={snackbar.type}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}
    </Box>
  );
}
