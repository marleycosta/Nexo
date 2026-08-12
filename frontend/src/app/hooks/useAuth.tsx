import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import * as authService from "../services/auth";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem("access_token"))
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      async login(username, password) {
        await authService.login(username, password);
        setIsAuthenticated(true);
      },
      async register(username, email, password) {
        await authService.register(username, email, password);
      },
      logout() {
        authService.logout();
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
