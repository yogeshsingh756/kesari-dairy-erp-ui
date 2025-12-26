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
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Business,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useAuth } from "../../auth/useAuth";
import { hasPermission } from "../../utils/hasPermission";
import {
  getProductTypes,
  deleteProductType,
} from "../../api/productTypes.api";
import ProductTypeForm from "./ProductTypeForm";
import ConfirmDialog from "../../components/ConfirmDialog";
import Loader from "../../components/Loader";
import AppSnackbar from "../../components/AppSnackbar";

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
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProductTypes();
      setRows(res.data);
    } catch (error) {
      console.error('Failed to load product types:', error);
      setSnackbar({
        type: "error",
        message: "Failed to load product types"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #DAA520 0%, #B8860B 100%)",
            color: "white"
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <Business />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Product Type Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage dairy product types and specifications
                </Typography>
              </Box>
            </Box>

            {hasPermission(state.permissions, "PRODUCT_TYPE_CREATE") && (
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)"
                  }
                }}
                onClick={() => {
                  setEditId(null);
                  setOpenForm(true);
                }}
              >
                Add Product Type
              </Button>
            )}
          </Stack>
        </Box>

        {/* Table */}
        <Box sx={{ p: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Product Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Variant
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Unit
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", width: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 6 }}>
                    <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                      <Business sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6">No product types found</Typography>
                      <Typography variant="body2">
                        Start by adding your first product type
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "grey.50" },
                      transition: "background-color 0.2s ease"
                    }}
                  >
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {r.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.variant}
                        size="small"
                        sx={{
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {r.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {r.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {r.isActive ? (
                          <>
                            <CheckCircle sx={{ color: "success.main", fontSize: 18 }} />
                            <Typography variant="body2" color="success.main">
                              Active
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Cancel sx={{ color: "error.main", fontSize: 18 }} />
                            <Typography variant="body2" color="error.main">
                              Inactive
                            </Typography>
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {hasPermission(state.permissions, "PRODUCT_TYPE_EDIT") && (
                          <Tooltip title="Edit Product Type">
                            <IconButton
                              size="small"
                              sx={{
                                bgcolor: "primary.light",
                                color: "primary.main",
                                "&:hover": {
                                  bgcolor: "primary.main",
                                  color: "white"
                                }
                              }}
                              onClick={() => {
                                setEditId(r.id);
                                setOpenForm(true);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {hasPermission(state.permissions, "PRODUCT_TYPE_DELETE") && (
                          <Tooltip title="Delete Product Type">
                            <IconButton
                              size="small"
                              sx={{
                                bgcolor: "error.light",
                                color: "error.main",
                                "&:hover": {
                                  bgcolor: "error.main",
                                  color: "white"
                                }
                              }}
                              onClick={() => setDeleteId(r.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>

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
            setLoading(true);
            try {
              await deleteProductType(deleteId);
              setSnackbar({
                type: "success",
                message: "Product type deleted successfully"
              });
              load();
            } catch (error) {
              console.error('Failed to delete product type:', error);
              setSnackbar({
                type: "error",
                message: "Failed to delete product type"
              });
            } finally {
              setLoading(false);
              setDeleteId(null);
            }
          }
        }}
      />

      {/* Loading */}
      <Loader open={loading} message="Processing..." />

      {/* Snackbar */}
      {snackbar && (
        <AppSnackbar
          open
          severity={snackbar.type}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}
    </Paper>
    </Box>
  );
}
