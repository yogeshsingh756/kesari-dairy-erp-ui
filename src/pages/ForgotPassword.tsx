import { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Alert,
  Link,
} from "@mui/material";
import { ArrowBack, LockReset } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { verifyUserApi, changePasswordApi } from "../api/auth.api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"verify" | "change">("verify");
  const [verify, setVerify] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async () => {
    if (!verify.trim()) {
      setError("Please enter username or email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await verifyUserApi(verify.trim());
      if (res.data === "User Found") {
        setStep("change");
        setSuccess("");
      } else {
        setError("User not found");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      setError("Please enter new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await changePasswordApi({ verify: verify.trim(), newPassword });
      if (res.data === "Password changed successfully") {
        setSuccess("Password changed successfully. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("Failed to change password");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Password change failed");
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
          maxWidth: 400,
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
              width: 60,
              height: 60,
              borderRadius: 2,
              mb: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              mb: 1
            }}
          >
            {step === "verify" ? "Forgot Password" : "Change Password"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {step === "verify"
              ? "Enter your username or email to verify"
              : "Enter your new password"
            }
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {step === "verify" ? (
          <>
            <TextField
              fullWidth
              label="Username or Email"
              margin="normal"
              value={verify}
              onChange={(e) => setVerify(e.target.value)}
              disabled={loading}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                mt: 2,
                fontSize: "1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #E67E22 0%, #D2691E 100%)"
                }
              }}
              onClick={handleVerify}
              disabled={loading}
              startIcon={<LockReset />}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </>
        ) : (
          <>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                mt: 2,
                fontSize: "1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #FF9933 0%, #E67E22 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #E67E22 0%, #D2691E 100%)"
                }
              }}
              onClick={handleChangePassword}
              disabled={loading}
              startIcon={<LockReset />}
            >
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </>
        )}

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/login")}
            sx={{
              color: "primary.main",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" }
            }}
          >
            <ArrowBack sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
            Back to Login
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
