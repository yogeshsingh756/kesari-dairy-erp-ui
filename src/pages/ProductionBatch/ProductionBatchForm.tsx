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
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Factory,
  Save,
  Add,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { getProductDropdown } from "../../api/productTypes.api";
import { getIngredientDropdown } from "../../api/ingredientTypes.api";
import { getUnits } from "../../api/common.api";
import { createProductionBatch, updateProductionBatch, getProductionBatchById } from "../../api/productionBatches.api";
import AppSnackbar from "../../components/AppSnackbar";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editId?: number | null;
}

export default function ProductionBatchForm({ open, onClose, onSuccess, editId }: Props) {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
    productId: "",
    basePricePerUnit: "",
    batchQuantity: "",
    batchUnit: "LITER",
    fat: "",
    snf: "",
    processingFeePerUnit: "",
    batchDate: new Date().toISOString().slice(0, 10),
    ingredients: []
  });

  // Handle dialog opening and data loading
  useEffect(() => {
    if (!open) return;

    // Reset form
    setForm({
      productId: "",
      basePricePerUnit: "",
      batchQuantity: "",
      batchUnit: "LITER",
      fat: "",
      snf: "",
      processingFeePerUnit: "",
      batchDate: new Date().toISOString().slice(0, 10),
      ingredients: []
    });
    setLoading(false);
    setSnackbar(null);

    // Load data
    const loadData = async () => {
      try {
        const [productsRes, ingredientsRes, unitsRes] = await Promise.all([
          getProductDropdown(),
          getIngredientDropdown(),
          getUnits()
        ]);

        setProducts(productsRes.data);
        setIngredients(ingredientsRes.data);
        setUnits(unitsRes.data);

        // If editing, load existing batch data
        if (editId) {
          const batchRes = await getProductionBatchById(editId);
          const batchData = batchRes.data;

          // Convert ingredients format
          const formattedIngredients = batchData.ingredients.map((ing: any) => ({
            ingredientTypeId: ing.ingredientTypeId,
            quantityUsed: ing.quantityUsed,
            unit: ing.unit,
            costPerUnit: ing.costPerUnit
          }));

          setForm({
            productId: batchData.productId,
            basePricePerUnit: batchData.basePricePerUnit || "",
            batchQuantity: batchData.batchQuantity,
            batchUnit: batchData.batchUnit,
            fat: batchData.fat || "",
            snf: batchData.snf || "",
            processingFeePerUnit: batchData.processingFeePerUnit || "",
            batchDate: batchData.batchDate ? new Date(batchData.batchDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            ingredients: formattedIngredients
          });
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setSnackbar({
          type: "error",
          message: "Failed to load form data"
        });
      }
    };

    loadData();
  }, [open, editId]);

  const addIngredient = () => {
    setForm({
      ...form,
      ingredients: [...form.ingredients, { ingredientTypeId: "", quantityUsed: "", unit: "", costPerUnit: "" }]
    });
  };

  const removeIngredient = (idx: number) => {
    setForm({
      ...form,
      ingredients: form.ingredients.filter((_: any, i: number) => i !== idx)
    });
  };

  const submit = async () => {
    if (!form.productId || !form.batchQuantity || !form.batchUnit) {
      setSnackbar({
        type: "error",
        message: "Please fill all required fields"
      });
      return;
    }

    if (form.ingredients.length === 0) {
      setSnackbar({
        type: "error",
        message: "Please add at least one ingredient"
      });
      return;
    }

    for (let i = 0; i < form.ingredients.length; i++) {
      if (!form.ingredients[i].ingredientTypeId || !form.ingredients[i].quantityUsed) {
        setSnackbar({
          type: "error",
          message: "Please fill all ingredient details"
        });
        return;
      }
    }

    setLoading(true);
    try {
      if (editId) {
        await updateProductionBatch(editId, form);
        setSnackbar({
          type: "success",
          message: "Production batch updated successfully"
        });
      } else {
        await createProductionBatch(form);
        setSnackbar({
          type: "success",
          message: "Production batch created successfully"
        });
      }
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to save production batch:', error);
      setSnackbar({
        type: "error",
        message: error instanceof Error ? error.message : `Failed to ${editId ? 'update' : 'create'} production batch`
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
        maxWidth="md"
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
            background: "linear-gradient(135deg, #FF6347 0%, #FF4500 100%)",
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
            <Factory sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {editId ? "Update Production Batch" : "Create Production Batch"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {editId ? "Modify production batch details and ingredients" : "Set up a new production batch with ingredients"}
          </Typography>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Product and Batch Details */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  ...(editId && { bgcolor: "grey.50" })
                }
              }}>
                <InputLabel>Product</InputLabel>
                <Select
                  value={form.productId}
                  label="Product"
                  onChange={(e) => {
                    if (!editId) {
                      const selectedProduct = products.find(p => p.id == e.target.value);
                      setForm({
                        ...form,
                        productId: e.target.value,
                        basePricePerUnit: selectedProduct ? selectedProduct.basePricePerUnit || "" : ""
                      });
                    }
                  }}
                  disabled={!!editId}
                  required
                >
                  <MenuItem value="">
                    <em>Select Product</em>
                  </MenuItem>
                  {products.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Base Price per Unit (₹)"
                type="number"
                fullWidth
                value={form.basePricePerUnit}
                onChange={(e) => setForm({ ...form, basePricePerUnit: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                label="Batch Quantity"
                type="number"
                fullWidth
                value={form.batchQuantity}
                onChange={(e) => setForm({ ...form, batchQuantity: e.target.value })}
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
                  ...(editId && { bgcolor: "grey.50" })
                }
              }}>
                <InputLabel>Batch Unit</InputLabel>
                <Select
                  value={form.batchUnit}
                  label="Batch Unit"
                  onChange={(e) => setForm({ ...form, batchUnit: e.target.value })}
                  disabled={!!editId}
                  required
                >
                  <MenuItem value="">
                    <em>Select Unit</em>
                  </MenuItem>
                  {units.map(u => (
                    <MenuItem key={u.code} value={u.code}>{u.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Additional Fields */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="FAT (%)"
                type="number"
                fullWidth
                value={form.fat}
                onChange={(e) => setForm({ ...form, fat: e.target.value })}
                inputProps={{ min: 0, step: 0.1 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                label="SNF (%)"
                type="number"
                fullWidth
                value={form.snf}
                onChange={(e) => setForm({ ...form, snf: e.target.value })}
                inputProps={{ min: 0, step: 0.1 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                label="Processing Fee per Unit (₹)"
                type="number"
                fullWidth
                value={form.processingFeePerUnit}
                onChange={(e) => setForm({ ...form, processingFeePerUnit: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />
            </Box>

            {/* Ingredients Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Ingredients
              </Typography>

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addIngredient}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                Add Ingredient
              </Button>

              {form.ingredients.map((ing: any, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    mb: 2,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "grey.50"
                  }}
                >
                  <FormControl fullWidth sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}>
                    <InputLabel>Ingredient</InputLabel>
                    <Select
                      value={ing.ingredientTypeId}
                      label="Ingredient"
                      onChange={(e) => {
                        const selected = ingredients.find(i => i.id == e.target.value);
                        if (selected) {
                          form.ingredients[idx] = {
                            ...form.ingredients[idx],
                            ingredientTypeId: selected.id,
                            unit: selected.unit,
                            costPerUnit: selected.costPerUnit
                          };
                          setForm({ ...form });
                        }
                      }}
                      required
                    >
                      <MenuItem value="">
                        <em>Select Ingredient</em>
                      </MenuItem>
                      {ingredients.map(i => (
                        <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Quantity Used"
                    type="number"
                    fullWidth
                    value={ing.quantityUsed}
                    onChange={(e) => {
                      form.ingredients[idx].quantityUsed = e.target.value;
                      setForm({ ...form });
                    }}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      }
                    }}
                  />

                  <TextField
                    label="Unit"
                    fullWidth
                    value={ing.unit}
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: "grey.100"
                      }
                    }}
                  />

                  <TextField
                    label="Cost per Unit (₹)"
                    type="number"
                    fullWidth
                    value={ing.costPerUnit}
                    onChange={(e) => {
                      form.ingredients[idx].costPerUnit = e.target.value;
                      setForm({ ...form });
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      }
                    }}
                  />

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeIngredient(idx)}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
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
              background: "linear-gradient(135deg, #FF6347 0%, #FF4500 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #FF4500 0%, #DC143C 100%)"
              },
              "&:disabled": {
                background: "#ccc",
                color: "#666"
              }
            }}
          >
            {loading ? (editId ? "Updating..." : "Creating...") : (editId ? "Update Batch" : "Create Batch")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
