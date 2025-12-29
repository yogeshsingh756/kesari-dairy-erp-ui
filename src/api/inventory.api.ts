import api from "./axios";

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getInventory = () =>
  api.get("/inventory", auth());