import api from "./axios";
const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
export const getRawMaterials = () =>
  api.get("/raw-materials", auth());