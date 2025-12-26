import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Avatar,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Person,
  PersonAdd,
  Save,
} from "@mui/icons-material";
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
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            overflow: "hidden"
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
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
            {isEdit ? <Person /> : <PersonAdd />}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {isEdit ? "Edit User" : "Add New User"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {isEdit ? "Update user information" : "Create a new user account"}
          </Typography>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              label="Username"
              fullWidth
              value={form.username}
              disabled={isEdit}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            {!isEdit && (
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />
            )}

            <TextField
              label="Gender"
              fullWidth
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              select
              label="User Role"
              fullWidth
              value={form.roleId}
              onChange={(e) =>
                setForm({ ...form, roleId: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.roleName}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Active User Account
                </Typography>
              }
              sx={{
                bgcolor: "grey.50",
                p: 2,
                borderRadius: 2,
                m: 0
              }}
            />
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
              background: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #E67E22 0%, #D2691E 100%)"
              },
              "&:disabled": {
                background: "#ccc",
                color: "#666"
              }
            }}
          >
            {loading ? "Processing..." : (isEdit ? "Update User" : "Create User")}
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
