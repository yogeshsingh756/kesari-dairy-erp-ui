import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api" || "/api",
  //baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

api.interceptors.response.use(
  res => res,
  err => {
    const msg =
      err.response?.data?.message ||
      err.response?.statusText ||
      "Something went wrong";
    return Promise.reject(msg);
  }
);

export default api;
