import api from "./axios";
const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// GET all product types with pagination and search
export const getProductTypes = (search = "", pageNumber = 1, pageSize = 10) =>
  api.get(`/product-types?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`, auth());

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
export const getProductDropdown = () =>
  api.get("/product-types/dropdown",auth());
