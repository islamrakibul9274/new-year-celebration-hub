"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  plan: "free" | "silver" | "diamond";
  themePreference?: string;
  confettiSoundsEnabled?: boolean;
  customGreeting?: string;
  bio?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  sessionExpired: boolean;
  dismissSessionExpired: () => void;
  login: (userData: UserSession) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  sessionExpired: false,
  dismissSessionExpired: () => {},
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json().catch(() => ({ user: null }));
      if (res.status === 401 && data.code === "session_expired") {
        setSessionExpired(true);
      }
      setUser(res.ok ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = (userData: UserSession) => {
    setSessionExpired(false);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error", e);
    }
    setUser(null);
    setSessionExpired(false);
    router.push("/");
    router.refresh();
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sessionExpired,
        dismissSessionExpired: () => setSessionExpired(false),
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
