import {
  Box, Tabs, Tab, TextField, Button, Paper, Typography
} from "@mui/material";
import { useState } from "react";
import {
  calculateMilk,
  confirmMilk,
  calculateOtherMaterial,
  confirmOtherMaterial
} from "../../api/purchase.api";
import { useNavigate } from "react-router-dom";

export default function PurchaseCreate() {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  // MILK
  const [milk, setMilk] = useState({
    quantity: "",
    fat: "",
    clr: "",
    rate: ""
  });
  const [milkResult, setMilkResult] = useState<any>(null);

  // OTHER
  const [other, setOther] = useState<any>({
    rawMaterialType: "",
    quantity: "",
    unit: "",
    ratePerUnit: ""
  });
  const [otherAmount, setOtherAmount] = useState<number | null>(null);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">New Purchase</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Milk Purchase" />
        <Tab label="Other Material" />
      </Tabs>

      {/* MILK TAB */}
      {tab === 0 && (
        <Box mt={3}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
              <TextField label="Quantity (Liter)" fullWidth
                onChange={e => setMilk({ ...milk, quantity: e.target.value })} />
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
              <TextField label="Fat %" fullWidth
                onChange={e => setMilk({ ...milk, fat: e.target.value })} />
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
              <TextField label="CLR" fullWidth
                onChange={e => setMilk({ ...milk, clr: e.target.value })} />
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
              <TextField label="Rate (6600)" fullWidth
                onChange={e => setMilk({ ...milk, rate: e.target.value })} />
            </Box>
          </Box>

          <Button sx={{ mt: 2 }} variant="contained"
            onClick={async () => {
              const res = await calculateMilk(milk);
              setMilkResult(res.data);
            }}>
            Calculate
          </Button>

          {milkResult && (
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography>SNF %: {milkResult.snf}</Typography>
              <Typography>Fat Kg: {milkResult.fatKg}</Typography>
              <Typography>SNF Kg: {milkResult.snfKg}</Typography>
              <Typography>Fat Rate: {milkResult.fatRate}</Typography>
              <Typography>Avg Rate/Kg: {milkResult.avgRate}</Typography>
              <Typography>Total Amount: ₹{milkResult.amount}</Typography>

              <Button color="success" variant="contained" sx={{ mt: 2 }}
                onClick={async () => {
                  await confirmMilk({ ...milk, ...milkResult });
                  navigate("/purchases");
                }}>
                Save Purchase
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* OTHER TAB */}
      {tab === 1 && (
        <Box mt={3}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
              <TextField label="Material Type" fullWidth
                onChange={e => setOther({ ...other, rawMaterialType: e.target.value })} />
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
              <TextField label="Quantity" fullWidth
                onChange={e => setOther({ ...other, quantity: e.target.value })} />
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
              <TextField label="Unit" fullWidth
                onChange={e => setOther({ ...other, unit: e.target.value })} />
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
              <TextField label="Rate / Unit" fullWidth
                onChange={e => setOther({ ...other, ratePerUnit: e.target.value })} />
            </Box>
          </Box>

          <Button sx={{ mt: 2 }} variant="contained"
            onClick={async () => {
              const res = await calculateOtherMaterial(other);
              setOtherAmount(res.data.amount);
            }}>
            Calculate
          </Button>

          {otherAmount && (
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography>Total Amount: ₹{otherAmount}</Typography>
              <Button variant="contained" color="success"
                onClick={async () => {
                  await confirmOtherMaterial({ ...other, amount: otherAmount });
                  navigate("/purchases");
                }}>
                Save Purchase
              </Button>
            </Paper>
          )}
        </Box>
      )}
    </Paper>
  );
}
