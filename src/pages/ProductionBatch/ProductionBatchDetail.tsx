import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Paper,
} from "@mui/material";
import {
  Factory,
  Close,
  Info,
  ShoppingCart,
  AccountBalanceWallet,
  TrendingUp,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { getProductionBatchById } from "../../api/productionBatches.api";

interface Props {
  id: number;
  onClose: () => void;
}

export default function ProductionBatchDetail({ id, onClose }: Props) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getProductionBatchById(id)
        .then(r => setData(r.data))
        .catch(error => console.error('Failed to load batch details:', error));
    }
  }, [id]);

  if (!data) return null;

  return (
    <Dialog
      open
      fullWidth
      maxWidth="lg"
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          overflow: "hidden",
          maxHeight: "90vh"
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
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
          Production Batch #{data.id}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Detailed information and ingredients
        </Typography>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Batch Overview Cards */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "info.light",
                color: "info.contrastText",
                flex: "1 1 250px",
                minWidth: 200
              }}
            >
              <Info sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                #{data.id}
              </Typography>
              <Typography variant="body2">Batch ID</Typography>
            </Paper>

            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "warning.light",
                color: "warning.contrastText",
                flex: "1 1 250px",
                minWidth: 200
              }}
            >
              <ShoppingCart sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₹{data.basePricePerUnit?.toFixed(2)}
              </Typography>
              <Typography variant="body2">Base Price/Unit</Typography>
            </Paper>

            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "success.light",
                color: "success.contrastText",
                flex: "1 1 250px",
                minWidth: 200
              }}
            >
              <AccountBalanceWallet sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₹{data.actualCostPerUnit?.toFixed(2)}
              </Typography>
              <Typography variant="body2">Actual Cost/Unit</Typography>
            </Paper>

            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "error.light",
                color: "error.contrastText",
                flex: "1 1 250px",
                minWidth: 200
              }}
            >
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₹{data.totalCost?.toFixed(2)}
              </Typography>
              <Typography variant="body2">Total Cost</Typography>
            </Paper>
          </Box>

          {/* Batch Details */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Batch Information
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              <Box sx={{ flex: "1 1 300px", minWidth: 250 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Product:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {data.productName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Batch Quantity:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {data.batchQuantity}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Unit:
                    </Typography>
                    <Chip label={data.batchUnit} color="primary" size="small" />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Selling Price/Unit:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "success.main" }}>
                      ₹{data.sellingPricePerUnit?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ flex: "1 1 300px", minWidth: 250 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      FAT (%):
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {data.fat || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      SNF (%):
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {data.snf || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Processing Fee/Unit:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      ₹{data.processingFeePerUnit || '0.00'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Batch Date:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(data.batchDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Ingredients Table */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Ingredients Used
            </Typography>
            <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Ingredient</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Quantity Used</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cost per Unit</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.ingredients && data.ingredients.length > 0 ? (
                    data.ingredients.map((ingredient: any, idx: number) => (
                      <TableRow key={idx} sx={{ "&:hover": { bgcolor: "grey.25" } }}>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {ingredient.ingredientTypeName}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {ingredient.quantityUsed}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={ingredient.unit}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          ₹{ingredient.costPerUnit?.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "success.main" }}>
                          ₹{ingredient.totalCost?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                        No ingredients found for this batch
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<Close />}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
