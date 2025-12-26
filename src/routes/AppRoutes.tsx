import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "../auth/ProtectedRoute";
import Layout from "../components/Layout/Layout";

import Dashboard from "../pages/Dashboard";
import UserList from "../pages/Users/UserList";
import RoleList from "../pages/Roles/RoleList";
import PermissionList from "../pages/Permissions/PermissionList";
import ProductTypeList from "../pages/ProductTypes/ProductTypeList";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/roles" element={<RoleList />} />
        <Route path="/permissions" element={<PermissionList />} />
        <Route path="/product-types" element={<ProductTypeList />} />
      </Route>
    </Routes>
  );
}
