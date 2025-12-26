import { useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContextTypes";
import type { AuthState } from "./AuthContextTypes";

interface LoginData {
  token: string;
  role: string;
  permissions: string[];
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    permissions: JSON.parse(localStorage.getItem("permissions") || "[]"),
    isAuthenticated: !!localStorage.getItem("token"),
  });

  const login = (data: LoginData) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("permissions", JSON.stringify(data.permissions));
    setState({
      ...data,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.clear();
    setState({
      token: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
