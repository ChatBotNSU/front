import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { fetchMe, loginRequest, registerRequest } from "@/entities/user/api";
import type { AuthUser } from "@/entities/user/model/types";
import { queryClient } from "@/shared/api/queryClient";
import { clearToken, getToken, setToken } from "@/shared/api/token";

type Status = "loading" | "authed" | "anon";

type AuthContextValue = {
  user: AuthUser | null;
  status: Status;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Restore session from a stored token on first load.
  useEffect(() => {
    if (!getToken()) {
      setStatus("anon");
      return;
    }
    fetchMe()
      .then((u) => {
        setUser(u);
        setStatus("authed");
      })
      .catch(() => {
        clearToken();
        setStatus("anon");
      });
  }, []);

  async function login(email: string, password: string) {
    const res = await loginRequest({ email, password });
    setToken(res.token);
    setUser(res.user);
    setStatus("authed");
  }

  async function register(email: string, password: string, name?: string) {
    const res = await registerRequest({ email, password, name });
    setToken(res.token);
    setUser(res.user);
    setStatus("authed");
  }

  function logout() {
    clearToken();
    setUser(null);
    setStatus("anon");
    queryClient.clear();
  }

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
