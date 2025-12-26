import { Snackbar, Alert } from "@mui/material";

interface AppSnackbarProps {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

export default function AppSnackbar({
  open,
  message,
  severity,
  onClose,
}: AppSnackbarProps) {
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={onClose}>
      <Alert severity={severity} onClose={onClose} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}
