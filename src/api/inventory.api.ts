import api from "./axios";

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getInventory = (params?: any) =>
  api.get("/inventory", { params, ...auth() });
