import api from "./axios";

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
export const getVendors = (params?: any) =>
  api.get("/vendors", { params, ...auth() });

// LIST - Paged vendors with filters
export const getVendorsPaged = (params?: any) =>
  api.get("/vendors/GetPagedAll", { params, ...auth() });

// GET BY ID
export const getVendorById = (id: number) =>
  api.get(`/vendors/${id}`, auth());

// CREATE
export const createVendor = (data: any) =>
  api.post("/vendors", data, auth());

// UPDATE
export const updateVendor = (id: number, data: any) =>
  api.put(`/vendors/${id}`, data, auth());

// DELETE
export const deleteVendor = (id: number) =>
  api.delete(`/vendors/${id}`, auth());

// VENDOR LEDGER
export const getVendorLedger = (params?: any) =>
  api.get("/vendor-ledger", { params, ...auth() });

// VENDOR TRANSACTIONS
export const getVendorTransactions = (vendorId: number) =>
  api.get(`/vendor-ledger/vendor/${vendorId}/transactions`, auth());
