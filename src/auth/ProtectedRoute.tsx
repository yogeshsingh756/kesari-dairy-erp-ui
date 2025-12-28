import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { hasPermission } from "../utils/hasPermission";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export default function ProtectedRoute({
  children,
  requiredPermission
}: ProtectedRouteProps) {
  const { state } = useAuth();

  if (!state.token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(state.permissions, requiredPermission)) {
    // Redirect to first available page based on permissions
    // For now, redirect to users if they have USER_VIEW, otherwise show unauthorized
    if (hasPermission(state.permissions, "USER_VIEW")) {
      return <Navigate to="/users" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
