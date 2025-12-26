import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Switch,
  FormControlLabel,
  Typography,
  Avatar,
} from "@mui/material";
import {
  Business,
  Save,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import {
  createProductType,
  updateProductType,
  getProductType,
} from "../../api/productTypes.api";
import AppSnackbar from "../../components/AppSnackbar";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productTypeId?: number;
}

export default function ProductTypeForm({
  open,
  onClose,
  onSuccess,
  productTypeId,
}: Props) {
  const isEdit = Boolean(productTypeId);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    variant: "",
    unit: "",
    quantity: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!productTypeId) return;

    setLoading(true);
    getProductType(productTypeId)
      .then((res: { data: any }) => {
        setForm(res.data);
      })
      .catch((error: unknown) => {
        console.error('Failed to load product type:', error);
        setSnackbar({
          type: "error",
          message: "Failed to load product type"
        });
      })
      .finally(() => setLoading(false));
  }, [productTypeId]);

  const submit = async () => {
    if (!form.name || !form.unit || !form.variant) {
      setSnackbar({
        type: "error",
        message: "Please fill all required fields"
      });
      return;
    }

    setLoading(true);
    try {
      if (isEdit && productTypeId !== undefined && productTypeId !== null) {
        await updateProductType({ id: productTypeId, ...form });
        setSnackbar({
          type: "success",
          message: "Product type updated successfully"
        });
      } else {
        await createProductType(form);
        setSnackbar({
          type: "success",
          message: "Product type created successfully"
        });
      }

      onSuccess();
      // Delay closing to allow snackbar to show
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to save product type:', error);
      setSnackbar({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save product type"
      });
      setLoading(false); // Don't set loading to false in finally for success case
    }
  };

  return (
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
          background: "linear-gradient(135deg, #DAA520 0%, #B8860B 100%)",
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
          <Business sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {isEdit ? "Edit Product Type" : "Add Product Type"}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {isEdit ? "Update product specifications" : "Create a new product type"}
        </Typography>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Product Name"
            fullWidth
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              }
            }}
          />

          <TextField
            label="Variant (e.g. 500 ml)"
            fullWidth
            value={form.variant}
            onChange={(e) =>
              setForm({ ...form, variant: e.target.value })
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              }
            }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              label="Unit"
              fullWidth
              value={form.unit}
              onChange={(e) =>
                setForm({ ...form, unit: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />
          </Box>

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
                Active Product Type
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
            background: "linear-gradient(135deg, #DAA520 0%, #B8860B 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #B8860B 0%, #9B7A0A 100%)"
            },
            "&:disabled": {
              background: "#ccc",
              color: "#666"
            }
          }}
        >
          {loading ? "Processing..." : (isEdit ? "Update Product" : "Create Product")}
        </Button>
      </DialogActions>

      {/* Snackbar */}
      {snackbar && (
        <AppSnackbar
          open
          severity={snackbar.type}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}
    </Dialog>
  );
}
