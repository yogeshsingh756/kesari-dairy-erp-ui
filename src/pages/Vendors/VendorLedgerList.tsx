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
  TextField,
  TablePagination,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  AccountBalance,
  People,
  Search,
  AttachMoney,
  Payment,
  Pending,
  Visibility,
} from "@mui/icons-material";
import { getVendorLedger, getVendorTransactions } from "../../api/vendors.api";
import Loader from "../../components/Loader";

interface VendorLedgerItem {
  vendorId: number;
  vendorName: string;
  vendorType: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export default function VendorLedgerList() {

  const [ledger, setLedger] = useState<VendorLedgerItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [search, setSearch] = useState("");
  const [vendorTypeFilter, setVendorTypeFilter] = useState("");

  // Transaction dialog
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedVendorTransactions, setSelectedVendorTransactions] = useState<any[]>([]);
  const [selectedVendorName, setSelectedVendorName] = useState("");

  const loadLedger = async (searchTerm = search, vendorType = vendorTypeFilter, pageNum = page, pageSize = rowsPerPage) => {
    setLoading(true);
    try {
      const params: any = {
        pageNumber: pageNum + 1,
        pageSize,
      };

      if (searchTerm) params.search = searchTerm;
      if (vendorType) params.vendorType = vendorType;

      const res = await getVendorLedger(params);
      setLedger(res.data.items || []);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (error) {
      console.error('Failed to load vendor ledger:', error);
      setLedger([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [page, rowsPerPage]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(0); // Reset to first page when filtering
      loadLedger(search, vendorTypeFilter, 0, rowsPerPage);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [search, vendorTypeFilter]);

  const handleViewTransactions = async (vendorId: number, vendorName: string) => {
    setLoading(true);
    try {
      const res = await getVendorTransactions(vendorId);
      setSelectedVendorTransactions(res.data || []);
      setSelectedVendorName(vendorName);
      setTransactionDialogOpen(true);
    } catch (error) {
      console.error('Failed to load vendor transactions:', error);
      setSelectedVendorTransactions([]);
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
              <AccountBalance />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Vendor Ledger
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Track vendor transactions and outstanding balances
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Search & Filters */}
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              label="Search Vendors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              sx={{
                minWidth: 250,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />

            <FormControl sx={{
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              }
            }}>
              <InputLabel>Vendor Type</InputLabel>
              <Select
                value={vendorTypeFilter}
                label="Vendor Type"
                onChange={(e) => setVendorTypeFilter(e.target.value)}
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                <MenuItem value="MILKMAN">Milkman</MenuItem>
                <MenuItem value="SUPPLIER">Supplier</MenuItem>
              </Select>
            </FormControl>

            {(search || vendorTypeFilter) && (
              <Button
                variant="outlined"
                onClick={() => {
                  setSearch("");
                  setVendorTypeFilter("");
                  setPage(0);
                }}
                sx={{ borderRadius: 2 }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, pt: 0 }}>
          {ledger.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
              <AccountBalance sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">No ledger data available</Typography>
              <Typography variant="body2">
                Vendor ledger will be displayed here once transactions are recorded
              </Typography>
            </Box>
          ) : (
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Paid Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Pending Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ledger.map((item) => (
                  <TableRow
                    key={item.vendorId}
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
                          <People sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {item.vendorName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Chip
                        label={item.vendorType}
                        size="small"
                        color={item.vendorType === "MILKMAN" ? "primary" : "secondary"}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "primary.main" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AttachMoney sx={{ fontSize: 16, color: "primary.main" }} />
                        <Typography variant="body1">
                          ₹{item.totalAmount?.toFixed(2) || "0.00"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "success.main" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Payment sx={{ fontSize: 16, color: "success.main" }} />
                        <Typography variant="body1">
                          ₹{item.paidAmount?.toFixed(2) || "0.00"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: item.pendingAmount > 0 ? "warning.main" : "success.main" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Pending sx={{ fontSize: 16, color: item.pendingAmount > 0 ? "warning.main" : "success.main" }} />
                        <Typography variant="body1">
                          ₹{item.pendingAmount?.toFixed(2) || "0.00"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.pendingAmount > 0 ? "Pending Payment" : "Settled"}
                        size="small"
                        color={item.pendingAmount > 0 ? "warning" : "success"}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Transactions">
                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: "info.light",
                              color: "info.main",
                              "&:hover": {
                                bgcolor: "info.main",
                                color: "white"
                              }
                            }}
                            onClick={() => handleViewTransactions(item.vendorId, item.vendorName)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalRecords > 0 && (
            <TablePagination
              component="div"
              count={totalRecords}
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
          )}
        </Box>
      </Paper>

      {/* Transaction Details Dialog */}
      <Dialog
        open={transactionDialogOpen}
        onClose={() => setTransactionDialogOpen(false)}
        fullWidth
        maxWidth="lg"
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
            p: 3,
            background: "linear-gradient(135deg, #FF8C00 0%, #E67E22 100%)",
            color: "white"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
              <AccountBalance />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {selectedVendorName} - Transaction Details
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Complete transaction history for this vendor
              </Typography>
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {selectedVendorTransactions.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
              <AccountBalance sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">No transactions found</Typography>
              <Typography variant="body2">
                This vendor doesn't have any recorded transactions yet
              </Typography>
            </Box>
          ) : (
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Raw Material</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rate/Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Paid Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Pending Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Entry Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedVendorTransactions.map((transaction: any) => (
                  transaction.purchaseRawMaterialDtos?.map((material: any, index: number) => (
                    <TableRow
                      key={`${transaction.id}-${index}`}
                      sx={{
                        "&:hover": {
                          bgcolor: "grey.50"
                        }
                      }}
                    >
                      {index === 0 && (
                        <>
                          <TableCell sx={{ fontWeight: 500 }} rowSpan={transaction.purchaseRawMaterialDtos.length}>
                            <Chip
                              label={`#${transaction.id}`}
                              size="small"
                              sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                        </>
                      )}
                      <TableCell sx={{ fontWeight: 500 }}>
                        <Chip
                          label={material.rawMaterialType}
                          size="small"
                          color="secondary"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {material.quantity}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {material.unit}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "info.main" }}>
                        ₹{material.ratePerUnit?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "primary.main" }}>
                        ₹{material.amount?.toFixed(2) || "0.00"}
                      </TableCell>
                      {index === 0 && (
                        <>
                          <TableCell sx={{ fontWeight: 500, color: "primary.main" }} rowSpan={transaction.purchaseRawMaterialDtos.length}>
                            ₹{transaction.totalAmount?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, color: "success.main" }} rowSpan={transaction.purchaseRawMaterialDtos.length}>
                            ₹{transaction.paidAmount?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, color: transaction.pendingAmount > 0 ? "warning.main" : "success.main" }} rowSpan={transaction.purchaseRawMaterialDtos.length}>
                            ₹{transaction.pendingAmount?.toFixed(2) || "0.00"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }} rowSpan={transaction.purchaseRawMaterialDtos.length}>
                            {new Date(transaction.entryDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell rowSpan={transaction.purchaseRawMaterialDtos.length}>
                            <Chip
                              label={transaction.pendingAmount > 0 ? "Pending" : "Settled"}
                              size="small"
                              color={transaction.pendingAmount > 0 ? "warning" : "success"}
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setTransactionDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading */}
      <Loader open={loading} message="Loading vendor ledger..." />
    </Box>
  );
}
