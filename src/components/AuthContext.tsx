import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import type { AuthUser } from "~/lib/auth-fns";
import { signup, login, logout, getMe } from "~/lib/auth-fns";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  signup: (data: { email: string; password: string; name?: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const result = await getMe();
      setUser(result.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSignup = useCallback(
    async (data: { email: string; password: string; name?: string }) => {
      const result = await signup({ data });
      setUser(result.user);
    },
    [],
  );

  const handleLogin = useCallback(
    async (data: { email: string; password: string }) => {
      const result = await login({ data });
      setUser(result.user);
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    router.navigate({ to: "/" });
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      signup: handleSignup,
      login: handleLogin,
      logout: handleLogout,
      refresh,
    }),
    [user, loading, handleSignup, handleLogin, handleLogout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
