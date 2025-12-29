import api from "./axios";

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// MILK
export const calculateMilk = (data: any) =>
  api.post("/purchases/milk/calculate", data, auth());

export const confirmMilk = (data: any) =>
  api.post("/purchases/milk/confirm", data, auth());

// OTHER MATERIAL
export const calculateOtherMaterial = (data: any) =>
  api.post("/purchases/other/calculate", data, auth());

export const confirmOtherMaterial = (data: any) =>
  api.post("/purchases/other/confirm", data, auth());

// LIST
export const getPurchases = (params: any) =>
  api.get("/purchases/purchases", { params, ...auth() });

export const getPurchaseById = (id: number) =>
  api.get(`/purchases/${id}`, auth());
