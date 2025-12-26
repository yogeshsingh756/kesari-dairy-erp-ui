import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  createProductType,
  updateProductType,
  getProductType,
} from "../../api/productTypes.api";

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

  const [form, setForm] = useState({
    name: "",
    variant: "",
    unit: "",
    quantity: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!productTypeId) return;

    getProductType(productTypeId).then((res) => {
      setForm(res.data);
    });
  }, [productTypeId]);

  const submit = async () => {
    if (!form.name || !form.unit || !form.variant) return;

    if (isEdit && productTypeId) {
      await updateProductType({ id: productTypeId, ...form });
    } else {
      await createProductType(form);
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "Edit Product Type" : "Add Product Type"}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Variant (e.g. 500 ml)"
              fullWidth
              value={form.variant}
              onChange={(e) =>
                setForm({ ...form, variant: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Quantity(Numeric value of the unit)"
              type="number"
              fullWidth
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Unit"
              fullWidth
              value={form.unit}
              onChange={(e) =>
                setForm({ ...form, unit: e.target.value })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit}>
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
