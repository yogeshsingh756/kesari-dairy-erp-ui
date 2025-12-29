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
} from "@mui/material";
import {
  Inventory,
  Category,
} from "@mui/icons-material";
import { getInventory } from "../../api/inventory.api";
import Loader from "../../components/Loader";

interface InventoryItem {
  rawMaterialType: string;
  quantityAvailable: number;
}

export default function InventoryList() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInventory = async () => {
      setLoading(true);
      try {
        const res = await getInventory();
        // API returns direct array, not wrapped in {data: ...}
        setInventory(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Failed to load inventory:', error);
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };
    loadInventory();
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
            background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
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

        {/* Content */}
        <Box sx={{ p: 3 }}>
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
        </Box>
      </Paper>

      {/* Loading */}
      <Loader open={loading} message="Loading inventory..." />
    </Box>
  );
}
