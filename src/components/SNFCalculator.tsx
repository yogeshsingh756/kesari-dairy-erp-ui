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
  Science,
} from "@mui/icons-material";
import { useState } from "react";
import AppSnackbar from "./AppSnackbar";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SNFCalculator({ open, onClose }: Props) {
  const [snfResult, setSnfResult] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [inputs, setInputs] = useState({
    fat: "",
    clr: ""
  });

  const calculateSNF = (clr: number, fat: number) => {
    let snfRaw = (clr / 4) + (0.21 * fat) + 0.10;
    return Math.floor(snfRaw * 100) / 100; // truncate to 2 decimal places
  };

  const handleCalculate = () => {
    if (!inputs.fat || !inputs.clr) {
      setSnackbar({
        type: "error",
        message: "Please enter both FAT and CLR values"
      });
      return;
    }

    const fatValue = parseFloat(inputs.fat);
    const clrValue = parseFloat(inputs.clr);

    if (isNaN(fatValue) || isNaN(clrValue)) {
      setSnackbar({
        type: "error",
        message: "Please enter valid numeric values"
      });
      return;
    }

    const result = calculateSNF(clrValue, fatValue);
    setSnfResult(result);
    setSnackbar({
      type: "success",
      message: "SNF calculated successfully"
    });
  };

  const handleClose = () => {
    setInputs({
      fat: "",
      clr: ""
    });
    setSnfResult(null);
    setSnackbar(null);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
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
            <Science sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            SNF Calculator
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Calculate SNF from FAT and CLR values
          </Typography>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
              Milk Quality Parameters
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 3 }}>
              <TextField
                label="FAT %"
                type="number"
                fullWidth
                value={inputs.fat}
                onChange={(e) => setInputs({ ...inputs, fat: e.target.value })}
                inputProps={{ step: 0.1, min: 0, max: 20 }}
                InputLabelProps={{
                  shrink: inputs.fat ? true : undefined,
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
                value={inputs.clr}
                onChange={(e) => setInputs({ ...inputs, clr: e.target.value })}
                inputProps={{ min: 0 }}
                InputLabelProps={{
                  shrink: inputs.clr ? true : undefined,
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
              disabled={!inputs.fat || !inputs.clr}
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
              Calculate SNF
            </Button>

            {snfResult !== null && (
              <>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Calculation Result
                  </Typography>

                  <Paper sx={{ p: 4, bgcolor: "success.light", borderRadius: 2, textAlign: "center" }}>
                    <Typography variant="h6" sx={{ mb: 1, color: "success.main", fontWeight: 600 }}>
                      SNF %
                    </Typography>
                    <Typography variant="h3" sx={{ color: "success.main", fontWeight: 700 }}>
                      {snfResult}%
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                      Formula: (CLR ÷ 4) + (0.21 × FAT) + 0.10
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
    </>
  );
}
