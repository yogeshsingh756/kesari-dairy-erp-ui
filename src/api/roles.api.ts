import api from "./axios";

/* ---------------- AUTH HEADER ---------------- */
const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/* ---------------- TYPES ---------------- */
export interface Role {
  id: string;
  roleName: string;
  description: string;
}

export interface CreateRoleData {
  roleName: string;
  description: string;
}

export interface UpdateRoleData extends Partial<CreateRoleData> {
  id: string;
}

/* ---------------- APIS ---------------- */

export const getRoles = (search = "", pageNumber = 1, pageSize = 10) =>
  api.get(`/roles?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`, auth());

export const getRoleById = (id: string) =>
  api.get(`/roles/${id}`, auth());

export const createRole = (data: CreateRoleData) =>
  api.post("/roles", data, auth());

export const updateRole = (data: UpdateRoleData) =>
  api.put("/roles", data, auth());

export const deleteRole = (id: string) =>
  api.delete(`/roles/${id}`, auth());
