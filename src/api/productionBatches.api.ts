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
