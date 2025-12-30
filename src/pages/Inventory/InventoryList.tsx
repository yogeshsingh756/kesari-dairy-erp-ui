import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Avatar,
  Chip,
  TextField,
  TablePagination,
  Button,
} from "@mui/material";
import {
  Inventory,
  Category,
  Search,
} from "@mui/icons-material";
import { getInventory } from "../../api/inventory.api";
import Loader from "../../components/Loader";

interface InventoryItem {
  rawMaterialType: string;
  quantityAvailable: number;
}

export default function InventoryList() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search
  const [search, setSearch] = useState("");

  const loadInventory = async (searchTerm = search, pageNum = page, pageSize = rowsPerPage) => {
    setLoading(true);
    try {
      const params: any = {
        pageNumber: pageNum + 1,
        pageSize,
      };

      if (searchTerm) params.search = searchTerm;

      const res = await getInventory(params);
      setInventory(res.data.items || []);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      setInventory([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [page, rowsPerPage]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(0); // Reset to first page when searching
      loadInventory(search, 0, rowsPerPage);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [search]);

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
              <Inventory />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Inventory Management
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Current stock levels for all raw materials
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Search & Filters */}
        <Box sx={{ p: 3, pt: 0 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search inventory by raw material type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: "text.secondary", mr: 1 }} />
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

        {/* Content */}
        <Box sx={{ p: 3, pt: 0 }}>
          {inventory.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
              <Category sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">No inventory data available</Typography>
              <Typography variant="body2">
                Inventory will be displayed here once data is available
              </Typography>
            </Box>
          ) : (
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Raw Material</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantity Available</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow
                    key={item.rawMaterialType}
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
                          <Category sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {item.rawMaterialType}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "primary.main" }}>
                      {item.quantityAvailable.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          item.quantityAvailable > 50 ? "In Stock" :
                          item.quantityAvailable > 10 ? "Low Stock" : "Out of Stock"
                        }
                        color={
                          item.quantityAvailable > 50 ? "success" :
                          item.quantityAvailable > 10 ? "warning" : "error"
                        }
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
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

      {/* Loading */}
      <Loader open={loading} message="Loading inventory..." />
    </Box>
  );
}
