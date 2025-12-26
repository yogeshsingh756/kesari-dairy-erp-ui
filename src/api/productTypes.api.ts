import api from "./axios";
const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// GET all product types
export const getProductTypes = () =>
  api.get("/product-types", auth());

// GET single product type
export const getProductType = (id: number) =>
  api.get(`/product-types/${id}`, auth());
// CREATE
export const createProductType = (data: any) =>
  api.post("/product-types", data, auth());

// UPDATE
export const updateProductType = (data: any) =>
  api.put("/product-types", data, auth());
// DELETE
export const deleteProductType = (id: number) =>
  api.delete(`/product-types/${id}`, auth());