import { createContext } from "react";

export interface AuthState {
  token: string | null;
  role: string | null;
  permissions: string[];
  isAuthenticated: boolean;
}

export interface AuthContextType {
  state: AuthState;
  login: (data: { token: string; role: string; permissions: string[] }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
