import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Alert,
  Snackbar,
  Avatar,
} from "@mui/material";
import {
  Assignment,
  Save,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import {
  assignProductToEmployee,
  getFinishedProductStock,
  getEmployeesForAssignment,
  type AssignProductToEmployeeRequest,
  type FinishedProductStock,
  type Employee,
} from "../../api/employeeStock.api";

export default function AssignProductForm() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<FinishedProductStock[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [formData, setFormData] = useState<AssignProductToEmployeeRequest>({
    employeeId: 0,
    productTypeId: 0,
    quantity: 0,
    sellingPricePerUnit: 0,
    totalAmount: 0,
    assignmentDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    remarks: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<FinishedProductStock | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Load products and employees on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsRes, employeesRes] = await Promise.all([
          getFinishedProductStock(),
          getEmployeesForAssignment(),
        ]);

        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setSnackbar({
          open: true,
          message: "Failed to load products and employees",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProductChange = (_event: any, newValue: FinishedProductStock | null) => {
    setSelectedProduct(newValue);
    setFormData(prev => ({
      ...prev,
      productTypeId: newValue?.productTypeId || 0,
    }));
  };

  const handleEmployeeChange = (_event: any, newValue: Employee | null) => {
    setSelectedEmployee(newValue);
    setFormData(prev => ({
      ...prev,
      employeeId: newValue?.id || 0,
    }));
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseFloat(event.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      quantity,
    }));
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      assignmentDate: event.target.value,
    }));
  };

  const handleRemarksChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      remarks: event.target.value,
    }));
  };

  const validateForm = (): string | null => {
    if (!selectedProduct) {
      return "Select product";
    }
    if (!selectedEmployee) {
      return "Select employee";
    }
    if (formData.quantity <= 0) {
      return "Quantity must be greater than zero";
    }
    if (selectedProduct && formData.quantity > selectedProduct.quantityAvailable) {
      return "Insufficient stock";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setSnackbar({
        open: true,
        message: validationError,
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      await assignProductToEmployee(formData);

      setSnackbar({
        open: true,
        message: "Assigned successfully",
        severity: "success",
      });

      // Reset form after successful assignment
      setFormData({
        employeeId: 0,
        productTypeId: 0,
        quantity: 0,
        sellingPricePerUnit: 0,
        totalAmount: 0,
        assignmentDate: new Date().toISOString().split('T')[0],
        remarks: "",
      });
      setSelectedProduct(null);
      setSelectedEmployee(null);

    } catch (error) {
      console.error('Failed to assign product:', error);
      setSnackbar({
        open: true,
        message: "Failed to assign product",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper
        sx={{
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          overflow: "hidden",
          maxWidth: 800,
          mx: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
              <Assignment />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Assign Product to Employee
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Assign finished products to employees for distribution
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Form */}
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: "grid", gap: 3 }}>
            {/* Product Selection */}
            <Autocomplete
              fullWidth
              options={products}
              getOptionLabel={(option) => `${option.productName} (${option.variant}) - Available: ${option.quantityAvailable}`}
              value={selectedProduct}
              onChange={handleProductChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product"
                  placeholder="Select a product"
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
                      {option.productName} ({option.variant})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Available: {option.quantityAvailable} {option.unit}
                    </Typography>
                  </Box>
                </li>
              )}
              noOptionsText="No products found"
              isOptionEqualToValue={(option, value) => option.productTypeId === value.productTypeId}
            />

            {/* Employee Selection */}
            <Autocomplete
              fullWidth
              options={employees}
              getOptionLabel={(option) => `${option.fullName} (${option.mobileNumber || 'N/A'})`}
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee"
                  placeholder="Select an employee"
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
                      {option.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.username} • {option.mobileNumber || 'N/A'}
                    </Typography>
                  </Box>
                </li>
              )}
              noOptionsText="No employees found"
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            {/* Quantity */}
            <TextField
              fullWidth
              label="Quantity to Assign"
              type="number"
              value={formData.quantity || ""}
              onChange={handleQuantityChange}
              inputProps={{ min: 0, step: 1 }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
              helperText={selectedProduct ? `Maximum available: ${selectedProduct.quantityAvailable}` : ""}
            />

            {/* Assignment Date */}
            <TextField
              fullWidth
              label="Assignment Date"
              type="date"
              value={formData.assignmentDate}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            {/* Remarks */}
            <TextField
              fullWidth
              label="Remarks (Optional)"
              multiline
              rows={3}
              value={formData.remarks}
              onChange={handleRemarksChange}
              placeholder="e.g., Morning delivery route"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            {/* Assign Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 6,
                  py: 1.5,
                  background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)"
                  },
                  "&:disabled": {
                    background: "#ccc",
                    color: "#666"
                  }
                }}
              >
                {loading ? "Assigning..." : "Assign Product"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
