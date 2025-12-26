import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Typography,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
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

  /* -------- LOAD PERMISSIONS -------- */
  useEffect(() => {
    getPermissions()
      .then((res) => setPermissions(res.data))
      .catch(() =>
        setSnackbar({
          type: "error",
          message: "Failed to load permissions",
        })
      );
  }, []);

  /* -------- LOAD ROLE (EDIT) -------- */
  useEffect(() => {
    if (!roleId) return;

    setLoading(true);
    getRoleById(roleId)
      .then((res) => {
        setRoleName(res.data.roleName);
        setDescription(res.data.description || "");
        setSelected(res.data.permissionIds || []);
      })
      .catch(() =>
        setSnackbar({ type: "error", message: "Failed to load role" })
      )
      .finally(() => setLoading(false));
  }, [roleId]);

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
      onClose();
    } catch (e) {
      setSnackbar({
        type: "error",
        message: "Action failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{isEdit ? "Edit Role" : "Add Role"}</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid size={12}>
              <TextField
                label="Role Name"
                fullWidth
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Description"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="subtitle1" mt={2}>
                Permissions
              </Typography>
              <Divider sx={{ mb: 1 }} />
            </Grid>

            {permissions.map((group) => (
              <Grid size={12} key={group.moduleName}>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  {group.moduleName}
                </Typography>

                <Grid container>
                  {group.permissions.map((p) => (
                    <Grid size={6} key={p.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selected.includes(p.id)}
                            onChange={() => togglePermission(p.id)}
                          />
                        }
                        label={p.permissionName}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={18} /> : null
            }
          >
            {isEdit ? "Update" : "Create"}
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
