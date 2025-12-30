import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  People,
  Save,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import {
  createVendor,
  updateVendor,
  getVendorById,
} from "../../api/vendors.api";
import AppSnackbar from "../../components/AppSnackbar";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendorId?: number;
}

export default function VendorForm({
  open,
  onClose,
  onSuccess,
  vendorId,
}: Props) {
  const isEdit = Boolean(vendorId);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    contactNumber: "",
    vendorType: "",
  });

  // Handle dialog opening and form initialization
  useEffect(() => {
    if (!open) return; // Only run when dialog is open

    if (!vendorId) {
      // Add mode: reset form
      setForm({
        name: "",
        contactNumber: "",
        vendorType: "",
      });
      setLoading(false);
      setSnackbar(null);
    } else {
      // Edit mode: load data
      setLoading(true);
      setSnackbar(null);
      getVendorById(vendorId)
        .then((res: { data: any }) => {
          setForm({
            name: res.data.name,
            contactNumber: res.data.contactNumber,
            vendorType: res.data.vendorType,
          });
          setLoading(false);
        })
        .catch((error: unknown) => {
          console.error('Failed to load vendor:', error);
          setSnackbar({
            type: "error",
            message: "Failed to load vendor"
          });
          setLoading(false);
        });
    }
  }, [open, vendorId]);

  const submit = async () => {
    if (!form.name || !form.contactNumber || !form.vendorType) {
      setSnackbar({
        type: "error",
        message: "Please fill all required fields"
      });
      return;
    }

    setLoading(true);
    try {
      if (isEdit && vendorId !== undefined) {
        await updateVendor(vendorId, form);
        setSnackbar({
          type: "success",
          message: "Vendor updated successfully"
        });
      } else {
        await createVendor(form);
        setSnackbar({
          type: "success",
          message: "Vendor created successfully"
        });
      }

      onSuccess();
      // Delay closing to allow snackbar to show
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to save vendor:', error);
      setSnackbar({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save vendor"
      });
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
            background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
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
            <People sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {isEdit ? "Edit Vendor" : "Add Vendor"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {isEdit ? "Update vendor information" : "Add a new milkman or supplier"}
          </Typography>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Vendor Name"
              fullWidth
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
              InputLabelProps={{
                shrink: form.name ? true : undefined,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              label="Contact Number"
              fullWidth
              value={form.contactNumber}
              onChange={(e) =>
                setForm({ ...form, contactNumber: e.target.value })
              }
              required
              InputLabelProps={{
                shrink: form.contactNumber ? true : undefined,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            <FormControl fullWidth sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              }
            }}>
              <InputLabel shrink={form.vendorType ? true : undefined}>Vendor Type</InputLabel>
              <Select
                value={form.vendorType}
                label="Vendor Type"
                onChange={(e) =>
                  setForm({ ...form, vendorType: e.target.value })
                }
                required
              >
                <MenuItem value="MILKMAN">Milkman</MenuItem>
                <MenuItem value="SUPPLIER">Supplier</MenuItem>
              </Select>
            </FormControl>
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
              background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #7B1FA2 0%, #6A1B9A 100%)"
              },
              "&:disabled": {
                background: "#ccc",
                color: "#666"
              }
            }}
          >
            {loading ? "Processing..." : (isEdit ? "Update Vendor" : "Create Vendor")}
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
