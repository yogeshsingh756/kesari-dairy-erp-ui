import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  open,
  title,
  children,
  onConfirm,
  onClose,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      {children && <DialogContent>{children}</DialogContent>}
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>
        {onConfirm && (
          <Button
            onClick={onConfirm}
            color="error"
            variant="contained"
          >
            {confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
