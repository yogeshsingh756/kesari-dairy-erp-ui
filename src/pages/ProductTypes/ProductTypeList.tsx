import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
} from "@mui/material";
import { useAuth } from "../../auth/useAuth";
import { hasPermission } from "../../utils/hasPermission";
import {
  getProductTypes,
  deleteProductType,
} from "../../api/productTypes.api";
import ProductTypeForm from "./ProductTypeForm";
import ConfirmDialog from "../../components/ConfirmDialog";

interface ProductType {
  id: number;
  name: string;
  variant: string;
  unit: string;
  quantity: number;
  isActive: boolean;
}

export default function ProductTypeList() {
  const { state } = useAuth();

  const [rows, setRows] = useState<ProductType[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    const res = await getProductTypes();
    setRows(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Product Types</Typography>

        {hasPermission(state.permissions, "PRODUCT_TYPE_CREATE") && (
          <Button
            variant="contained"
            onClick={() => {
              setEditId(null);
              setOpenForm(true);
            }}
          >
            Add Product Type
          </Button>
        )}
      </Stack>

      {/* Table */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Variant</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Status</TableCell>
            <TableCell width={160}>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.variant}</TableCell>
              <TableCell>{r.quantity}</TableCell>
              <TableCell>{r.unit}</TableCell>
              <TableCell>{r.isActive ? "Active" : "Inactive"}</TableCell>

              <TableCell>
                <Stack direction="row" spacing={1}>
                  {hasPermission(state.permissions, "PRODUCT_TYPE_EDIT") && (
                    <Button
                      size="small"
                      onClick={() => {
                        setEditId(r.id);
                        setOpenForm(true);
                      }}
                    >
                      Edit
                    </Button>
                  )}

                  {hasPermission(state.permissions, "PRODUCT_TYPE_DELETE") && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setDeleteId(r.id)}
                    >
                      Delete
                    </Button>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Form */}
      <ProductTypeForm
        open={openForm}
        productTypeId={editId ?? undefined}
        onClose={() => setOpenForm(false)}
        onSuccess={load}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete this product type?"
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteProductType(deleteId);
            setDeleteId(null);
            load();
          }
        }}
      />
    </Paper>
  );
}
