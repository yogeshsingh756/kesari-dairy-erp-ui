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
  Avatar,
  Chip,
} from "@mui/material";
import {
  Factory,
  Add,
  Visibility,
} from "@mui/icons-material";
import { getProductionBatches } from "../../api/productionBatches.api";
import ProductionBatchForm from "./ProductionBatchForm";
import ProductionBatchDetail from "./ProductionBatchDetail";
import Loader from "../../components/Loader";

export default function ProductionBatchList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getProductionBatches({ pageNumber: 1, pageSize: 10 });
      setRows(res.data.items);
    } catch (error) {
      console.error('Failed to load production batches:', error);
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
            background: "linear-gradient(135deg, #FF6347 0%, #FF4500 100%)",
            color: "white"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <Factory />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Production Batches
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage production batches and their ingredients
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenForm(true)}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)"
                },
                borderRadius: 2,
                px: 3
              }}
            >
              Add Batch
            </Button>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {rows.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
              <Factory sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">No production batches found</Typography>
              <Typography variant="body2">
                Create your first production batch to get started
              </Typography>
            </Box>
          ) : (
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Product ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Batch Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Base Price/Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actual Cost/Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Selling Price/Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Cost</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(r => (
                  <TableRow
                    key={r.id}
                    sx={{
                      "&:hover": {
                        bgcolor: "grey.50",
                        cursor: "pointer"
                      }
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={`#${r.id}`}
                        size="small"
                        sx={{
                          bgcolor: "primary.main",
                          color: "white",
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {r.productId}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {r.batchQuantity}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.batchUnit}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "info.main" }}>
                      ₹{r.basePricePerUnit?.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "warning.main" }}>
                      ₹{r.actualCostPerUnit?.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "success.main" }}>
                      ₹{r.sellingPricePerUnit?.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "error.main" }}>
                      ₹{r.totalCost?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {new Date(r.batchDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => setDetailId(r.id)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none"
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>

      {/* Modals */}
      {openForm && (
        <ProductionBatchForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSuccess={load}
        />
      )}

      {detailId && (
        <ProductionBatchDetail
          id={detailId}
          onClose={() => setDetailId(null)}
        />
      )}

      {/* Loading */}
      <Loader open={loading} message="Loading production batches..." />
    </Box>
  );
}
