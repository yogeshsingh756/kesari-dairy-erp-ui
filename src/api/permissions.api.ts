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

export const getPermissions = () =>
  api.get<PermissionGroup[]>("/permissions", auth());
