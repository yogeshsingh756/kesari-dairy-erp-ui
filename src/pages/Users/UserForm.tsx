import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
import { verifyEmailApi, verifyUsernameApi } from "../../api/auth.api";
import AppSnackbar from "../../components/AppSnackbar";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (userData?: any) => void;
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
    mobileNumber: "",
    gender: "",
    roleId: "",
    isActive: true,
  });

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    username: "",
  });

  // Handle dialog opening and form initialization
  useEffect(() => {
    if (!open) return; // Only run when dialog is open

    if (!userId) {
      // Add mode: reset form
      setForm({
        fullName: "",
        username: "",
        email: "",
        password: "",
        mobileNumber: "",
        gender: "",
        roleId: "",
        isActive: true,
      });
      setValidationErrors({
        email: "",
        username: "",
      });
      setLoading(false);
      setSnackbar(null);
    } else {
      // Edit mode: load data
      setLoading(true);
      setSnackbar(null);
      getUser(userId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((res: { data: any }) => {
          setForm({
            fullName: res.data.fullName,
            username: res.data.username,
            email: res.data.email,
            mobileNumber: res.data.mobileNumber || "",
            password: "",
            gender: res.data.gender || "",
            roleId: res.data.roleId,
            isActive: res.data.isActive,
          });
          setValidationErrors({
            email: "",
            username: "",
          });
          setLoading(false); // Reset loading after successful data load
        })
        .catch(() =>
          setSnackbar({
            type: "error",
            message: "Failed to load user",
          })
        )
        .finally(() => setLoading(false));
    }
  }, [open, userId]);

  /* -------- LOAD ROLES -------- */
  useEffect(() => {
    getRoles("", 1, 100) // Get all roles for the dropdown, no search, page 1, large page size
      .then((res: { data: any }) => {
        // Handle both old and new API response formats
        const rolesData = res.data.items || res.data || [];
        setRoles(Array.isArray(rolesData) ? rolesData : []);
      })
      .catch((error) => {
        console.error('Failed to load roles:', error);
        setRoles([]); // Set empty array on error
      });
  }, []);

  /* -------- VALIDATION FUNCTIONS -------- */
  const validateEmail = async (email: string) => {
    if (!email.trim()) {
      setValidationErrors(prev => ({ ...prev, email: "" }));
      return;
    }

    try {
      const res = await verifyEmailApi(email.trim());
      if (res.data === "User Found") {
        setValidationErrors(prev => ({ ...prev, email: "Email already exists" }));
      } else {
        setValidationErrors(prev => ({ ...prev, email: "" }));
      }
    } catch (error) {
      console.error("Email validation error:", error);
      setValidationErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const validateUsername = async (username: string) => {
    if (!username.trim()) {
      setValidationErrors(prev => ({ ...prev, username: "" }));
      return;
    }

    try {
      const res = await verifyUsernameApi(username.trim());
      if (res.data === "User Found") {
        setValidationErrors(prev => ({ ...prev, username: "Username already exists" }));
      } else {
        setValidationErrors(prev => ({ ...prev, username: "" }));
      }
    } catch (error) {
      console.error("Username validation error:", error);
      setValidationErrors(prev => ({ ...prev, username: "" }));
    }
  };

  /* -------- SUBMIT -------- */
  const submit = async () => {
    if (!form.fullName || !form.username || !form.email || !form.roleId) {
      setSnackbar({
        type: "error",
        message: "Please fill required fields",
      });
      return;
    }

    // Check for validation errors
    if (validationErrors.username || validationErrors.email) {
      setSnackbar({
        type: "error",
        message: "Please resolve validation errors before submitting",
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

      // Pass the created/updated user data to onSuccess callback
      const userData = isEdit ? { ...form, id: userId } : { ...form, id: "temp" };
      onSuccess(userData);
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
            p: 2,
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
              error={!!validationErrors.username}
              helperText={validationErrors.username}
              onChange={(e) => {
                setForm({ ...form, username: e.target.value });
                // Clear error when user starts typing
                if (validationErrors.username) {
                  setValidationErrors(prev => ({ ...prev, username: "" }));
                }
              }}
              onBlur={(e) => {
                if (!isEdit && e.target.value.trim()) {
                  validateUsername(e.target.value);
                }
              }}
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
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                // Clear error when user starts typing
                if (validationErrors.email) {
                  setValidationErrors(prev => ({ ...prev, email: "" }));
                }
              }}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  validateEmail(e.target.value);
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              label="Mobile Number"
              type="tel"
              fullWidth
              value={form.mobileNumber}
              onChange={(e) =>
                setForm({ ...form, mobileNumber: e.target.value })
              }
              placeholder="Enter mobile number (optional)"
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

            <FormControl fullWidth sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              }
            }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={form.gender}
                label="Gender"
                onChange={(e) =>
                  setForm({ ...form, gender: e.target.value })
                }
              >
                <MenuItem value="">
                  <em>Select Gender</em>
                </MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>

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
