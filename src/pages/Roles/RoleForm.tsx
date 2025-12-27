import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Avatar,
  Chip,
  FormControl,
  FormGroup,
  Paper,
} from "@mui/material";
import {
  Security,
  PersonAdd,
  Save,
  VpnKey,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import {
  createRole,
  updateRole,
  getRoleById,
} from "../../api/roles.api";
import { getPermissions } from "../../api/permissions.api";
import AppSnackbar from "../../components/AppSnackbar";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roleId?: string;
}

/* ---------- TYPES (MATCH BACKEND) ---------- */

interface Permission {
  id: number;
  permissionKey: string;
  permissionName: string;
}

interface PermissionGroup {
  moduleName: string;
  permissions: Permission[];
}

export default function RoleForm({
  open,
  onClose,
  onSuccess,
  roleId,
}: Props) {
  const isEdit = Boolean(roleId);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<PermissionGroup[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  // Handle dialog opening and form initialization
  useEffect(() => {
    if (!open) return; // Only run when dialog is open

    if (!roleId) {
      // Add mode: reset form
      setRoleName("");
      setDescription("");
      setSelected([]);
      setLoading(false);
      setSnackbar(null);
    } else {
      // Edit mode: load data
      setLoading(true);
      setSnackbar(null);
      getRoleById(roleId)
        .then((res) => {
          setRoleName(res.data.roleName);
          setDescription(res.data.description || "");
          setSelected(res.data.permissionIds || []);
          setLoading(false); // Reset loading after successful data load
        })
        .catch(() =>
          setSnackbar({ type: "error", message: "Failed to load role" })
        )
        .finally(() => setLoading(false));
    }
  }, [open, roleId]);

  /* -------- LOAD PERMISSIONS -------- */
  useEffect(() => {
    getPermissions("", 1, 100) // Get all permissions for the form
      .then((res) => {
        // Handle both paginated and direct response formats
        const permissionsData = res.data.items || res.data || [];
        setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
      })
      .catch(() =>
        setSnackbar({
          type: "error",
          message: "Failed to load permissions",
        })
      );
  }, []);

  /* -------- TOGGLE PERMISSION -------- */
  const togglePermission = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* -------- SUBMIT -------- */
  const submit = async () => {
    if (!roleName) {
      setSnackbar({
        type: "error",
        message: "Role name is required",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        roleName,
        description,
        permissionIds: selected, // number[]
      };

      if (isEdit && roleId) {
        await updateRole({ id: roleId, ...payload });
        setSnackbar({
          type: "success",
          message: "Role updated successfully",
        });
      } else {
        await createRole(payload);
        setSnackbar({
          type: "success",
          message: "Role created successfully",
        });
      }

      onSuccess();
      // Delay closing to allow snackbar to show
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (e) {
      setSnackbar({
        type: "error",
        message: "Action failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPermissionCount = () => selected.length;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            overflow: "hidden",
            maxHeight: "90vh"
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)",
            color: "white",
            textAlign: "center"
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "rgba(255,255,255,0.2)",
              mx: "auto",
              mb: 2
            }}
          >
            {isEdit ? <Security /> : <PersonAdd />}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {isEdit ? "Edit Role" : "Create New Role"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {isEdit ? "Update role permissions and details" : "Define a new role with specific permissions"}
          </Typography>
          {selected.length > 0 && (
            <Chip
              label={`${getPermissionCount()} permission${getPermissionCount() !== 1 ? 's' : ''} selected`}
              sx={{
                mt: 2,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "& .MuiChip-label": { fontWeight: 500 }
              }}
            />
          )}
        </Box>

        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
                Basic Information
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  label="Role Name"
                  fullWidth
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  label="Description (Optional)"
                  fullWidth
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a brief description of this role..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Permissions */}
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
                Permissions
              </Typography>

              {permissions.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                  <VpnKey sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1">Loading permissions...</Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {permissions.map((group) => (
                    <Paper
                      key={group.moduleName}
                      elevation={1}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider"
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          gap: 1
                        }}
                      >
                        <VpnKey fontSize="small" />
                        {group.moduleName}
                      </Typography>

                      <FormControl component="fieldset" sx={{ width: "100%" }}>
                        <FormGroup sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2 }}>
                          {group.permissions.map((permission) => (
                            <FormControlLabel
                              key={permission.id}
                              control={
                                <Checkbox
                                  checked={selected.includes(permission.id)}
                                  onChange={() => togglePermission(permission.id)}
                                  sx={{
                                    color: "primary.main",
                                    "&.Mui-checked": {
                                      color: "primary.main",
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {permission.permissionName}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    {permission.permissionKey}
                                  </Typography>
                                </Box>
                              }
                              sx={{
                                m: 0,
                                alignItems: "flex-start",
                                "& .MuiFormControlLabel-label": {
                                  marginTop: 0.5,
                                },
                              }}
                            />
                          ))}
                        </FormGroup>
                      </FormControl>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={loading}
            startIcon={loading ? undefined : <Save />}
            sx={{
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #D2691E 0%, #B8651A 100%)"
              },
              "&:disabled": {
                background: "#ccc",
                color: "#666"
              }
            }}
          >
            {loading ? "Processing..." : (isEdit ? "Update Role" : "Create Role")}
          </Button>
        </DialogActions>
      </Dialog>

      {snackbar && (
        <AppSnackbar
          open
          severity={snackbar.type}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}
    </>
  );
}
