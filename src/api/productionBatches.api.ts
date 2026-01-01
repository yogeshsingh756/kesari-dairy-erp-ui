import api from "./axios";
const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
export const getProductionBatches = (params: any) =>
  api.get("/production-batches", { params, ...auth() });

export const getProductionBatchById = (id: number) =>
  api.get(`/production-batches/${id}`, auth());

export const createProductionBatch = (data: any) =>
  api.post("/production-batches", data, auth());

export const updateProductionBatch = (id: number, data: any) =>
  api.put(`/production-batches/${id}`, data, auth());

export const deleteProductionBatch = (id: number) =>
  api.delete(`/production-batches/${id}`, auth());

// PACKAGING APIs
export const calculatePackaging = (batchId: number, extraPerUnit: number) =>
  api.post(`/batches/${batchId}/packaging/calculate`, { extraPerUnit }, auth());

export const confirmPackaging = (batchId: number, requestData: any) =>
  api.post(`/batches/${batchId}/packaging/confirm`, requestData, auth());
