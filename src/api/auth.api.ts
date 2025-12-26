import api from "./axios";

/* ---------------- TYPES ---------------- */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  permissions: string[];
}

/* ---------------- API ---------------- */

export const loginApi = (data: LoginRequest) =>
  api.post<LoginResponse>("/auth/login", data);
