import api from "./axios";

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// LIST
export const getVendors = (params?: any) =>
  api.get("/vendors", { params, ...auth() });
