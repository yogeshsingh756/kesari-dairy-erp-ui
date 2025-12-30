import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Factory,
  Add,
  Visibility,
  Calculate,
  CheckCircle,
} from "@mui/icons-material";
import { getProductionBatches, calculatePackaging, confirmPackaging } from "../../api/productionBatches.api";
import { hasPermission } from "../../utils/hasPermission";
import { useAuth } from "../../auth/useAuth";
import ProductionBatchForm from "./ProductionBatchForm";
import ProductionBatchDetail from "./ProductionBatchDetail";
import Loader from "../../components/Loader";

export default function ProductionBatchList() {
  const { state } = useAuth();

  const [rows, setRows] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [batchDateFilter, setBatchDateFilter] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Packaging calculation states
  const [packagingDialogOpen, setPackagingDialogOpen] = useState(false);
  const [calculationDialogOpen, setCalculationDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [extraPerUnit, setExtraPerUnit] = useState<string>("");
  const [packagingCalculation, setPackagingCalculation] = useState<any>(null);
  const [actualPackets, setActualPackets] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const load = async (pageNum = page, pageSize = rowsPerPage) => {
    setLoading(true);
    try {
      const params: any = { pageNumber: pageNum + 1, pageSize };
      if (batchDateFilter) {
        params.batchDate = batchDateFilter;
      }
      const res = await getProductionBatches(params);
      setRows(res.data.items || []);
      setTotalRecords(res.data.totalRecords || 0);
    } catch (error) {
      console.error('Failed to load production batches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page, rowsPerPage);
  }, [page, rowsPerPage, batchDateFilter]);

  // Packaging functions
  const handleCalculatePackaging = async () => {
    if (!selectedBatchId || !extraPerUnit) return;

    setLoading(true);
    try {
      const res = await calculatePackaging(selectedBatchId, parseFloat(extraPerUnit));
      setPackagingCalculation(res.data);
      setPackagingDialogOpen(false);
      setCalculationDialogOpen(true);
    } catch (error) {
      console.error('Failed to calculate packaging:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPackaging = () => {
    // Open the final confirmation dialog instead of calling API directly
    setCalculationDialogOpen(false);
    setConfirmDialogOpen(true);
    setActualPackets(""); // Reset optional fields
    setRemarks("");
  };

  const handleFinalConfirmPackaging = async () => {
    if (!selectedBatchId || !packagingCalculation) return;

    setLoading(true);
    try {
      const requestData = {
        calculatedPackets: packagingCalculation.totalPackets,
        actualPackets: actualPackets ? parseInt(actualPackets) : null,
        extraPerUnit: parseFloat(extraPerUnit),
        remarks: remarks || null
      };

      await confirmPackaging(selectedBatchId, requestData);
      setConfirmDialogOpen(false);
      setSelectedBatchId(null);
      setExtraPerUnit("");
      setPackagingCalculation(null);
      setActualPackets("");
      setRemarks("");
      load(); // Refresh the list
    } catch (error) {
      console.error('Failed to confirm packaging:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPackagingDialog = (batchId: number) => {
    setSelectedBatchId(batchId);
    setExtraPerUnit("");
    setPackagingDialogOpen(true);
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
            background: "linear-gradient(135deg, #FF6347 0%, #FF4500 100%)",
            color: "white"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                <Factory />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Production Batches
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage production batches and their ingredients
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenForm(true)}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)"
                },
                borderRadius: 2,
                px: 3
              }}
            >
              Add Batch
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              label="Filter by Batch Date"
              type="date"
              value={batchDateFilter}
              onChange={(e) => {
                setBatchDateFilter(e.target.value);
                setPage(0); // Reset to first page when filtering
              }}
              InputLabelProps={{ shrink: true }}
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />
            {batchDateFilter && (
              <Button
                variant="outlined"
                onClick={() => {
                  setBatchDateFilter("");
                  setPage(0);
                }}
                sx={{ borderRadius: 2 }}
              >
                Clear Filter
              </Button>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {rows.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
              <Factory sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6">No production batches found</Typography>
              <Typography variant="body2">
                Create your first production batch to get started
              </Typography>
            </Box>
          ) : (
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Batch Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Base Price/Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actual Cost/Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Selling Price/Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Cost</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(r => (
                  <TableRow
                    key={r.id}
                    sx={{
                      "&:hover": {
                        bgcolor: "grey.50",
                        cursor: "pointer"
                      }
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={`#${r.id}`}
                        size="small"
                        sx={{
                          bgcolor: "primary.main",
                          color: "white",
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {r.productName}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {r.batchQuantity}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.batchUnit}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "info.main" }}>
                      ₹{r.basePricePerUnit?.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "warning.main" }}>
                      ₹{r.actualCostPerUnit?.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "success.main" }}>
                      ₹{r.sellingPricePerUnit?.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "error.main" }}>
                      ₹{r.totalCost?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {new Date(r.batchDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Batch Details">
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
                            onClick={() => setDetailId(r.id)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Calculate Packaging">
                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: "secondary.light",
                              color: "secondary.main",
                              "&:hover": {
                                bgcolor: "secondary.main",
                                color: "white"
                              }
                            }}
                            onClick={() => openPackagingDialog(r.id)}
                          >
                            <Calculate fontSize="small" />
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

      {/* Modals */}
      {openForm && (
        <ProductionBatchForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onSuccess={load}
        />
      )}

      {detailId && (
        <ProductionBatchDetail
          id={detailId}
          onClose={() => setDetailId(null)}
        />
      )}

      {/* Packaging Input Dialog */}
      <Dialog
        open={packagingDialogOpen}
        onClose={() => setPackagingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Calculate Packaging
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Extra Per Unit"
            type="number"
            fullWidth
            variant="outlined"
            value={extraPerUnit}
            onChange={(e) => setExtraPerUnit(e.target.value)}
            inputProps={{ step: 0.01, min: 0 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPackagingDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCalculatePackaging}
            variant="contained"
            disabled={!extraPerUnit || loading}
          >
            Calculate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Packaging Calculation Results Dialog */}
      <Dialog
        open={calculationDialogOpen}
        onClose={() => setCalculationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Packaging Calculation Results
        </DialogTitle>
        <DialogContent>
          {packagingCalculation && (
            <Box sx={{ mt: 2 }}>
              {(() => {
                const selectedBatch = rows.find(r => r.id === selectedBatchId);
                return (
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 3, mb: 3 }}>
                    <Paper sx={{ p: 3, bgcolor: "primary.light", color: "primary.contrastText" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Batch ID
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        #{selectedBatch?.id}
                      </Typography>
                    </Paper>

                    <Paper sx={{ p: 3, bgcolor: "secondary.light", color: "secondary.contrastText" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Product
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {selectedBatch?.productName}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {selectedBatch?.batchQuantity} {selectedBatch?.batchUnit}
                      </Typography>
                    </Paper>
                  </Box>
                );
              })()}

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">Batch Quantity (Base Unit)</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {packagingCalculation.batchQuantityBaseUnit}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">Variant Quantity (Base Unit)</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {packagingCalculation.variantQuantityBaseUnit}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">Extra Per Unit</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                    {packagingCalculation.extraPerUnit}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">Per Packet Consumption</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "success.main" }}>
                    {packagingCalculation.perPacketConsumption}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">Total Packets</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "warning.main" }}>
                    {packagingCalculation.totalPackets}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">Wastage</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "error.main" }}>
                    {packagingCalculation.wastage}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalculationDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPackaging}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            disabled={loading}
          >
            Confirm Packaging
          </Button>
        </DialogActions>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Final Confirmation
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Calculated Packets"
              type="number"
              fullWidth
              value={packagingCalculation?.totalPackets || ""}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "grey.50",
                }
              }}
            />

            <TextField
              label="Extra Per Unit"
              type="number"
              fullWidth
              value={extraPerUnit}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "grey.50",
                }
              }}
            />

            <TextField
              label="Actual Packets (Optional)"
              type="number"
              fullWidth
              value={actualPackets}
              onChange={(e) => setActualPackets(e.target.value)}
              inputProps={{ min: 0 }}
              placeholder="Leave empty to use calculated value"
            />

            <TextField
              label="Remarks (Optional)"
              multiline
              rows={3}
              fullWidth
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Any additional notes..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleFinalConfirmPackaging}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            disabled={loading}
          >
            Final Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading */}
      <Loader open={loading} message={loading ? "Processing..." : "Loading production batches..."} />
    </Box>
  );
}
