import { useEffect, useState } from "react";
import {
  Button,
  Paper,
  Typography,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  TablePagination,
} from "@mui/material";
import {
  Restaurant,
  Add,
  Edit,
  Delete,
  Search,
  MonetizationOn,
} from "@mui/icons-material";

import { useAuth } from "../../auth/useAuth";
import { hasPermission } from "../../utils/hasPermission";
import {
  getIngredientTypes,
  deleteIngredientType,
} from "../../api/ingredientTypes.api";
import IngredientTypeForm from "./IngredientTypeForm";
import ConfirmDialog from "../../components/ConfirmDialog";
import Loader from "../../components/Loader";
import AppSnackbar from "../../components/AppSnackbar";

interface IngredientType {
  id: number;
  name: string;
  unit: string;
  costPerUnit: number;
  description: string;
}

export default function IngredientTypeList() {
  const { state } = useAuth();

  const [rows, setRows] = useState<IngredientType[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Pagination & Search
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const load = async (searchTerm = search, pageNum = page, pageSize = rowsPerPage) => {
    setLoading(true);
    try {
      const res = await getIngredientTypes(searchTerm, pageNum + 1, pageSize); // API uses 1-based indexing
      setRows(res.data.items || res.data);
      setTotalRecords(res.data.totalRecords || res.data.length || 0);
    } catch (error) {
      console.error('Failed to load ingredient types:', error);
      setSnackbar({
        type: "error",
        message: "Failed to load ingredient types"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Effect for pagination and search changes
  useEffect(() => {
    load(search, page, rowsPerPage);
  }, [page, rowsPerPage]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(0); // Reset to first page when searching
      load(search, 0, rowsPerPage);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [search]);

  const onEdit = (id: number) => {
    setEditId(id);
    setOpenForm(true);
  };

  const onDelete = async (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await deleteIngredientType(deleteId);
      setSnackbar({
        type: "success",
        message: "Ingredient type deleted successfully"
      });
      load();
    } catch (error) {
      console.error('Failed to delete ingredient type:', error);
      setSnackbar({
        type: "error",
        message: "Failed to delete ingredient type"
      });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

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
            background: "linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)",
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
                <Restaurant />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Ingredient Type Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage dairy ingredients and their specifications
                </Typography>
              </Box>
            </Box>

            {hasPermission(state.permissions, "INGREDIENT_TYPE_CREATE") && (
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
                Add Ingredient Type
              </Button>
            )}
          </Stack>
        </Box>

        {/* Search & Filters */}
        <Box sx={{ p: 3, pt: 0 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search ingredient types by name, unit, or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0); // Reset to first page when searching
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 400,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              }
            }}
          />
        </Box>

        {/* Table */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Ingredient Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Unit
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Cost per Unit
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Description
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.95rem", width: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 6 }}>
                    <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                      <Restaurant sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6">No ingredient types found</Typography>
                      <Typography variant="body2">
                        Start by adding your first ingredient type
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
                        label={r.unit}
                        size="small"
                        sx={{
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <MonetizationOn sx={{ color: "success.main", fontSize: 18 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          ₹{r.costPerUnit.toFixed(2)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {r.description || "No description"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {hasPermission(state.permissions, "INGREDIENT_TYPE_EDIT") && (
                          <Tooltip title="Edit Ingredient Type">
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
                              onClick={() => onEdit(r.id)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {hasPermission(state.permissions, "INGREDIENT_TYPE_DELETE") && (
                          <Tooltip title="Delete Ingredient Type">
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
                              onClick={() => onDelete(r.id)}
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

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalRecords}
            page={page}
            onPageChange={(_event, newPage) => {
              setPage(newPage);
            }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              "& .MuiTablePagination-toolbar": {
                py: 2,
              },
            }}
          />
        </Box>
      </Paper>

      {/* Form */}
      <IngredientTypeForm
        open={openForm}
        ingredientTypeId={editId ?? undefined}
        onClose={() => setOpenForm(false)}
        onSuccess={load}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete this ingredient type?"
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
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
    </Box>
  );
}
