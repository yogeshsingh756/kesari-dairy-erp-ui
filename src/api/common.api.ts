import api from "./axios";

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getUnits = () =>
  api.get("/common/units", auth());

export const getMilkStock = () =>
  api.get("/common/milkStock", auth());

export const getStats = () =>
  api.get("/common/stats", auth());

// Get dashboard summary data
export const getDashboardSummary = async () => {
  const response = await api.get('/common/summary', auth());
  return response.data;
};

export interface DashboardSummary {
  todaySalesAmount: number;
  todaySalesQuantity: number;
  todayCollection: number;
  pendingAmount: number;
  totalCustomers: number;
  lowStockProducts: number;
  employeeActiveStock: number;
}
