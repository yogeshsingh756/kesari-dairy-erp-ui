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
} from "@mui/material";
import {
  ShoppingCart,
  Add,
} from "@mui/icons-material";
import { getPurchases } from "../../api/purchase.api";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";

export default function PurchaseList() {
  const [rows, setRows] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filters
  const [rawMaterialFilter, setRawMaterialFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadPurchases = async (pageNum = page, pageSize = rowsPerPage) => {
    setLoading(true);
    try {
      const params: any = {
        pageNumber: pageNum + 1,
        pageSize
      };

      if (rawMaterialFilter) params.rawMaterialType = rawMaterialFilter;
      if (fromDateFilter) params.fromDate = fromDateFilter;
      if (toDateFilter) params.toDate = toDateFilter;

      const res = await getPurchases(params);
      setRows(res.data.items || []);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (error) {
      console.error('Failed to load purchases:', error);
      setRows([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases(page, rowsPerPage);
  }, [page, rowsPerPage, rawMaterialFilter, fromDateFilter, toDateFilter]);

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
                <ShoppingCart />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Purchase Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all purchase transactions and inventory
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/purchases/new")}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)"
                },
                borderRadius: 2,
                px: 3
              }}
            >
              New Purchase
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              label="Raw Material"
              value={rawMaterialFilter}
              onChange={(e) => setRawMaterialFilter(e.target.value)}
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              label="From Date"
              type="date"
              value={fromDateFilter}
              onChange={(e) => setFromDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              label="To Date"
              type="date"
              value={toDateFilter}
              onChange={(e) => setToDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />
            {(rawMaterialFilter || fromDateFilter || toDateFilter) && (
              <Button
                variant="outlined"
                onClick={() => {
                  setRawMaterialFilter("");
                  setFromDateFilter("");
                  setToDateFilter("");
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
              <ShoppingCart sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">No purchases found</Typography>
              <Typography variant="body2">
                Create your first purchase to get started
              </Typography>
            </Box>
          ) : (
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Material</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(r => (
                  <TableRow
                    key={r.purchaseId}
                    sx={{
                      "&:hover": {
                        bgcolor: "grey.50",
                        cursor: "pointer"
                      }
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={`#${r.purchaseId}`}
                        size="small"
                        sx={{
                          bgcolor: "primary.main",
                          color: "white",
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {new Date(r.purchaseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {r.rawMaterialType || "N/A"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {r.quantity || "N/A"} {r.unit}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "success.main" }}>
                      ₹{r.amount?.toFixed(2) || r.ratePerUnit?.toFixed(2) || "0.00"}
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
      <Loader open={loading} message="Loading purchases..." />
    </Box>
  );
}
