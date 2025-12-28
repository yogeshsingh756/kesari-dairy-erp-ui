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

export const verifyUserApi = (verify: string) =>
  api.post("/auth/verify", null, { params: { verify } });

export const changePasswordApi = (data: { verify: string; newPassword: string }) =>
  api.post("/auth/change-password", data);

export const verifyEmailApi = (email: string) =>
  api.post("/auth/verify-email", null, { params: { verify: email } });

export const verifyUsernameApi = (username: string) =>
  api.post("/auth/verify-username", null, { params: { verify: username } });
