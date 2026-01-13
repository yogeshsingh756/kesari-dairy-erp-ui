import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Avatar,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  ShoppingCart,
  Person,
  Inventory,
  Calculate,
  CheckCircle,
  PersonAdd,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import {
  getCustomers,
  getProductsForEmployee,
  getEmployeeStock,
  createSale,
  type Customer,
  type ProductForEmployee,
  type EmployeeStock,
  type SaleRequest,
} from "../../api/sales.api";

export default function Sales() {
  const [loading, setLoading] = useState(false);

  // Customer states (following purchase pattern)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    mobileNumber: "",
    address: "",
  });

  // Product states
  const [products, setProducts] = useState<ProductForEmployee[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductForEmployee | null>(null);
  const [employeeStockList, setEmployeeStockList] = useState<EmployeeStock[]>([]);

  // Sale form states
  const [saleForm, setSaleForm] = useState({
    quantity: 0,
    sellingPricePerUnit: 0,
    discountAmount: 0,
    paymentType: "FULL" as "FULL" | "PARTIAL" | "PENDING",
    paymentMode: "CASH" as "CASH" | "UPI" | "BANK",
    paidAmount: 0,
    saleDate: new Date().toISOString().split('T')[0],
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Load initial data
  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadEmployeeStockList();
  }, []);

  // Calculate totals
  const grossAmount = saleForm.quantity * saleForm.sellingPricePerUnit;
  const netAmount = grossAmount - saleForm.discountAmount;
  const balanceAmount = netAmount - saleForm.paidAmount;

  const loadCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await getProductsForEmployee();
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadEmployeeStockList = async () => {
    try {
      const response = await getEmployeeStock();
      setEmployeeStockList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load employee stock:', error);
      setEmployeeStockList([]);
    }
  };

  // Get current stock for selected product
  const currentStock = selectedProduct
    ? employeeStockList.find(stock => stock.productTypeId === selectedProduct.id)
    : null;

  const validateSale = (): string | null => {
    // Check if we have a customer (either selected from dropdown or new customer details)
    if (!selectedCustomer && (!newCustomer.fullName || !newCustomer.mobileNumber)) {
      return "Please select a customer or provide new customer details";
    }

    if (!selectedProduct) return "Please select a product";
    if (saleForm.quantity <= 0) return "Quantity must be greater than 0";
    if (saleForm.sellingPricePerUnit <= 0) return "Selling price must be greater than 0";
    if (currentStock && saleForm.quantity > currentStock.quantityAvailable) {
      return `Insufficient stock. Available: ${currentStock.quantityAvailable}`;
    }
    if (saleForm.discountAmount > grossAmount) return "Discount cannot be greater than gross amount";
    if (saleForm.paidAmount < 0) return "Paid amount cannot be negative";
    if (saleForm.paidAmount > netAmount) return "Paid amount cannot be greater than net amount";
    if (saleForm.paymentType === "FULL" && saleForm.paidAmount !== netAmount) {
      return "For full payment, paid amount must equal net amount";
    }
    if (saleForm.paymentType === "PARTIAL" && saleForm.paidAmount >= netAmount) {
      return "For partial payment, paid amount must be less than net amount";
    }
    return null;
  };

  const handleCalculate = () => {
    const validationError = validateSale();
    if (validationError) {
      setSnackbar({
        open: true,
        message: validationError,
        severity: "error",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Sale calculation valid",
        severity: "success",
      });
    }
  };

  const handleConfirmSale = async () => {
    const validationError = validateSale();
    if (validationError) {
      setSnackbar({
        open: true,
        message: validationError,
        severity: "error",
      });
      return;
    }

    // Build the sale request based on customer type
    const saleRequest: SaleRequest = {
      productTypeId: selectedProduct!.id,
      quantity: saleForm.quantity,
      sellingPricePerUnit: saleForm.sellingPricePerUnit,
      discountAmount: saleForm.discountAmount,
      paymentMode: saleForm.paymentMode,
      paidAmount: saleForm.paidAmount,
      saleDate: saleForm.saleDate,
    };

    // Add customer information - either existing customer ID or new customer details
    if (selectedCustomer !== "new") {
      // Using existing customer
      const customer = customers.find(c => c.id === parseInt(selectedCustomer));
      if (customer) {
        saleRequest.customerId = customer.id;
      }
    } else {
      // Using new customer details
      saleRequest.createNewCustomer = true;
      saleRequest.customerName = newCustomer.fullName;
      saleRequest.customerMobile = newCustomer.mobileNumber;
      if (newCustomer.address) {
        saleRequest.customerAddress = newCustomer.address;
      }
    }

    try {
      setLoading(true);
      await createSale(saleRequest);
      setSnackbar({
        open: true,
        message: "Sale completed successfully",
        severity: "success",
      });

      // Reset form
      setSelectedCustomer("");
      setSelectedProduct(null);
      setNewCustomer({
        fullName: "",
        mobileNumber: "",
        address: "",
      });
      setSaleForm({
        quantity: 0,
        sellingPricePerUnit: 0,
        discountAmount: 0,
        paymentType: "FULL",
        paymentMode: "CASH",
        paidAmount: 0,
        saleDate: new Date().toISOString().split('T')[0],
      });

      // Refresh data
      loadProducts(); // Refresh products list
      loadEmployeeStockList(); // Refresh stock quantities
      loadCustomers(); // Refresh customers list
    } catch (error) {
      console.error('Failed to create sale:', error);
      setSnackbar({
        open: true,
        message: "Failed to complete sale",
        severity: "error",
      });
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
              <ShoppingCart />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Sales
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Process product sales to customers
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4 }}>
            {/* Customer Section */}
            <Card sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    <Person />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Customer Selection
                  </Typography>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 2, mb: 3 }}>
                  <Autocomplete
                    fullWidth
                    disabled={selectedCustomer === "new"}
                    options={customers}
                    getOptionLabel={(option) => `${option.name} (${option.mobile})`}
                    value={selectedCustomer !== "new" ? customers.find((c: any) => c.id === selectedCustomer) || null : null}
                    onChange={(_, newValue) => {
                      setSelectedCustomer(newValue ? newValue.id.toString() : "");
                      if (newValue) {
                        // Reset new customer fields when selecting existing customer
                        setNewCustomer({
                          fullName: "",
                          mobileNumber: "",
                          address: "",
                        });
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Customer"
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
                            {option.mobile} • {option.address || "No address"}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    noOptionsText="No customers found"
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />

                  <Button
                    variant="outlined"
                    startIcon={<PersonAdd />}
                    onClick={() => {
                      setSelectedCustomer("new");
                      setNewCustomer({
                        fullName: "",
                        mobileNumber: "",
                        address: "",
                      });
                    }}
                    disabled={selectedCustomer === "new"}
                    sx={{
                      borderRadius: 2,
                      whiteSpace: "nowrap",
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
                    + Add New
                  </Button>
                </Box>

                {selectedCustomer === "new" && (
                  <Box sx={{ display: "grid", gap: 2, mb: 3, p: 3, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                    <Typography variant="h6" sx={{ gridColumn: "1 / -1", mb: 1, color: "primary.main" }}>
                      New Customer Details
                    </Typography>

                    <TextField
                      label="Customer Name"
                      fullWidth
                      value={newCustomer.fullName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
                      InputLabelProps={{
                        shrink: newCustomer.fullName ? true : undefined,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        }
                      }}
                    />

                    <TextField
                      label="Mobile Number"
                      fullWidth
                      value={newCustomer.mobileNumber}
                      onChange={(e) => setNewCustomer({ ...newCustomer, mobileNumber: e.target.value })}
                      InputLabelProps={{
                        shrink: newCustomer.mobileNumber ? true : undefined,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        }
                      }}
                    />

                    <TextField
                      label="Address (Optional)"
                      fullWidth
                      multiline
                      rows={2}
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      InputLabelProps={{
                        shrink: newCustomer.address ? true : undefined,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                )}

                {/* Customer Summary */}
                {(selectedCustomer && selectedCustomer !== "new") && (
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Selected Customer:
                    </Typography>
                    <Typography variant="body1">
                      {customers.find(c => c.id === parseInt(selectedCustomer))?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customers.find(c => c.id === parseInt(selectedCustomer))?.mobile}
                    </Typography>
                    {customers.find(c => c.id === parseInt(selectedCustomer))?.address && (
                      <Typography variant="body2" color="text.secondary">
                        {customers.find(c => c.id === parseInt(selectedCustomer))?.address}
                      </Typography>
                    )}
                  </Box>
                )}

                {selectedCustomer === "new" && newCustomer.fullName && (
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      New Customer:
                    </Typography>
                    <Typography variant="body1">{newCustomer.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {newCustomer.mobileNumber}
                    </Typography>
                    {newCustomer.address && (
                      <Typography variant="body2" color="text.secondary">
                        {newCustomer.address}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Product Section */}
            <Card sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: "success.light" }}>
                    <Inventory />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Product Selection
                  </Typography>
                </Box>

                <Autocomplete
                  fullWidth
                  options={products}
                  getOptionLabel={(option) => option.name}
                  value={selectedProduct}
                  onChange={(_event, newValue) => setSelectedProduct(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Product"
                      placeholder="Choose product..."
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const productStock = employeeStockList.find(stock => stock.productTypeId === option.id);
                    return (
                      <li {...props}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {option.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {productStock ? `Available: ${productStock.quantityAvailable}` : "Loading stock..."}
                          </Typography>
                        </Box>
                      </li>
                    );
                  }}
                  noOptionsText="No products available"
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />

                {currentStock && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "success.light", borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "success.dark" }}>
                      Stock Available:
                    </Typography>
                    <Typography variant="h6" sx={{ color: "success.main", fontWeight: 600 }}>
                      {currentStock.quantityAvailable}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Quantity & Price */}
            <Card sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Quantity & Pricing
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={saleForm.quantity || ""}
                    onChange={(e) => setSaleForm(prev => ({
                      ...prev,
                      quantity: parseFloat(e.target.value) || 0
                    }))}
                    inputProps={{ min: 0 }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth
                    label="Selling Price Per Unit (₹)"
                    type="number"
                    value={saleForm.sellingPricePerUnit || ""}
                    onChange={(e) => setSaleForm(prev => ({
                      ...prev,
                      sellingPricePerUnit: parseFloat(e.target.value) || 0
                    }))}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Discount Amount (₹)"
                  type="number"
                  value={saleForm.discountAmount || ""}
                  onChange={(e) => setSaleForm(prev => ({
                    ...prev,
                    discountAmount: parseFloat(e.target.value) || 0
                  }))}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 }, mb: 3 }}
                />

                {/* Calculations Display */}
                <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2">Gross Amount:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ₹{grossAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2">Discount:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "error.main" }}>
                      -₹{saleForm.discountAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Net Amount:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.main" }}>
                      ₹{netAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Payment Details
                </Typography>

                <Box sx={{ display: "grid", gap: 3 }}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                      Payment Type
                    </FormLabel>
                    <RadioGroup
                      row
                      value={saleForm.paymentType}
                      onChange={(e) => setSaleForm(prev => ({
                        ...prev,
                        paymentType: e.target.value as "FULL" | "PARTIAL"
                      }))}
                    >
                      <FormControlLabel value="FULL" control={<Radio />} label="Full Payment" />
                      <FormControlLabel value="PARTIAL" control={<Radio />} label="Partial Payment" />
                    </RadioGroup>
                  </FormControl>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                        Payment Mode
                      </FormLabel>
                      <RadioGroup
                        value={saleForm.paymentMode}
                        onChange={(e) => setSaleForm(prev => ({
                          ...prev,
                          paymentMode: e.target.value as "CASH" | "UPI" | "BANK"
                        }))}
                      >
                        <FormControlLabel value="CASH" control={<Radio />} label="Cash" />
                        {/* Temporarily disabled other payment modes */}
                        <FormControlLabel
                          value="UPI"
                          control={<Radio disabled />}
                          label="UPI (Coming Soon)"
                          sx={{ opacity: 0.5 }}
                        />
                        <FormControlLabel
                          value="BANK"
                          control={<Radio disabled />}
                          label="Bank Transfer (Coming Soon)"
                          sx={{ opacity: 0.5 }}
                        />
                      </RadioGroup>
                    </FormControl>

                    <Box>
                      <TextField
                        fullWidth
                        label="Paid Amount (₹)"
                        type="number"
                        value={saleForm.paidAmount || ""}
                        onChange={(e) => setSaleForm(prev => ({
                          ...prev,
                          paidAmount: parseFloat(e.target.value) || 0
                        }))}
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 }, mb: 2 }}
                      />

                      <Box sx={{ p: 2, bgcolor: balanceAmount === 0 ? "success.light" : "warning.light", borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Balance Amount: ₹{balanceAmount.toFixed(2)}
                        </Typography>
                        {balanceAmount > 0 && (
                          <Typography variant="body2" sx={{ color: "warning.dark", mt: 0.5 }}>
                            Credit sale - balance will be tracked
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Sale Summary */}
            <Card sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Sale Summary
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3 }}>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">Customer</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedCustomer === "new" ? newCustomer.fullName || "New Customer" : customers.find(c => c.id === parseInt(selectedCustomer))?.name || "Not selected"}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">Product</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedProduct ? selectedProduct.name : "Not selected"}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">Net Amount</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.main" }}>
                      ₹{netAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">Payment Mode</Typography>
                    <Chip
                      label={saleForm.paymentMode}
                      size="small"
                      sx={{
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="outlined"
                startIcon={<Calculate />}
                onClick={handleCalculate}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    borderColor: "primary.dark",
                    bgcolor: "primary.light",
                  }
                }}
              >
                Calculate
              </Button>

              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={handleConfirmSale}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: "linear-gradient(135deg, #FF8C00 0%, #E67E22 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #FF7F00 0%, #D2691E 100%)"
                  },
                  "&:disabled": {
                    background: "#ccc",
                    color: "#666"
                  }
                }}
              >
                {loading ? "Processing..." : "Confirm Sale"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
