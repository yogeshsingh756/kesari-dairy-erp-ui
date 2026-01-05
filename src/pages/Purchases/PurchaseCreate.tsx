import {
  Box, Tabs, Tab, TextField, Button, Paper, Typography, MenuItem, FormControl, InputLabel, Select, Avatar, Divider, Autocomplete
} from "@mui/material";
import {
  ShoppingCart,
  Calculate,
  Save,
  LocalDrink,
  Category,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import {
  calculateMilk,
  confirmMilk,
  calculateOtherMaterial,
  confirmOtherMaterial
} from "../../api/purchase.api";
import { getUnits } from "../../api/common.api";
import { getVendors } from "../../api/vendors.api";
import { useNavigate } from "react-router-dom";

export default function PurchaseCreate() {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);



  // MILK
  const [milk, setMilk] = useState({
    quantity: "",
    fat: "",
    clr: "",
    rate: ""
  });
  const [milkResult, setMilkResult] = useState<any>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);

  // OTHER
  const [other, setOther] = useState<any>({
    rawMaterialType: "",
    quantity: "",
    unit: "",
    ratePerUnit: ""
  });
  const [otherAmount, setOtherAmount] = useState<number | null>(null);
  const [units, setUnits] = useState<string[]>([]);

  // VENDORS
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [newVendor, setNewVendor] = useState({
    vendorName: "",
    contactNumber: "",
    vendorType: ""
  });
  const [paidAmount, setPaidAmount] = useState<string>("");

  // Load units from API
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const res = await getUnits();
        // Handle different possible response formats
        let unitsData: string[] = [];

        if (Array.isArray(res.data)) {
          // Check if array contains objects or strings
          if (res.data.length > 0 && typeof res.data[0] === 'object') {
            // Handle object format: [{code: "KG", label: "Kilogram"}, ...]
            unitsData = res.data.map((item: any) => item.code || item.value || item);
          } else {
            // Handle string array: ["KG", "LITER", ...]
            unitsData = res.data;
          }
        } else if (res.data && typeof res.data === 'object') {
          // Handle object response format
          unitsData = Object.values(res.data) || [];
        }

        // Only update if we got valid data
        if (unitsData.length > 0) {
          // Remove duplicates and filter out non-string values
          const uniqueUnits = [...new Set(unitsData.filter(u => typeof u === 'string'))];
          setUnits(uniqueUnits);
        }
      } catch (error) {
        console.error('Failed to load units:', error);
        // Keep default units as fallback
      }
    };
    loadUnits();
  }, []);

  // Load vendors from API
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const res = await getVendors();
        setVendors(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Failed to load vendors:', error);
        setVendors([]);
      }
    };
    loadVendors();
  }, []);

  // Clear form data when switching tabs
  useEffect(() => {
    // Clear milk form data and results
    setMilk({
      quantity: "",
      fat: "",
      clr: "",
      rate: ""
    });
    setMilkResult(null);

    // Clear other material form data and results
    setOther({
      rawMaterialType: "",
      quantity: "",
      unit: "",
      ratePerUnit: ""
    });
    setOtherAmount(null);

    // Clear vendor data
    setSelectedVendor("");
    setNewVendor({
      vendorName: "",
      contactNumber: "",
      vendorType: ""
    });
    setPaidAmount("");
  }, [tab]);

  const handleMilkCalculate = async () => {
    setLoading(true);
    try {
      const res = await calculateMilk(milk);
      setMilkResult(res.data);
    } catch (error) {
      console.error('Failed to calculate milk:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMilkConfirmWithVendor = async (totalAmount: number, vendorData: any) => {
    setLoading(true);
    try {
      await confirmMilk({
        ...milk,
        ...milkResult,
        amount: totalAmount,
        ...vendorData
      });
      navigate("/purchases");
    } catch (error) {
      console.error('Failed to confirm milk purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtherCalculate = async () => {
    setLoading(true);
    try {
      const res = await calculateOtherMaterial(other);
      setOtherAmount(res.data.amount);
    } catch (error) {
      console.error('Failed to calculate other material:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtherConfirmWithVendor = async (totalAmount: number, vendorData: any) => {
    setLoading(true);
    try {
      await confirmOtherMaterial({
        ...other,
        amount: totalAmount,
        ...vendorData
      });
      navigate("/purchases");
    } catch (error) {
      console.error('Failed to confirm other material purchase:', error);
    } finally {
      setLoading(false);
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
              <ShoppingCart />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Create New Purchase
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Purchase milk or other raw materials for your dairy
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            sx={{
              px: 3,
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                minHeight: 64,
                borderRadius: "8px 8px 0 0",
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
              }
            }}
          >
            <Tab
              icon={<LocalDrink />}
              label="Milk Purchase"
              iconPosition="start"
              sx={{ mr: 2 }}
            />
            <Tab
              icon={<Category />}
              label="Other Material"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          {/* MILK TAB */}
          {tab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}>
                Milk Purchase Details
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 3, mb: 4 }}>
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

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<Calculate />}
                  onClick={handleMilkCalculate}
                  disabled={loading || !milk.quantity || !milk.fat || !milk.clr || !milk.rate}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)"
                    },
                    "&:disabled": {
                      background: "#ccc",
                      color: "#666"
                    }
                  }}
                >
                  Calculate Milk Rate
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsManualEntry(!isManualEntry);
                    if (!isManualEntry) {
                      // Switching to manual entry, clear calculated results
                      setMilkResult(null);
                    }
                  }}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    borderColor: "warning.main",
                    color: "warning.main",
                    "&:hover": {
                      borderColor: "warning.dark",
                      bgcolor: "warning.light",
                      color: "warning.dark"
                    }
                  }}
                >
                  {isManualEntry ? "Use Calculator" : "Manual Entry"}
                </Button>
              </Box>

              {isManualEntry && (
                <Box sx={{ mt: 3, p: 3, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "warning.main" }}>
                    Manual Entry Mode
                  </Typography>

                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 3, mb: 3 }}>
                    <TextField
                      label="SNF %"
                      type="number"
                      fullWidth
                      value={milkResult?.snfPercent || ""}
                      onChange={(e) => setMilkResult({ ...milkResult, snfPercent: parseFloat(e.target.value) })}
                      inputProps={{ step: 0.01 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        }
                      }}
                    />

                    <TextField
                      label="Fat (Kg)"
                      type="number"
                      fullWidth
                      value={milkResult?.fatKg || ""}
                      onChange={(e) => setMilkResult({ ...milkResult, fatKg: parseFloat(e.target.value) })}
                      inputProps={{ step: 0.01 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        }
                      }}
                    />

                    <TextField
                      label="SNF (Kg)"
                      type="number"
                      fullWidth
                      value={milkResult?.snfKg || ""}
                      onChange={(e) => setMilkResult({ ...milkResult, snfKg: parseFloat(e.target.value) })}
                      inputProps={{ step: 0.01 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        }
                      }}
                    />

                    <TextField
                      label="Avg Rate/Kg (₹)"
                      type="number"
                      fullWidth
                      value={milkResult?.avgRatePerKg || ""}
                      onChange={(e) => setMilkResult({ ...milkResult, avgRatePerKg: parseFloat(e.target.value) })}
                      inputProps={{ step: 0.01 }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>

                  <TextField
                    label="Total Amount (₹)"
                    type="number"
                    fullWidth
                    value={milkResult?.totalAmount || ""}
                    onChange={(e) => setMilkResult({ ...milkResult, totalAmount: parseFloat(e.target.value) })}
                    inputProps={{ step: 0.01 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                      mb: 3
                    }}
                  />

                  <Typography variant="body2" sx={{ color: "warning.main", fontWeight: 500 }}>
                    Note: Enter all calculation values manually. This bypasses the API calculation.
                  </Typography>
                </Box>
              )}

              {milkResult && (
                <>
                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
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

                  <Paper sx={{ p: 4, bgcolor: "success.light", borderRadius: 2, mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 1, color: "success.main", fontWeight: 600 }}>
                      Total Amount
                    </Typography>
                    <Typography variant="h4" sx={{ color: "success.main", fontWeight: 700 }}>
                      ₹{milkResult.totalAmount?.toFixed(2) || "0.00"}
                    </Typography>
                  </Paper>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}>
                    Vendor & Payment Details
                  </Typography>

                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 3, mb: 3 }}>
                    <Autocomplete
                      fullWidth
                      disabled={selectedVendor === "new"}
                      options={vendors}
                      getOptionLabel={(option: any) => `${option.name} (${option.contactNumber})`}
                      value={vendors.find((v: any) => v.id === selectedVendor) || null}
                      onChange={(_, newValue) => {
                        setSelectedVendor(newValue ? newValue.id : "");
                        if (newValue) {
                          // Reset new vendor fields when selecting existing vendor
                          setNewVendor({
                            vendorName: "",
                            contactNumber: "",
                            vendorType: ""
                          });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Vendor"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            }
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {option.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.contactNumber} • {option.vendorType}
                            </Typography>
                          </Box>
                        </li>
                      )}
                      noOptionsText="No vendors found"
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />

                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedVendor("new");
                        setNewVendor({
                          vendorName: "",
                          contactNumber: "",
                          vendorType: ""
                        });
                      }}
                      disabled={selectedVendor === "new"}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        borderColor: "primary.main",
                        color: "primary.main",
                        "&:hover": {
                          borderColor: "primary.dark",
                          bgcolor: "primary.light"
                        },
                        "&:disabled": {
                          borderColor: "#ccc",
                          color: "#ccc"
                        }
                      }}
                    >
                      + Add New Vendor
                    </Button>
                  </Box>

                  {selectedVendor === "new" && (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 3, mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                      <Typography variant="h6" sx={{ gridColumn: "1 / -1", mb: 1, color: "primary.main" }}>
                        New Vendor Details
                      </Typography>

                      <TextField
                        label="Vendor Name"
                        fullWidth
                        value={newVendor.vendorName}
                        onChange={(e) => setNewVendor({ ...newVendor, vendorName: e.target.value })}
                        InputLabelProps={{
                          shrink: newVendor.vendorName ? true : undefined,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          }
                        }}
                      />

                      <TextField
                        label="Contact Number"
                        fullWidth
                        value={newVendor.contactNumber}
                        onChange={(e) => setNewVendor({ ...newVendor, contactNumber: e.target.value })}
                        InputLabelProps={{
                          shrink: newVendor.contactNumber ? true : undefined,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          }
                        }}
                      />

                      <FormControl fullWidth sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        }
                      }}>
                        <InputLabel shrink={newVendor.vendorType ? true : undefined}>Vendor Type</InputLabel>
                        <Select
                          value={newVendor.vendorType}
                          label="Vendor Type"
                          onChange={(e) => setNewVendor({ ...newVendor, vendorType: e.target.value })}
                        >
                          <MenuItem value="MILKMAN">Milkman</MenuItem>
                          <MenuItem value="SUPPLIER">Supplier</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  <TextField
                    label="Paid Amount (₹)"
                    type="number"
                    fullWidth
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    inputProps={{ step: 0.01, min: 0 }}
                    InputLabelProps={{
                      shrink: paidAmount ? true : undefined,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                      mb: 4
                    }}
                  />

                  {paidAmount && (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 3, mb: 4 }}>
                      <Paper sx={{ p: 3, bgcolor: "warning.light", borderRadius: 2 }}>
                        <Typography variant="body2" color="warning.main">Pending Amount</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "warning.main" }}>
                          ₹{(milkResult.totalAmount - parseFloat(paidAmount || "0")).toFixed(2)}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => {
                      const totalAmount = milkResult.totalAmount;
                      const vendorData = selectedVendor === "new"
                        ? {
                            vendorName: newVendor.vendorName,
                            contactNumber: newVendor.contactNumber,
                            vendorType: newVendor.vendorType,
                            paidAmount: parseFloat(paidAmount || "0")
                          }
                        : {
                            vendorId: parseInt(selectedVendor),
                            paidAmount: parseFloat(paidAmount || "0")
                          };

                      handleMilkConfirmWithVendor(totalAmount, vendorData);
                    }}
                    disabled={loading || !selectedVendor || !paidAmount || parseFloat(paidAmount) > milkResult.totalAmount}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #45a049 0%, #388E3C 100%)"
                      },
                      "&:disabled": {
                        background: "#ccc",
                        color: "#666"
                      }
                    }}
                  >
                    {loading ? "Saving..." : "Complete Milk Purchase"}
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* OTHER MATERIAL TAB */}
          {tab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}>
                Other Material Purchase
              </Typography>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 3, mb: 4 }}>
                <TextField
                  label="Raw Material"
                  fullWidth
                  value={other.rawMaterialType}
                  onChange={(e) => setOther({ ...other, rawMaterialType: e.target.value })}
                  InputLabelProps={{
                    shrink: other.rawMaterialType ? true : undefined,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  label="Quantity"
                  type="number"
                  fullWidth
                  value={other.quantity}
                  onChange={(e) => setOther({ ...other, quantity: e.target.value })}
                  InputLabelProps={{
                    shrink: other.quantity ? true : undefined,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                />

                <FormControl fullWidth sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}>
                  <InputLabel shrink={other.unit ? true : undefined}>Unit</InputLabel>
                  <Select
                    value={other.unit}
                    label="Unit"
                    onChange={(e) => setOther({ ...other, unit: e.target.value })}
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Rate per Unit (₹)"
                  type="number"
                  fullWidth
                  value={other.ratePerUnit}
                  onChange={(e) => setOther({ ...other, ratePerUnit: e.target.value })}
                  inputProps={{ step: 0.01 }}
                  InputLabelProps={{
                    shrink: other.ratePerUnit ? true : undefined,
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
                onClick={handleOtherCalculate}
                disabled={loading || !other.rawMaterialType || !other.quantity || !other.unit || !other.ratePerUnit}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)"
                  },
                  "&:disabled": {
                    background: "#ccc",
                    color: "#666"
                  }
                }}
              >
                Calculate Amount
              </Button>

              {otherAmount !== null && (
                <>
                  <Divider sx={{ my: 4 }} />

                  <Paper sx={{ p: 4, bgcolor: "success.light", borderRadius: 2, mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 1, color: "success.main", fontWeight: 600 }}>
                      Total Amount
                    </Typography>
                    <Typography variant="h4" sx={{ color: "success.main", fontWeight: 700 }}>
                      ₹{otherAmount.toFixed(2)}
                    </Typography>
                  </Paper>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "primary.main" }}>
                    Vendor & Payment Details
                  </Typography>

                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 3, mb: 3 }}>
                    <Autocomplete
                      fullWidth
                      disabled={selectedVendor === "new"}
                      options={vendors}
                      getOptionLabel={(option: any) => `${option.name} (${option.contactNumber})`}
                      value={vendors.find((v: any) => v.id === selectedVendor) || null}
                      onChange={(_, newValue) => {
                        setSelectedVendor(newValue ? newValue.id : "");
                        if (newValue) {
                          // Reset new vendor fields when selecting existing vendor
                          setNewVendor({
                            vendorName: "",
                            contactNumber: "",
                            vendorType: ""
                          });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Vendor"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            }
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {option.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.contactNumber} • {option.vendorType}
                            </Typography>
                          </Box>
                        </li>
                      )}
                      noOptionsText="No vendors found"
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />

                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedVendor("new");
                        setNewVendor({
                          vendorName: "",
                          contactNumber: "",
                          vendorType: ""
                        });
                      }}
                      disabled={selectedVendor === "new"}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        borderColor: "primary.main",
                        color: "primary.main",
                        "&:hover": {
                          borderColor: "primary.dark",
                          bgcolor: "primary.light"
                        },
                        "&:disabled": {
                          borderColor: "#ccc",
                          color: "#ccc"
                        }
                      }}
                    >
                      + Add New Vendor
                    </Button>
                  </Box>

                  {selectedVendor === "new" && (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 3, mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                      <Typography variant="h6" sx={{ gridColumn: "1 / -1", mb: 1, color: "primary.main" }}>
                        New Vendor Details
                      </Typography>

                      <TextField
                        label="Vendor Name"
                        fullWidth
                        value={newVendor.vendorName}
                        onChange={(e) => setNewVendor({ ...newVendor, vendorName: e.target.value })}
                        InputLabelProps={{
                          shrink: newVendor.vendorName ? true : undefined,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          }
                        }}
                      />

                      <TextField
                        label="Contact Number"
                        fullWidth
                        value={newVendor.contactNumber}
                        onChange={(e) => setNewVendor({ ...newVendor, contactNumber: e.target.value })}
                        InputLabelProps={{
                          shrink: newVendor.contactNumber ? true : undefined,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          }
                        }}
                      />

                      <FormControl fullWidth sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        }
                      }}>
                        <InputLabel shrink={newVendor.vendorType ? true : undefined}>Vendor Type</InputLabel>
                        <Select
                          value={newVendor.vendorType}
                          label="Vendor Type"
                          onChange={(e) => setNewVendor({ ...newVendor, vendorType: e.target.value })}
                        >
                          <MenuItem value="MILKMAN">Milkman</MenuItem>
                          <MenuItem value="SUPPLIER">Supplier</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}

                  <TextField
                    label="Paid Amount (₹)"
                    type="number"
                    fullWidth
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    inputProps={{ step: 0.01, min: 0 }}
                    InputLabelProps={{
                      shrink: paidAmount ? true : undefined,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                      mb: 4
                    }}
                  />

                  {paidAmount && (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 3, mb: 4 }}>
                      <Paper sx={{ p: 3, bgcolor: "warning.light", borderRadius: 2 }}>
                        <Typography variant="body2" color="warning.main">Pending Amount</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "warning.main" }}>
                          ₹{(otherAmount - parseFloat(paidAmount || "0")).toFixed(2)}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() => {
                      const totalAmount = otherAmount;
                      const vendorData = selectedVendor === "new"
                        ? {
                            vendorName: newVendor.vendorName,
                            contactNumber: newVendor.contactNumber,
                            vendorType: newVendor.vendorType,
                            paidAmount: parseFloat(paidAmount || "0")
                          }
                        : {
                            vendorId: parseInt(selectedVendor),
                            paidAmount: parseFloat(paidAmount || "0")
                          };

                      handleOtherConfirmWithVendor(totalAmount, vendorData);
                    }}
                    disabled={loading || !selectedVendor || !paidAmount || parseFloat(paidAmount) > otherAmount}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #45a049 0%, #388E3C 100%)"
                      },
                      "&:disabled": {
                        background: "#ccc",
                        color: "#666"
                      }
                    }}
                  >
                    {loading ? "Saving..." : "Complete Material Purchase"}
                  </Button>
                </>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
