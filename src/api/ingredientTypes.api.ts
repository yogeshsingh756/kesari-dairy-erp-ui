import api from "./axios";

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/* ---------- TYPES ---------- */

export interface IngredientType {
  id: number;
  name: string;
  unit: string;
  costPerUnit: number;
  description: string;
}

export interface CreateIngredientTypeData {
  name: string;
  unit: string;
  costPerUnit: number;
  description: string;
}

export interface UpdateIngredientTypeData extends Partial<CreateIngredientTypeData> {
  id: number;
}

/* ---------- API FUNCTIONS ---------- */

export const getIngredientTypes = (search = "", pageNumber = 1, pageSize = 10) =>
  api.get(`/ingredient-types?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`, auth());

export const getIngredientType = (id: number) =>
  api.get(`/ingredient-types/${id}`, auth());

export const createIngredientType = (data: CreateIngredientTypeData) =>
  api.post("/ingredient-types", data, auth());

export const updateIngredientType = (data: UpdateIngredientTypeData) =>
  api.put("/ingredient-types", data, auth());

export const deleteIngredientType = (id: number) =>
  api.delete(`/ingredient-types/${id}`, auth());
