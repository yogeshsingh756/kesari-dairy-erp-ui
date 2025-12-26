import { Snackbar, Alert, AlertTitle, Box, IconButton } from "@mui/material";
import { CheckCircle, Error, Warning, Info, Close } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

interface AppSnackbarProps {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  onClose: () => void;
  title?: string;
  action?: React.ReactNode;
  autoHideDuration?: number;
}

const StyledAlert = styled(Alert)(({ severity }) => ({
  borderRadius: 8,
  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  minWidth: 300,
  "& .MuiAlert-icon": {
    fontSize: 24,
  },
  ...(severity === "success" && {
    background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
    color: "white",
    "& .MuiAlert-icon": {
      color: "#81c784",
    },
  }),
  ...(severity === "error" && {
    background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
    color: "white",
    "& .MuiAlert-icon": {
      color: "#ef5350",
    },
  }),
  ...(severity === "warning" && {
    background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
    color: "white",
    "& .MuiAlert-icon": {
      color: "#ffb74d",
    },
  }),
  ...(severity === "info" && {
    background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
    color: "white",
    "& .MuiAlert-icon": {
      color: "#64b5f6",
    },
  }),
}));

export default function AppSnackbar({
  open,
  message,
  severity,
  onClose,
  title,
  action,
  autoHideDuration = 3000,
}: AppSnackbarProps) {
  const getIcon = () => {
    switch (severity) {
      case "success":
        return <CheckCircle />;
      case "error":
        return <Error />;
      case "warning":
        return <Warning />;
      case "info":
        return <Info />;
      default:
        return <Info />;
    }
  };

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    // Don't close on clickaway for better UX
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{
        "& .MuiSnackbar-root": {
          top: 24,
          right: 24,
        },
      }}
    >
      <StyledAlert
        severity={severity}
        icon={getIcon()}
        onClose={handleClose}
        variant="filled"
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {action}
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: "inherit", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        {title && <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>{title}</AlertTitle>}
        {message}
      </StyledAlert>
    </Snackbar>
  );
}
