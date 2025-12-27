import api from "./axios";

/* ---------- TYPES (SINGLE SOURCE OF TRUTH) ---------- */

export interface Permission {
  id: number;
  permissionKey: string;
  permissionName: string;
}

export interface PermissionGroup {
  moduleName: string;
  permissions: Permission[];
}

/* ---------- API ---------- */

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getPermissions = (search = "", pageNumber = 1, pageSize = 10) =>
  api.get(`/permissions?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`, auth());
