import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  Paper,
} from "@mui/material";
import {
  Calculate,
  LocalDrink,
} from "@mui/icons-material";
import { useState } from "react";
import { calculateMilk } from "../api/purchase.api";
import AppSnackbar from "./AppSnackbar";
import Loader from "./Loader";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MilkPriceCalculator({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [milkResult, setMilkResult] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [milk, setMilk] = useState({
    quantity: "",
    fat: "",
    clr: "",
    rate: ""
  });

  const handleCalculate = async () => {
    if (!milk.quantity || !milk.fat || !milk.clr || !milk.rate) {
      setSnackbar({
        type: "error",
        message: "Please fill all required fields"
      });
      return;
    }

    setLoading(true);
    try {
      const res = await calculateMilk(milk);

      if (res.data.isSuccess) {
        setMilkResult(res.data);
        setSnackbar({
          type: "success",
          message: res.data.message || "Milk price calculated successfully"
        });
      } else {
        setSnackbar({
          type: "error",
          message: res.data.message || "Failed to calculate milk price"
        });
        setMilkResult(null);
      }
    } catch (error) {
      console.error('Failed to calculate milk price:', error);
      setSnackbar({
        type: "error",
        message: "Failed to calculate milk price"
      });
      setMilkResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMilk({
      quantity: "",
      fat: "",
      clr: "",
      rate: ""
    });
    setMilkResult(null);
    setSnackbar(null);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            overflow: "hidden"
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
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
            <LocalDrink sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Milk Price Calculator
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Calculate milk rates and amounts for your dairy operations
          </Typography>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
              Milk Details
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 3 }}>
              <TextField
                label="Quantity (Liters)"
                type="number"
                fullWidth
                value={milk.quantity}
                onChange={(e) => setMilk({ ...milk, quantity: e.target.value })}
                InputLabelProps={{
                  shrink: milk.quantity ? true : undefined,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                label="Fat %"
                type="number"
                fullWidth
                value={milk.fat}
                onChange={(e) => setMilk({ ...milk, fat: e.target.value })}
                inputProps={{ step: 0.1 }}
                InputLabelProps={{
                  shrink: milk.fat ? true : undefined,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                label="CLR"
                type="number"
                fullWidth
                value={milk.clr}
                onChange={(e) => setMilk({ ...milk, clr: e.target.value })}
                InputLabelProps={{
                  shrink: milk.clr ? true : undefined,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                label="Rate 5300 (₹)"
                type="number"
                fullWidth
                value={milk.rate}
                onChange={(e) => setMilk({ ...milk, rate: e.target.value })}
                inputProps={{ step: 0.01 }}
                InputLabelProps={{
                  shrink: milk.rate ? true : undefined,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />
            </Box>

            <Button
              variant="contained"
              startIcon={<Calculate />}
              onClick={handleCalculate}
              disabled={loading || !milk.quantity || !milk.fat || !milk.clr || !milk.rate}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                background: "linear-gradient(135deg, #FF6347 0%, #FF4500 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #FF4500 0%, #DC143C 100%)"
                },
                "&:disabled": {
                  background: "#ccc",
                  color: "#666"
                }
              }}
            >
              Calculate Milk Rate
            </Button>

            {milkResult && (
              <>
                <Box sx={{ mt: 4, mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Calculation Results
                  </Typography>

                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 3, mb: 4 }}>
                    <Paper sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">SNF %</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{milkResult.snfPercent || "N/A"}</Typography>
                    </Paper>

                    <Paper sx={{ p: 3, bgcolor: "blue.light", borderRadius: 2 }}>
                      <Typography variant="body2" color="blue.main">Fat (Kg)</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "blue.main" }}>{milkResult.fatKg || "N/A"}</Typography>
                    </Paper>

                    <Paper sx={{ p: 3, bgcolor: "purple.light", borderRadius: 2 }}>
                      <Typography variant="body2" color="purple.main">SNF (Kg)</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "purple.main" }}>{milkResult.snfKg || "N/A"}</Typography>
                    </Paper>

                    <Paper sx={{ p: 3, bgcolor: "orange.light", borderRadius: 2 }}>
                      <Typography variant="body2" color="orange.main">Avg Rate/Kg</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "orange.main" }}>₹{milkResult.avgRatePerKg || "N/A"}</Typography>
                    </Paper>
                  </Box>

                  <Paper sx={{ p: 4, bgcolor: "success.light", borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1, color: "success.main", fontWeight: 600 }}>
                      Total Amount
                    </Typography>
                    <Typography variant="h4" sx={{ color: "success.main", fontWeight: 700 }}>
                      ₹{milkResult.totalAmount?.toFixed(2) || "0.00"}
                    </Typography>
                  </Paper>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {snackbar && (
        <AppSnackbar
          open
          severity={snackbar.type}
          message={snackbar.message}
          onClose={() => setSnackbar(null)}
        />
      )}

      {/* Loader */}
      <Loader open={loading} message="Calculating milk price..." />
    </>
  );
}
