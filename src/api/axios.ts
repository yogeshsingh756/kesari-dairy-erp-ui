import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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
