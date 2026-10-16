"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  authApi,
  getAuthToken,
  setAuthToken,
  setRefreshToken,
} from "@/lib/api";
import type { StudentProfile } from "@/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: StudentProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    dateOfBirth: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<StudentProfile | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = getAuthToken();
      if (!token) {
        if (cancelled) return;
        setUser(null);
        setStatus("unauthenticated");
        return;
      }
      try {
        const session = await authApi.session();
        if (cancelled) return;
        setUser(session.user);
        setStatus("authenticated");
      } catch {
        if (cancelled) return;
        setAuthToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setAuthToken(result.token);
    setRefreshToken(result.refreshToken ?? null);
    setUser(result.user);
    setStatus("authenticated");
  }, []);

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      dateOfBirth: string
    ) => {
      const result = await authApi.register(name, email, password, dateOfBirth);
      setAuthToken(result.token);
      setRefreshToken(result.refreshToken ?? null);
      setUser(result.user);
      setStatus("authenticated");
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logging out locally should succeed even if the API call fails.
    } finally {
      setAuthToken(null);
      setRefreshToken(null);
    }
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refresh = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }
    try {
      const session = await authApi.session();
      setUser(session.user);
      setStatus("authenticated");
    } catch {
      setAuthToken(null);
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signUp, signOut, refresh }),
    [status, user, signIn, signUp, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
