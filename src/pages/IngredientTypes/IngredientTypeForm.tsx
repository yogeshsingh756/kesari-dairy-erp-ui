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
  Restaurant,
  Save,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import {
  createIngredientType,
  updateIngredientType,
  getIngredientType,
} from "../../api/ingredientTypes.api";
import AppSnackbar from "../../components/AppSnackbar";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ingredientTypeId?: number;
}

export default function IngredientTypeForm({
  open,
  onClose,
  onSuccess,
  ingredientTypeId,
}: Props) {
  const isEdit = Boolean(ingredientTypeId);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    unit: "",
    costPerUnit: 0,
    description: "",
  });

  // Handle dialog opening and form initialization
  useEffect(() => {
    if (!open) return; // Only run when dialog is open

    if (!ingredientTypeId) {
      // Add mode: reset form
      setForm({
        name: "",
        unit: "",
        costPerUnit: 0,
        description: "",
      });
      setLoading(false);
      setSnackbar(null);
    } else {
      // Edit mode: load data
      setLoading(true);
      setSnackbar(null);
      getIngredientType(ingredientTypeId)
        .then((res: { data: any }) => {
          setForm({
            name: res.data.name,
            unit: res.data.unit,
            costPerUnit: res.data.costPerUnit,
            description: res.data.description || "",
          });
          setLoading(false); // Reset loading after successful data load
        })
        .catch((error: unknown) => {
          console.error('Failed to load ingredient type:', error);
          setSnackbar({
            type: "error",
            message: "Failed to load ingredient type"
          });
          setLoading(false); // Reset loading on error
        });
    }
  }, [open, ingredientTypeId]);

  const submit = async () => {
    if (!form.name || !form.unit || form.costPerUnit <= 0) {
      setSnackbar({
        type: "error",
        message: "Please fill all required fields with valid data"
      });
      return;
    }

    setLoading(true);
    try {
      if (isEdit && ingredientTypeId !== undefined) {
        await updateIngredientType({ id: ingredientTypeId, ...form });
        setSnackbar({
          type: "success",
          message: "Ingredient type updated successfully"
        });
      } else {
        await createIngredientType(form);
        setSnackbar({
          type: "success",
          message: "Ingredient type created successfully"
        });
      }

      onSuccess();
      // Delay closing to allow snackbar to show
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to save ingredient type:', error);
      setSnackbar({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save ingredient type"
      });
      setLoading(false); // Don't set loading to false in finally for success case
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
            background: "linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)",
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
            <Restaurant sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {isEdit ? "Edit Ingredient Type" : "Add Ingredient Type"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {isEdit ? "Update ingredient specifications" : "Create a new ingredient type"}
          </Typography>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Ingredient Name"
              fullWidth
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
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
              <InputLabel>Unit</InputLabel>
              <Select
                value={form.unit}
                label="Unit"
                onChange={(e) =>
                  setForm({ ...form, unit: e.target.value })
                }
                required
              >
                <MenuItem value="">
                  <em>Select Unit</em>
                </MenuItem>
                <MenuItem value="KG">KG</MenuItem>
                <MenuItem value="LITER">LITER</MenuItem>
                <MenuItem value="ML">ML</MenuItem>
                <MenuItem value="GRAM">GRAM</MenuItem>
                <MenuItem value="PIECE">PIECE</MenuItem>
                <MenuItem value="PACKET">PACKET</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Cost per Unit (₹)"
              type="number"
              fullWidth
              value={form.costPerUnit}
              onChange={(e) =>
                setForm({ ...form, costPerUnit: Number(e.target.value) })
              }
              required
              inputProps={{ min: 0, step: 0.01 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Enter a brief description of this ingredient..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
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
              background: "linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #E55A2B 0%, #D4491F 100%)"
              },
              "&:disabled": {
                background: "#ccc",
                color: "#666"
              }
            }}
          >
            {loading ? "Processing..." : (isEdit ? "Update Ingredient" : "Create Ingredient")}
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
