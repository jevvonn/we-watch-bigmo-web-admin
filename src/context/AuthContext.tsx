import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { api, setApiToken } from "../lib/api";

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);
const STORAGE_KEY = "auth.v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { token: string; user: User };
        if (parsed?.token && parsed?.user) {
          setApiToken(parsed.token);
          setToken(parsed.token);
          setUser(parsed.user);
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  const login = async (identifier: string, password: string) => {
    const result = await api.login(identifier, password);
    setApiToken(result.token);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  };

  const logout = () => {
    setApiToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ token, user, hydrated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
