import api from "./axios";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/* ---------------- TYPES ---------------- */
export interface User {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  role: string;
  isActive: boolean;
}

export interface CreateUserData {
  fullName: string;
  username: string;
  password: string;
  role: string;
  isActive: boolean;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
}

/* ---------------- USERS ---------------- */

export const getUsers = () =>
  api.get("/users", authHeader());

export const getUser = (id: string) =>
  api.get(`/users/${id}`, authHeader());

export const createUser = (data: CreateUserData) =>
  api.post("/users", data, authHeader());

export const updateUser = (data: UpdateUserData) =>
  api.put("/users", data, authHeader());

export const deleteUser = (id: string) =>
  api.delete(`/users/${id}`, authHeader());
