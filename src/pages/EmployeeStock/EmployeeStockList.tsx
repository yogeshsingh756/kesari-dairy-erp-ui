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
  Autocomplete,
  TextField,
  TablePagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import {
  Assignment,
  Refresh,
  Person,
  Inventory,
  Add,
  Visibility,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import {
  getEmployeeStockAssignments,
  getEmployeeStockAssignmentDetails,
  getEmployeesForAssignment,
  getFinishedProductStock,
  assignProductToEmployee,
  type EmployeeStockAssignment,
  type EmployeeStockAssignmentDetail,
  type Employee,
  type FinishedProductStock,
  type AssignProductToEmployeeRequest,
} from "../../api/employeeStock.api";

const ITEMS_PER_PAGE = 10;

export default function EmployeeStockList() {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<EmployeeStockAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<FinishedProductStock[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Details modal states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<EmployeeStockAssignment | null>(null);
  const [assignmentDetails, setAssignmentDetails] = useState<EmployeeStockAssignmentDetail[]>([]);
  const [detailsTotalCount, setDetailsTotalCount] = useState(0);
  const [detailsCurrentPage, setDetailsCurrentPage] = useState(1);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Modal and form states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignFormData, setAssignFormData] = useState<AssignProductToEmployeeRequest>({
    employeeId: 0,
    productTypeId: 0,
    quantity: 0,
    sellingPricePerUnit: 0,
    totalAmount: 0,
    assignmentDate: new Date().toISOString().split('T')[0],
    remarks: "",
  });
  const [selectedProduct, setSelectedProduct] = useState<FinishedProductStock | null>(null);
  const [selectedAssignEmployee, setSelectedAssignEmployee] = useState<Employee | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Load employees, products and assignments on component mount
  useEffect(() => {
    loadEmployees();
    loadProducts();
    loadAssignments();
  }, []);

  // Reload data when modal opens
  useEffect(() => {
    if (assignModalOpen) {
      loadEmployees();
      loadProducts();
    }
  }, [assignModalOpen]);

  // Reload assignments when filters change
  useEffect(() => {
    loadAssignments();
  }, [page, rowsPerPage, selectedEmployee, fromDate, toDate]);

  const loadEmployees = async () => {
    try {
      console.log('Loading employees...');
      const response = await getEmployeesForAssignment();
      console.log('Employees response:', response);
      console.log('Employees response.data:', response.data);
      console.log('Is employees response.data an array?', Array.isArray(response.data));

      // Handle different response formats
      let employeesData = [];
      if (Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (Array.isArray(response)) {
        employeesData = response;
      } else {
        console.log('Unexpected employees response format');
      }

      setEmployees(employeesData);
      console.log('Employees set to state:', employeesData);
    } catch (error) {
      console.error('Failed to load employees:', error);
      console.error('Error details:', error);
      setEmployees([]);
    }
  };

  const loadProducts = async () => {
    try {
      console.log('Loading products...');
      const response = await getFinishedProductStock();
      console.log('Products response:', response);
      console.log('Products response.data:', response.data);
      console.log('Is response.data an array?', Array.isArray(response.data));
      setProducts(Array.isArray(response.data) ? response.data : []);
      console.log('Products set to state:', Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      console.log('Loading assignments...');
      const response = await getEmployeeStockAssignments(
        page + 1, // Convert 0-based to 1-based for API
        rowsPerPage,
        selectedEmployee?.id,
        fromDate,
        toDate
      );

      console.log('Assignments response:', response);
      console.log('Assignments response.data:', response.data);

      if (response.data) {
        // Handle different response formats
        let items = [];
        let totalRecords = 0;

        if (Array.isArray(response.data)) {
          // Direct array response
          items = response.data;
          totalRecords = response.data.length;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          // Wrapped response with items and totalRecords
          items = response.data.items;
          totalRecords = response.data.totalRecords || 0;
        }

        console.log('Setting assignments:', items);
        console.log('Setting total count:', totalRecords);

        setAssignments(items);
        setTotalCount(totalRecords);
      } else {
        console.log('No response.data found');
        setAssignments([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setAssignments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (_event: any, newValue: Employee | null) => {
    setSelectedEmployee(newValue);
    setPage(0); // Reset to first page when filter changes
  };

  const handleRefresh = () => {
    loadAssignments();
  };

  const handleViewDetails = (assignment: EmployeeStockAssignment) => {
    setSelectedAssignment(assignment);
    setDetailsCurrentPage(1); // Reset to first page when opening modal
    setDetailsModalOpen(true);
    loadAssignmentDetails(assignment.employeeId, assignment.productTypeId, 1); // Always start from page 1
  };

  const loadAssignmentDetails = async (employeeId: number, productTypeId: number, pageNumber?: number) => {
    try {
      setDetailsLoading(true);
      console.log('Loading assignment details...');
      const currentPageNumber = pageNumber || detailsCurrentPage;
      const response = await getEmployeeStockAssignmentDetails(
        employeeId,
        productTypeId,
        currentPageNumber,
        ITEMS_PER_PAGE
      );

      console.log('Assignment details response:', response);
      console.log('Assignment details response.data:', response.data);

      if (response.data) {
        let items = [];
        let totalRecords = 0;

        if (Array.isArray(response.data)) {
          items = response.data;
          totalRecords = response.data.length;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          items = response.data.items;
          totalRecords = response.data.totalRecords || 0;
        }

        console.log('Setting assignment details:', items);
        console.log('Setting details total count:', totalRecords);

        setAssignmentDetails(items);
        setDetailsTotalCount(totalRecords);
      } else {
        setAssignmentDetails([]);
        setDetailsTotalCount(0);
      }
    } catch (error) {
      console.error('Failed to load assignment details:', error);
      setAssignmentDetails([]);
      setDetailsTotalCount(0);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAssignSubmit = async () => {
    // Validation
    if (!selectedProduct) {
      setSnackbar({
        open: true,
        message: "Select product",
        severity: "error",
      });
      return;
    }
    if (!selectedAssignEmployee) {
      setSnackbar({
        open: true,
        message: "Select employee",
        severity: "error",
      });
      return;
    }
    if (assignFormData.quantity <= 0) {
      setSnackbar({
        open: true,
        message: "Quantity must be greater than zero",
        severity: "error",
      });
      return;
    }
    if (selectedProduct && assignFormData.quantity > selectedProduct.quantityAvailable) {
      setSnackbar({
        open: true,
        message: "Insufficient stock",
        severity: "error",
      });
      return;
    }

    try {
      await assignProductToEmployee(assignFormData);
      setSnackbar({
        open: true,
        message: "Assigned successfully",
        severity: "success",
      });
      setAssignModalOpen(false);
      // Reset form
      setAssignFormData({
        employeeId: 0,
        productTypeId: 0,
        quantity: 0,
        sellingPricePerUnit: 0,
        totalAmount: 0,
        assignmentDate: new Date().toISOString().split('T')[0],
        remarks: "",
      });
      setSelectedProduct(null);
      setSelectedAssignEmployee(null);
      // Refresh assignments
      loadAssignments();
    } catch (error) {
      console.error('Failed to assign product:', error);
      setSnackbar({
        open: true,
        message: "Failed to assign product",
        severity: "error",
      });
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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <Assignment />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Employee Stock Assignments
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  View and manage product assignments to employees
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAssignModalOpen(true)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)"
                  },
                  borderRadius: 2,
                }}
              >
                Assign to Employee
              </Button>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)"
                  },
                  borderRadius: 2,
                }}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            {/* Employee Filter */}
            <Autocomplete
              sx={{ minWidth: 250 }}
              options={employees}
              getOptionLabel={(option) => option.fullName}
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Employee"
                  placeholder="All employees"
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
                      {option.mobileNumber || 'N/A'}
                    </Typography>
                  </Box>
                </li>
              )}
              noOptionsText="No employees found"
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            {/* From Date */}
            <TextField
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            {/* To Date */}
            <TextField
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            {/* Clear Filters */}
            {(selectedEmployee || fromDate || toDate) && (
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedEmployee(null);
                  setFromDate("");
                  setToDate("");
                  setPage(0);
                }}
                sx={{
                  borderRadius: 2,
                  borderColor: "grey.400",
                  color: "grey.600",
                  "&:hover": {
                    borderColor: "grey.500",
                    bgcolor: "grey.50",
                  }
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ p: 0 }}>
          {assignments.length === 0 && !loading ? (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <Assignment sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No assignments found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEmployee ? "Try adjusting your filters" : "Assignments will appear here once products are assigned to employees"}
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Inventory sx={{ fontSize: 16 }} />
                          Product
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Person sx={{ fontSize: 16 }} />
                          Employee
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="right">
                        Quantity
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        Last Assignment Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment: EmployeeStockAssignment, index: number) => (
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
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {assignment.productName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {assignment.employeeName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.main" }}>
                            {assignment.totalQuantityAssigned}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(assignment.lastAssignedDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewDetails(assignment)}
                            sx={{
                              borderRadius: 2,
                              borderColor: "primary.main",
                              color: "primary.main",
                              "&:hover": {
                                borderColor: "primary.dark",
                                bgcolor: "primary.light",
                              }
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(_event, newPage) => {
                  setPage(newPage);
                }}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  "& .MuiTablePagination-toolbar": {
                    py: 2,
                  },
                }}
              />
            </>
          )}
        </Box>
      </Paper>

      {/* Assignment Modal */}
      <>
        <Dialog
          open={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{
            background: "linear-gradient(135deg, #FF8C00 0%, #E67E22 100%)",
            color: "white",
            fontWeight: 600
          }}>
            Assign Product to Employee
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <Typography>Loading data...</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 3, pt: 2 }}>
                {/* Debug info */}
                <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1, fontSize: "0.8rem" }}>
                  <Typography variant="body2">
                    Products loaded: {products.length} | Employees loaded: {employees.length}
                  </Typography>
                </Box>

                {/* Product Selection */}
                <Autocomplete
                  fullWidth
                  options={products}
                  getOptionLabel={(option) => `${option.productName} (${option.variant}) - Available: ${option.quantityAvailable}`}
                  value={selectedProduct}
                  onChange={(_event, newValue) => {
                    console.log('Product selected:', newValue);
                    setSelectedProduct(newValue);
                    setAssignFormData(prev => ({
                      ...prev,
                      productTypeId: newValue?.productTypeId || 0,
                    }));
                  }}
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
                          Available: {option.quantityAvailable} {"Packagings"}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  noOptionsText={products.length === 0 ? "Loading products..." : "No products found"}
                  isOptionEqualToValue={(option, value) => option.productTypeId === value.productTypeId}
                />

                {/* Employee Selection */}
                <Autocomplete
                  fullWidth
                  options={employees}
                  getOptionLabel={(option) => `${option.fullName} (${option.mobileNumber || 'N/A'})`}
                  value={selectedAssignEmployee}
                  onChange={(_event, newValue) => {
                    console.log('Employee selected:', newValue);
                    setSelectedAssignEmployee(newValue);
                    setAssignFormData(prev => ({
                      ...prev,
                      employeeId: newValue?.id || 0,
                    }));
                  }}
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
                  noOptionsText={employees.length === 0 ? "Loading employees..." : "No employees found"}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />

                {/* Quantity */}
                <TextField
                  fullWidth
                  label="Quantity to Assign"
                  type="number"
                  value={assignFormData.quantity || ""}
                  onChange={(e) => {
                    const quantity = parseFloat(e.target.value) || 0;
                    const totalAmount = quantity * assignFormData.sellingPricePerUnit;
                    setAssignFormData(prev => ({
                      ...prev,
                      quantity,
                      totalAmount,
                    }));
                  }}
                  inputProps={{ min: 0, step: 1 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                  helperText={selectedProduct ? `Maximum available: ${selectedProduct.quantityAvailable}` : ""}
                />

                {/* Selling Price Per Unit */}
                <TextField
                  fullWidth
                  label="Selling Price Per Unit (₹)"
                  type="number"
                  value={assignFormData.sellingPricePerUnit || ""}
                  onChange={(e) => {
                    const sellingPricePerUnit = parseFloat(e.target.value) || 0;
                    const totalAmount = assignFormData.quantity * sellingPricePerUnit;
                    setAssignFormData(prev => ({
                      ...prev,
                      sellingPricePerUnit,
                      totalAmount,
                    }));
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                />

                {/* Total Amount */}
                <TextField
                  fullWidth
                  label="Total Amount (₹)"
                  type="number"
                  value={assignFormData.totalAmount || ""}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "grey.50",
                    }
                  }}
                  helperText="Auto-calculated: Quantity × Selling Price Per Unit"
                />

                {/* Assignment Date */}
                <TextField
                  fullWidth
                  label="Assignment Date"
                  type="date"
                  value={assignFormData.assignmentDate}
                  onChange={(e) => setAssignFormData(prev => ({
                    ...prev,
                    assignmentDate: e.target.value,
                  }))}
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
                  value={assignFormData.remarks}
                  onChange={(e) => setAssignFormData(prev => ({
                    ...prev,
                    remarks: e.target.value,
                  }))}
                  placeholder="e.g., Morning delivery route"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    }
                  }}
                />
            </Box>
          )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => setAssignModalOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignSubmit}
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #FF8C00 0%, #E67E22 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #FF7F00 0%, #D2691E 100%)"
                },
                borderRadius: 2,
              }}
            >
              Assign Product
            </Button>
          </DialogActions>
        </Dialog>
      </>

      {/* Details Modal */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{
          background: "linear-gradient(135deg, #FF8C00 0%, #E67E22 100%)",
          color: "white",
          fontWeight: 600
        }}>
          Assignment Details - {selectedAssignment?.productName} for {selectedAssignment?.employeeName}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {detailsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <Typography>Loading assignment details...</Typography>
            </Box>
          ) : (
            <Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Price Per Unit (₹)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Total Amount (₹)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignmentDetails.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(detail.assignmentDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {detail.quantityAssigned}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ₹{detail.sellingPricePerUnit.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                            ₹{detail.totalAmount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {detail.remarks || "-"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Details Pagination */}
              {detailsTotalCount > ITEMS_PER_PAGE && (
                <TablePagination
                  component="div"
                  count={detailsTotalCount}
                  page={detailsCurrentPage - 1} // Convert 1-based to 0-based
                  onPageChange={(_event, newPage) => {
                    const newPageNumber = newPage + 1; // Convert 0-based to 1-based
                    setDetailsCurrentPage(newPageNumber);
                    if (selectedAssignment) {
                      loadAssignmentDetails(selectedAssignment.employeeId, selectedAssignment.productTypeId, newPageNumber);
                    }
                  }}
                  rowsPerPage={ITEMS_PER_PAGE}
                  rowsPerPageOptions={[10]}
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    "& .MuiTablePagination-toolbar": {
                      py: 2,
                    },
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setDetailsModalOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
