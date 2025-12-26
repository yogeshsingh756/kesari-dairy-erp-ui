import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";
import { createUser, updateUser, getUser } from "../../api/users.api";
import { getRoles } from "../../api/roles.api";
import AppSnackbar from "../../components/AppSnackbar";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: string; // edit mode if present
}

interface Role {
  id: string;
  roleName: string;
}

export default function UserForm({
  open,
  onClose,
  onSuccess,
  userId,
}: Props) {
  const isEdit = Boolean(userId);

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    gender: "",
    roleId: "",
    isActive: true,
  });

  /* -------- LOAD ROLES -------- */
  useEffect(() => {
    getRoles().then((res: { data: Role[] }) => setRoles(res.data));
  }, []);

  /* -------- LOAD USER (EDIT) -------- */
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    getUser(userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: { data: any }) => {
        setForm({
          fullName: res.data.fullName,
          username: res.data.username,
          email: res.data.email,
          password: "",
          gender: res.data.gender || "",
          roleId: res.data.roleId,
          isActive: res.data.isActive,
        });
      })
      .catch(() =>
        setSnackbar({
          type: "error",
          message: "Failed to load user",
        })
      )
      .finally(() => setLoading(false));
  }, [userId]);

  /* -------- SUBMIT -------- */
  const submit = async () => {
    if (!form.fullName || !form.username || !form.email || !form.roleId) {
      setSnackbar({
        type: "error",
        message: "Please fill required fields",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEdit && userId) {
        await updateUser({ id: userId, ...form, role: form.roleId });
        setSnackbar({
          type: "success",
          message: "User updated successfully",
        });
      } else {
        await createUser({
          ...form,
          role: form.roleId
        });
        setSnackbar({
          type: "success",
          message: "User created successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (e: unknown) {
      setSnackbar({
        type: "error",
        message: e instanceof Error ? e.message : "Action failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid size={12}>
              <TextField
                label="Full Name"
                fullWidth
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Username"
                fullWidth
                value={form.username}
                disabled={isEdit}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />
            </Grid>

            {!isEdit && (
              <Grid size={12}>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </Grid>
            )}

            <Grid size={12}>
              <TextField
                label="Gender"
                fullWidth
                value={form.gender}
                onChange={(e) =>
                  setForm({ ...form, gender: e.target.value })
                }
              />
            </Grid>

            <Grid size={12}>
              <TextField
                select
                label="Role"
                fullWidth
                value={form.roleId}
                onChange={(e) =>
                  setForm({ ...form, roleId: e.target.value })
                }
                required
              >
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.roleName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={loading}
            startIcon={loading && <CircularProgress size={18} />}
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
