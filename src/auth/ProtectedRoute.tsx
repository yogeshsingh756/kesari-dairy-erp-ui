import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useAuth();

  if (!state.token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
