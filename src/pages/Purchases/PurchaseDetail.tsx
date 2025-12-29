import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Box,
  Avatar,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import {
  ShoppingCart,
  ArrowBack,
  Receipt,
  Inventory,
} from "@mui/icons-material";
import { getPurchaseById } from "../../api/purchase.api";
import Loader from "../../components/Loader";

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPurchaseDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getPurchaseById(Number(id));
        setData(res.data);
      } catch (error) {
        console.error('Failed to load purchase detail:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPurchaseDetail();
  }, [id]);

  if (loading) {
    return <Loader open={loading} message="Loading purchase details..." />;
  }

  if (!data) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Purchase not found
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/purchases")}
          sx={{ mt: 2 }}
        >
          Back to Purchases
        </Button>
      </Box>
    );
  }

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
            background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
            color: "white"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <Receipt />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Purchase Details
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Purchase #{data.purchaseId}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/purchases")}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)"
                },
                borderRadius: 2,
                px: 3
              }}
            >
              Back to Purchases
            </Button>
          </Box>
        </Box>

        {/* Purchase Summary */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <ShoppingCart sx={{ color: "success.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Purchase Summary
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 3, mb: 4 }}>
            <Box sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Purchase Date
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {new Date(data.purchaseDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>

            <Box sx={{ p: 3, bgcolor: "success.light", borderRadius: 2 }}>
              <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                Total Amount
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "success.main" }}>
                ₹{data.totalAmount?.toFixed(2) || "0.00"}
              </Typography>
            </Box>

            <Box sx={{ p: 3, bgcolor: "info.light", borderRadius: 2 }}>
              <Typography variant="body2" color="info.main" sx={{ mb: 1 }}>
                Purchase Type
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "info.main" }}>
                {data.purchaseType || "Material Purchase"}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Items Table */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Purchase Items
            </Typography>

            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Material</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rate</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items && data.items.length > 0 ? (
                  data.items.map((item: any, idx: number) => (
                    <TableRow
                      key={idx}
                      sx={{
                        "&:hover": {
                          bgcolor: "grey.50",
                        }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        <Chip
                          label={item.rawMaterialType || item.material || "N/A"}
                          size="small"
                          sx={{ bgcolor: "primary.light", color: "primary.main" }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {item.quantity || "N/A"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {item.unit || "N/A"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "info.main" }}>
                        ₹{item.ratePerUnit?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "success.main" }}>
                        ₹{item.amount?.toFixed(2) || "0.00"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                      No items found for this purchase
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Inventory Impact */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Inventory sx={{ color: "warning.main" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Inventory Impact
              </Typography>
            </Box>

            <Box sx={{ p: 3, bgcolor: "warning.light", borderRadius: 2 }}>
              <Typography variant="body1" sx={{ mb: 2, color: "warning.main", fontWeight: 600 }}>
                Stock Updates:
              </Typography>

              {data.items && data.items.length > 0 ? (
                data.items.map((item: any, idx: number) => (
                  <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2">
                      +{item.quantity || 0} {item.unit || "units"} of {item.rawMaterialType || item.material || "Material"}
                    </Typography>
                    <Chip
                      label="Added to Inventory"
                      size="small"
                      sx={{ bgcolor: "success.main", color: "white" }}
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No inventory changes recorded
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
