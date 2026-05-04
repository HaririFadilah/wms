"use client";

import api from "@/lib/api";
import type { User } from "@/types/api";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post("/login", { email, password });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
