import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ProtectedRoute from "../auth/ProtectedRoute";
import Layout from "../components/Layout/Layout";

import Dashboard from "../pages/Dashboard";
import UserList from "../pages/Users/UserList";
import RoleList from "../pages/Roles/RoleList";
import PermissionList from "../pages/Permissions/PermissionList";
import ProductTypeList from "../pages/ProductTypes/ProductTypeList";
import IngredientTypeList from "../pages/IngredientTypes/IngredientTypeList";
import ProductionBatchList from "../pages/ProductionBatch/ProductionBatchList";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={
          <ProtectedRoute requiredPermission="DASHBOARD_VIEW">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/users" element={<UserList />} />
        <Route path="/roles" element={<RoleList />} />
        <Route path="/permissions" element={<PermissionList />} />
        <Route path="/product-types" element={<ProductTypeList />} />
        <Route path="/ingredient-types" element={<IngredientTypeList />} />
        <Route path="/production-batches" element={<ProductionBatchList />} />
      </Route>
    </Routes>
  );
}
