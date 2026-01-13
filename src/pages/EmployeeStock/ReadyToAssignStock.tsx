import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Avatar,
  Chip,
  Alert,
} from "@mui/material";
import {
  Inventory,
  Refresh,
  CheckCircle,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import {
  getFinishedProductStock,
  type FinishedProductStock,
} from "../../api/employeeStock.api";

export default function ReadyToAssignStock() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<FinishedProductStock[]>([]);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getFinishedProductStock();
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load finished product stock:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadProducts();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #FF8C00 0%, #E67E22 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Ready to Assign to Employee Stock
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  View finished products available for employee assignment
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)"
                },
                borderRadius: 2,
              }}
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ p: 0 }}>
          {products.length === 0 && !loading ? (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <Inventory sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No finished products available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Finished products will appear here once they are produced
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Inventory sx={{ fontSize: 16 }} />
                        Product Details
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="center">
                      Available Stock
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="center">
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product: FinishedProductStock, index: number) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": {
                          bgcolor: "grey.50",
                        },
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {product.productName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Variant: {product.variant}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                          {product.quantityAvailable}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          units available
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={product.quantityAvailable > 0 ? "Ready to Assign" : "Out of Stock"}
                          color={product.quantityAvailable > 0 ? "success" : "error"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            minWidth: 120,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Summary */}
        {products.length > 0 && (
          <Box sx={{ p: 3, borderTop: 1, borderColor: "divider", bgcolor: "grey.50" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                  Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total products ready for assignment: {products.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Products with stock: {products.filter(p => p.quantityAvailable > 0).length}
                </Typography>
              </Box>
              <Alert
                severity="info"
                sx={{
                  maxWidth: 400,
                  "& .MuiAlert-message": {
                    width: "100%"
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Use this stock to assign products to employees for sales distribution
                </Typography>
              </Alert>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
