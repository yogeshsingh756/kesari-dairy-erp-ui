import { Button, TextField, Typography, Box, Paper, Link } from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";
import { loginApi } from "../api/auth.api";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { hasPermission } from "../utils/hasPermission";
import AppSnackbar from "../components/AppSnackbar";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const submit = async () => {
    if (!data.username || !data.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await loginApi(data);

      const userPermissions = res.data.permissions;

      login({
        token: res.data.token,
        role: res.data.role,
        permissions: userPermissions,
      });

      // Redirect based on permissions
      if (hasPermission(userPermissions, "DASHBOARD_VIEW")) {
        navigate("/");
      } else if (hasPermission(userPermissions, "USER_VIEW")) {
        navigate("/users");
      } else if (hasPermission(userPermissions, "ROLE_VIEW")) {
        navigate("/roles");
      } else if (hasPermission(userPermissions, "PERMISSION_VIEW")) {
        navigate("/permissions");
      } else if (hasPermission(userPermissions, "PRODUCT_TYPE_VIEW")) {
        navigate("/product-types");
      } else if (hasPermission(userPermissions, "INGREDIENT_TYPE_VIEW")) {
        navigate("/ingredient-types");
      } else if (hasPermission(userPermissions, "PRODUCTION_BATCH_VIEW")) {
        navigate("/production-batches");
      } else if (hasPermission(userPermissions, "PURCHASE_VIEW")) {
        navigate("/purchases");
      } else if (hasPermission(userPermissions, "INVENTORY_VIEW")) {
        navigate("/inventory");
      } else if (hasPermission(userPermissions, "EMPLOYEE_STOCK_ASSIGN")) {
        navigate("/employee-stock");
      } else if (hasPermission(userPermissions, "EMPLOYEE_SALES_CREATE")) {
        navigate("/sales");
      } else if (hasPermission(userPermissions, "VENDORS_VIEW")) {
        navigate("/vendors");
      } else if (hasPermission(userPermissions, "VENDORS_LEDGERS_VIEW")) {
        navigate("/vendor-ledger");
      } else {
        // No permissions to access any modules - show warning toast and stay on login page
        setSnackbar({
          type: "info",
          message: "Login successful, but you don't have permissions to access any modules. Please contact administrator to assign permissions.",
        });
        // Don't navigate - stay on login page
      }
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FFF8F0 0%, #FFE5CC 100%)",
        p: 2
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 360,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            component="img"
            src="/kesari-logo.jpeg"
            alt="Kesari Dairy ERP Logo"
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              mb: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1
            }}
          >
            Kesari Dairy ERP
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Box
            sx={{
              bgcolor: "error.light",
              color: "error.main",
              p: 2,
              borderRadius: 2,
              mb: 2,
              fontSize: "0.875rem",
              textAlign: "center"
            }}
          >
            {error}
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={data.username}
            onChange={(e) =>
              setData({ ...data, username: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={data.password}
            onChange={(e) =>
              setData({ ...data, password: e.target.value })
            }
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 600,
            background: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #E67E22 0%, #D2691E 100%)"
            }
          }}
          onClick={submit}
          disabled={loading}
          startIcon={loading ? undefined : <LoginIcon />}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/forgot-password")}
            sx={{
              color: "primary.main",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" }
            }}
          >
            Forgot Password?
          </Link>
        </Box>
      </Paper>

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
