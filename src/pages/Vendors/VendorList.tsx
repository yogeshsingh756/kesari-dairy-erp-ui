import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  TextField,
  Avatar,
  Chip,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  People,
  Add,
  Edit,
  Delete,
  Search,
  Phone,
} from "@mui/icons-material";
import { getVendorsPaged, deleteVendor } from "../../api/vendors.api";
import { hasPermission } from "../../utils/hasPermission";
import { useAuth } from "../../auth/useAuth";
import Loader from "../../components/Loader";
import ConfirmDialog from "../../components/ConfirmDialog";
import AppSnackbar from "../../components/AppSnackbar";
import VendorForm from "./VendorForm";

interface Vendor {
  id: number;
  name: string;
  contactNumber: string;
  vendorType: string;
}

export default function VendorList() {
  const { state } = useAuth();

  const [rows, setRows] = useState<Vendor[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [vendorTypeFilter, setVendorTypeFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<number | undefined>();

  const loadVendors = async (
    pageNum = page,
    pageSize = rowsPerPage,
    searchTerm = search,
    vendorType = vendorTypeFilter
  ) => {
    setLoading(true);
    try {
      const params: any = {
        pageNumber: pageNum + 1,
        pageSize,
      };

      if (searchTerm) params.search = searchTerm;
      if (vendorType) params.vendorType = vendorType;

      const res = await getVendorsPaged(params);
      // Handle both direct array response and paged response
      if (Array.isArray(res.data)) {
        setRows(res.data);
        setTotalRecords(res.data.length);
      } else {
        setRows(res.data.items || []);
        setTotalRecords(res.data.totalRecords || 0);
      }
    } catch (error) {
      console.error('Failed to load vendors:', error);
      setRows([]);
      setTotalRecords(0);
      setSnackbar({
        type: "error",
        message: "Failed to load vendors"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [page, rowsPerPage]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(0); // Reset to first page when searching
      loadVendors(0, rowsPerPage, search, vendorTypeFilter);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [search, vendorTypeFilter]);

  const onEdit = (id: number) => {
    setEditingVendorId(id);
    setEditDialogOpen(true);
  };

  const onDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await deleteVendor(deleteId);
      setSnackbar({
        type: "success",
        message: "Vendor deleted successfully"
      });
      loadVendors();
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      setSnackbar({
        type: "error",
        message: "Failed to delete vendor"
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
            background: "linear-gradient(135deg, #FF8C00 0%, #E67E22 100%)",
            color: "white"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <People />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Vendor Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage your milkmen and suppliers
                </Typography>
              </Box>
            </Box>

            {hasPermission(state.permissions, "VENDORS_CREATE") && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)"
                  },
                  borderRadius: 2,
                  px: 3
                }}
              >
                Add Vendor
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              label="Search Vendors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              sx={{
                minWidth: 250,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            <FormControl sx={{
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              }
            }}>
              <InputLabel>Vendor Type</InputLabel>
              <Select
                value={vendorTypeFilter}
                label="Vendor Type"
                onChange={(e) => setVendorTypeFilter(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                <MenuItem value="MILKMAN">Milkman</MenuItem>
                <MenuItem value="SUPPLIER">Supplier</MenuItem>
              </Select>
            </FormControl>

            {(search || vendorTypeFilter) && (
              <Button
                variant="outlined"
                onClick={() => {
                  setSearch("");
                  setVendorTypeFilter("");
                  setPage(0);
                }}
                sx={{ borderRadius: 2 }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {rows.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
              <People sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">No vendors found</Typography>
              <Typography variant="body2">
                Add your first vendor to get started
              </Typography>
            </Box>
          ) : (
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Vendor Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 120 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((vendor) => (
                  <TableRow
                    key={vendor.id}
                    sx={{
                      "&:hover": {
                        bgcolor: "grey.50",
                        cursor: "pointer"
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                          <People sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {vendor.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body1">
                          {vendor.contactNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Chip
                        label={vendor.vendorType}
                        size="small"
                        color={vendor.vendorType === "MILKMAN" ? "primary" : "secondary"}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {hasPermission(state.permissions, "VENDORS_EDIT") && (
                          <Tooltip title="Edit Vendor">
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
                              onClick={() => onEdit(vendor.id)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {hasPermission(state.permissions, "VENDORS_DELETE") && (
                          <Tooltip title="Delete Vendor">
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
                              onClick={() => onDelete(vendor.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalRecords > 0 && (
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
          )}
        </Box>
      </Paper>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete this vendor?"
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      {/* Loading */}
      <Loader open={loading} message="Loading vendors..." />

      {/* Create Vendor Dialog */}
      <VendorForm
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          loadVendors();
        }}
      />

      {/* Edit Vendor Dialog */}
      <VendorForm
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingVendorId(undefined);
        }}
        onSuccess={() => {
          setEditDialogOpen(false);
          setEditingVendorId(undefined);
          loadVendors();
        }}
        vendorId={editingVendorId}
      />

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
