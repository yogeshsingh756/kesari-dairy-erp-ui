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
import PurchaseCreate from "../pages/Purchases/PurchaseCreate";
import PurchaseList from "../pages/Purchases/PurchaseList";
import PurchaseDetail from "../pages/Purchases/PurchaseDetail";
import InventoryList from "../pages/Inventory/InventoryList";
import VendorList from "../pages/Vendors/VendorList";
import VendorLedgerList from "../pages/Vendors/VendorLedgerList";

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
        <Route path="/purchases" element={
          <ProtectedRoute requiredPermission="PURCHASE_VIEW">
            <PurchaseList />
          </ProtectedRoute>
        } />
        <Route path="/purchases/new" element={
          <ProtectedRoute requiredPermission="PURCHASE_VIEW">
            <PurchaseCreate />
          </ProtectedRoute>
        } />
        <Route path="/purchases/:id" element={
          <ProtectedRoute requiredPermission="PURCHASE_VIEW">
            <PurchaseDetail />
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute requiredPermission="INVENTORY_VIEW">
            <InventoryList />
          </ProtectedRoute>
        } />
        <Route path="/vendors" element={
          <ProtectedRoute requiredPermission="VENDORS_VIEW">
            <VendorList />
          </ProtectedRoute>
        } />
        <Route path="/vendor-ledger" element={
          <ProtectedRoute requiredPermission="VENDORS_LEDGERS_VIEW">
            <VendorLedgerList />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}
