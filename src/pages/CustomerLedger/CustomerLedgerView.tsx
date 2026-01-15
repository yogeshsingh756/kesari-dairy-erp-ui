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
} from "@mui/material";
import {
  Receipt,
  Refresh,
  Person,
  Visibility,
  Payment,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import {
  getCustomerOutstanding,
  getCustomers,
  getCustomerLedgerDetails,
  collectPayment,
  type CustomerLedgerRecord,
  type CustomerLedgerResponse,
  type Customer,
  type CustomerLedgerDetail,
  type CustomerLedgerDetailResponse,
  type CollectPaymentRequest,
} from "../../api/sales.api";

const ITEMS_PER_PAGE = 10;

export default function CustomerLedgerView() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLedgers, setCustomerLedgers] = useState<CustomerLedgerRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modal states for ledger details
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<CustomerLedgerRecord | null>(null);
  const [ledgerDetails, setLedgerDetails] = useState<CustomerLedgerDetail[]>([]);
  const [ledgerTotalCount, setLedgerTotalCount] = useState(0);
  const [ledgerPage, setLedgerPage] = useState(0);
  const [ledgerRowsPerPage, setLedgerRowsPerPage] = useState(ITEMS_PER_PAGE);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Modal states for payment collection
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentCustomer, setSelectedPaymentCustomer] = useState<CustomerLedgerRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Reload customer ledgers when filters change
  useEffect(() => {
    loadCustomerLedgers();
  }, [page, rowsPerPage, selectedCustomer]);

  const loadCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    }
  };

  const loadCustomerLedgers = async () => {
    try {
      setLoading(true);
      const response: CustomerLedgerResponse = await getCustomerOutstanding(
        page + 1, // Convert 0-based to 1-based for API
        rowsPerPage,
        selectedCustomer?.id
      );

      if (response && response.items) {
        setCustomerLedgers(response.items);
        setTotalCount(response.totalRecords || 0);
      } else {
        setCustomerLedgers([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Failed to load customer ledgers:', error);
      setCustomerLedgers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (_event: any, newValue: Customer | null) => {
    setSelectedCustomer(newValue);
    setPage(0); // Reset to first page when filter changes
  };

  const handleRefresh = () => {
    setSelectedCustomer(null); // Clear the customer filter
    setPage(0); // Reset to first page
    // loadCustomerLedgers will be called automatically due to useEffect dependency on selectedCustomer
  };

  const handleViewLedger = async (customerId: number) => {
    const customer = customerLedgers.find(c => c.customerId === customerId);
    if (customer) {
      setSelectedLedgerCustomer(customer);
      setLedgerPage(0); // Reset to first page
      setLedgerModalOpen(true);
      await loadLedgerDetails(customerId, 1);
    }
  };

  const handleCollectPayment = (customerId: number) => {
    const customer = customerLedgers.find(c => c.customerId === customerId);
    if (customer) {
      setSelectedPaymentCustomer(customer);
      setPaymentAmount(customer.outstandingAmount.toString());
      setPaymentRemarks("");
      setPaymentModalOpen(true);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedPaymentCustomer) return;

    try {
      setPaymentLoading(true);
      const request: CollectPaymentRequest = {
        customerId: selectedPaymentCustomer.customerId,
        amountPaid: parseFloat(paymentAmount),
        paymentMode: "cash",
        paymentDate: new Date().toISOString(),
        remarks: paymentRemarks.trim() || "",
      };

      await collectPayment(request);
      setPaymentModalOpen(false);
      // Refresh the customer ledgers to show updated outstanding amounts
      loadCustomerLedgers();
    } catch (error) {
      console.error('Failed to collect payment:', error);
      // TODO: Show error snackbar
    } finally {
      setPaymentLoading(false);
    }
  };

  const loadLedgerDetails = async (customerId: number, pageNumber: number) => {
    try {
      setLedgerLoading(true);
      const response: CustomerLedgerDetailResponse = await getCustomerLedgerDetails(
        customerId,
        pageNumber,
        ledgerRowsPerPage
      );

      if (response && response.items) {
        setLedgerDetails(response.items);
        setLedgerTotalCount(response.totalRecords || 0);
      } else {
        setLedgerDetails([]);
        setLedgerTotalCount(0);
      }
    } catch (error) {
      console.error('Failed to load ledger details:', error);
      setLedgerDetails([]);
      setLedgerTotalCount(0);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleLedgerPageChange = async (_event: any, newPage: number) => {
    setLedgerPage(newPage);
    if (selectedLedgerCustomer) {
      await loadLedgerDetails(selectedLedgerCustomer.customerId, newPage + 1);
    }
  };

  const handleLedgerRowsPerPageChange = async (event: any) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setLedgerRowsPerPage(newRowsPerPage);
    setLedgerPage(0);
    if (selectedLedgerCustomer) {
      await loadLedgerDetails(selectedLedgerCustomer.customerId, 1);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

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
                  Customer Ledger View
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  View customer outstanding amounts and payment history
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

        {/* Filters */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            {/* Customer Filter */}
            <Autocomplete
              sx={{ minWidth: 300 }}
              options={customers}
              getOptionLabel={(option) => `${option.name} (${option.mobile})`}
              value={selectedCustomer}
              onChange={handleCustomerChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Customer (Optional)"
                  placeholder="All customers"
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
                      {option.mobile}
                    </Typography>
                  </Box>
                </li>
              )}
              noOptionsText="No customers found"
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            {/* Clear Filters */}
            {selectedCustomer && (
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedCustomer(null);
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
                Clear Filter
              </Button>
            )}
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ p: 0 }}>
          {customerLedgers.length === 0 && !loading ? (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <Receipt sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No customer ledger data found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCustomer ? "Try adjusting your filter or the selected customer may not have any transactions" : "Customer ledger data will appear here once transactions are recorded"}
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
                          <Person sx={{ fontSize: 16 }} />
                          Customer Name
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        Mobile
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="right">
                        Total Sales
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="right">
                        Total Paid
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="right">
                        Outstanding Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        Last Transaction Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customerLedgers.map((ledger: CustomerLedgerRecord, index: number) => (
                      <TableRow
                        key={ledger.customerId || index}
                        sx={{
                          "&:hover": {
                            bgcolor: "grey.50",
                          },
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {ledger.customerName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {ledger.mobile}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatCurrency(ledger.totalSales)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" sx={{ fontWeight: 500, color: "success.main" }}>
                            {formatCurrency(ledger.totalPaid)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              color: ledger.outstandingAmount > 0 ? "warning.dark" : "success.main",
                              backgroundColor: ledger.outstandingAmount > 0 ? "warning.light" : "success.light",
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              display: "inline-block"
                            }}
                          >
                            {formatCurrency(ledger.outstandingAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(ledger.lastTransactionDate)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewLedger(ledger.customerId)}
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
                              View Ledger
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Payment />}
                              onClick={() => handleCollectPayment(ledger.customerId)}
                              disabled={ledger.outstandingAmount === 0}
                              sx={{
                                borderRadius: 2,
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
                              Collect Payment
                            </Button>
                          </Box>
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
        {customerLedgers.length > 0 && (
          <Box sx={{ p: 3, borderTop: 1, borderColor: "divider", bgcolor: "grey.50" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                  Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total customers: {customerLedgers.length} | Total records: {totalCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total outstanding: {formatCurrency(customerLedgers.reduce((sum, ledger) => sum + ledger.outstandingAmount, 0))}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Chip
                  label={`${customerLedgers.filter(l => l.outstandingAmount > 0).length} with outstanding`}
                  sx={{
                    bgcolor: "warning.light",
                    color: "warning.dark",
                    borderColor: "warning.main"
                  }}
                  variant="outlined"
                />
                <Chip
                  label={`${customerLedgers.filter(l => l.outstandingAmount === 0).length} fully paid`}
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Customer Ledger Details Modal */}
      <Dialog
        open={ledgerModalOpen}
        onClose={() => setLedgerModalOpen(false)}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Receipt />
            <Box>
              <Typography variant="h6">
                Customer Ledger - {selectedLedgerCustomer?.customerName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedLedgerCustomer?.mobile} | Outstanding: {formatCurrency(selectedLedgerCustomer?.outstandingAmount || 0)}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {ledgerLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <Typography>Loading ledger details...</Typography>
            </Box>
          ) : ledgerDetails.length === 0 ? (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <Receipt sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No ledger entries found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This customer has no transaction history
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        Reference Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        Reference ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="right">
                        Debit Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="right">
                        Credit Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="right">
                        Balance After
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ledgerDetails.map((detail: CustomerLedgerDetail, index: number) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:hover": {
                            bgcolor: "grey.50",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(detail.entryDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={detail.referenceType}
                            size="small"
                            color={detail.referenceType === "SALE" ? "primary" : "secondary"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            #{detail.referenceId}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: detail.debitAmount > 0 ? "error.main" : "text.secondary"
                            }}
                          >
                            {detail.debitAmount > 0 ? formatCurrency(detail.debitAmount) : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: detail.creditAmount > 0 ? "success.main" : "text.secondary"
                            }}
                          >
                            {detail.creditAmount > 0 ? formatCurrency(detail.creditAmount) : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: detail.balanceAfter >= 0 ? "success.main" : "error.main"
                            }}
                          >
                            {formatCurrency(detail.balanceAfter)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Modal Pagination */}
              {ledgerTotalCount > ledgerRowsPerPage && (
                <TablePagination
                  component="div"
                  count={ledgerTotalCount}
                  page={ledgerPage}
                  onPageChange={handleLedgerPageChange}
                  rowsPerPage={ledgerRowsPerPage}
                  onRowsPerPageChange={handleLedgerRowsPerPageChange}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    "& .MuiTablePagination-toolbar": {
                      py: 2,
                    },
                  }}
                />
              )}
            </>
          )}
        </DialogContent>
        <Box sx={{ p: 3, pt: 0, display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={() => setLedgerModalOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </Box>
      </Dialog>

      {/* Payment Collection Modal */}
      <Dialog
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        maxWidth="sm"
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Payment />
            <Box>
              <Typography variant="h6">
                Collect Payment
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedPaymentCustomer?.customerName} - {selectedPaymentCustomer?.mobile}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Customer Info */}
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Customer Details
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedPaymentCustomer?.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPaymentCustomer?.mobile}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Outstanding Amount: <strong>{formatCurrency(selectedPaymentCustomer?.outstandingAmount || 0)}</strong>
              </Typography>
            </Box>

            {/* Amount Paid */}
            <TextField
              label="Amount Paid"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: "₹",
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            {/* Payment Mode */}
            <TextField
              label="Payment Mode"
              value="Cash"
              fullWidth
              disabled
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "grey.50",
                }
              }}
            />

            {/* Payment Date */}
            <TextField
              label="Payment Date"
              value={new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              fullWidth
              disabled
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "grey.50",
                }
              }}
            />

            {/* Remarks */}
            <TextField
              label="Remarks (Optional)"
              multiline
              rows={3}
              value={paymentRemarks}
              onChange={(e) => setPaymentRemarks(e.target.value)}
              fullWidth
              placeholder="Enter any remarks..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </DialogContent>
        <Box sx={{ p: 3, pt: 0, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            onClick={() => setPaymentModalOpen(false)}
            variant="outlined"
            disabled={paymentLoading}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPayment}
            variant="contained"
            disabled={paymentLoading || !paymentAmount || parseFloat(paymentAmount) <= 0}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #FF8C00 0%, #E67E22 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #FF7F00 0%, #D2691E 100%)"
              }
            }}
          >
            {paymentLoading ? "Processing..." : "Collect Payment"}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
