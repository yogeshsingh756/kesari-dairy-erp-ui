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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Receipt,
  Refresh,
  Person,
  ShoppingCart,
  FileDownload,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import {
  getSales,
  exportEmployeeSales,
  type SalesRecord,
  type SalesResponse,
} from "../../api/sales.api";
import {
  getEmployeesForAssignment,
  type Employee,
} from "../../api/employeeStock.api";
import { hasPermission } from "../../utils/hasPermission";
import AppSnackbar from "../../components/AppSnackbar";

const ITEMS_PER_PAGE = 10;

export default function SalesView() {
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  
  // Export modal states
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportEmployee, setExportEmployee] = useState<Employee | null>(null);
  const [exportFromDate, setExportFromDate] = useState<string>("");
  const [exportToDate, setExportToDate] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  const [exporting, setExporting] = useState(false);
  
  // Get user permissions
  const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  const canExport = hasPermission(userPermissions, 'REPORT_EXPORT');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  // Reload sales when filters change
  useEffect(() => {
    loadSales();
  }, [page, rowsPerPage, selectedEmployee, fromDate, toDate]);

  const loadEmployees = async () => {
    try {
      const response = await getEmployeesForAssignment();
      setEmployees(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load employees:', error);
      setEmployees([]);
    }
  };

  const loadSales = async () => {
    try {
      setLoading(true);
      const response: SalesResponse = await getSales(
        page + 1, // Convert 0-based to 1-based for API
        rowsPerPage,
        selectedEmployee?.id,
        fromDate,
        toDate
      );

      if (response && response.items) {
        setSales(response.items);
        setTotalCount(response.totalRecords || 0);
      } else {
        setSales([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Failed to load sales:', error);
      setSales([]);
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
    loadSales();
  };

  const handleExport = async () => {
    if (!exportEmployee || !exportFromDate || !exportToDate) return;
    
    try {
      setExporting(true);
      await exportEmployeeSales(
        exportEmployee.id,
        exportFromDate,
        exportToDate,
        exportFormat
      );
      setExportModalOpen(false);
      resetExportModal();
      setSnackbar({
        open: true,
        message: 'Sales data exported successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = typeof error === 'string' ? error : 'Export failed. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  const resetExportModal = () => {
    setExportEmployee(null);
    setExportFromDate('');
    setExportToDate('');
    setExportFormat('excel');
  };

  const handleExportModalClose = () => {
    setExportModalOpen(false);
    resetExportModal();
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                <Receipt />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Sales Transaction View
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  View and monitor sales transactions
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              {canExport && (
                <Button
                  variant="contained"
                  startIcon={<FileDownload />}
                  onClick={() => setExportModalOpen(true)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)"
                    },
                    borderRadius: 2,
                  }}
                >
                  Export
                </Button>
              )}
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
        </Box>

        {/* Filters */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            {/* Employee Filter */}
            <Autocomplete
              sx={{ minWidth: 250 }}
              options={employees}
              getOptionLabel={(option) => `${option.fullName} (${option.mobileNumber || 'N/A'})`}
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
                      {option.username} • {option.mobileNumber || 'N/A'}
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
          {sales.length === 0 && !loading ? (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <Receipt sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No sales found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEmployee || fromDate || toDate ? "Try adjusting your filters" : "Sales will appear here once transactions are recorded"}
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
                          <Receipt sx={{ fontSize: 16 }} />
                          Sale Details
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Person sx={{ fontSize: 16 }} />
                          Customer
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <ShoppingCart sx={{ fontSize: 16 }} />
                          Product & Quantity
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="right">
                        Price Details
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="right">
                        Amount Details
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="center">
                        Payment Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sales.map((sale: SalesRecord, index: number) => (
                      <TableRow
                        key={sale.saleId || index}
                        sx={{
                          "&:hover": {
                            bgcolor: "grey.50",
                          },
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Sale #{sale.saleId}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(sale.saleDate)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              by {sale.employeeName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {sale.customerName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {sale.productName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {sale.quantity}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.main" }}>
                              {formatCurrency(sale.sellingPricePerUnit)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Per Unit
                            </Typography>
                            {sale.discountAmount > 0 && (
                              <Typography variant="body2" color="error.main">
                                Discount: {formatCurrency(sale.discountAmount)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.main" }}>
                              {formatCurrency(sale.netAmount)}
                            </Typography>
                            <Typography variant="body2" color="success.main">
                              Paid: {formatCurrency(sale.paidAmount)}
                            </Typography>
                            {sale.balanceAmount > 0 && (
                              <Typography variant="body2" color="warning.main">
                                Balance: {formatCurrency(sale.balanceAmount)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={sale.balanceAmount === 0 ? "Paid" : "Pending"}
                            color={sale.balanceAmount === 0 ? "success" : "warning"}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              minWidth: 80,
                            }}
                          />
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

        {/* Summary */}
        {sales.length > 0 && (
          <Box sx={{ p: 3, borderTop: 1, borderColor: "divider", bgcolor: "grey.50" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                  Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total sales: {sales.length} | Total records: {totalCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total amount: {formatCurrency(sales.reduce((sum, sale) => sum + sale.netAmount, 0))}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Export Modal */}
      <Dialog open={exportModalOpen} onClose={handleExportModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FileDownload />
            Export Employee Sales Data
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
            {/* Employee Selection */}
            <Autocomplete
              options={employees}
              getOptionLabel={(option) => `${option.fullName} (${option.mobileNumber || 'N/A'})`}
              value={exportEmployee}
              onChange={(_event, newValue) => setExportEmployee(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Employee *"
                  placeholder="Select employee"
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
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            
            {/* Date Range */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="From Date *"
                type="date"
                value={exportFromDate}
                onChange={(e) => setExportFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <TextField
                label="To Date *"
                type="date"
                value={exportToDate}
                onChange={(e) => setExportToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Box>
            
            {/* Format Selection */}
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                label="Export Format"
                onChange={(e) => setExportFormat(e.target.value as 'excel' | 'csv')}
              >
                <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                <MenuItem value="csv">CSV (.csv)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExportModalClose}>Cancel</Button>
          <Button 
            onClick={handleExport} 
            variant="contained" 
            disabled={exporting || !exportEmployee || !exportFromDate || !exportToDate}
            startIcon={<FileDownload />}
          >
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
}
