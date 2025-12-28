import api from "./axios";

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getUnits = () =>
  api.get("/common/units", auth());

export const getStats = () =>
  api.get("/common/stats", auth());
