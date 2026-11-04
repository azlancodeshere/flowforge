"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api from "@/lib/api";

type User = {
  _id: string;
  name?: string;
  email: string;
  username?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reads the session from the API without touching state, so callers can
  // decide when (and whether) to apply the result.
  const requestCurrentUser = useCallback(async (): Promise<User | null> => {
    const response = await api.get("/user/me");
    return (response.data.data as User | null) ?? null;
  }, []);

  const applySession = useCallback((currentUser: User | null) => {
    setUser(currentUser);
    setIsAuthenticated(Boolean(currentUser));
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/user/logout");
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const getCurrentUser = useCallback(async () => {
    try {
      applySession(await requestCurrentUser());
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [requestCurrentUser, applySession, clearSession]);

  useEffect(() => {
    let cancelled = false;

    // State is applied inside the promise callbacks rather than in the effect
    // body, which avoids a cascading render. The flag drops updates that land
    // after the provider unmounts.
    requestCurrentUser()
      .then((currentUser) => {
        if (!cancelled) applySession(currentUser);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestCurrentUser, applySession, clearSession]);

  const authValue: AuthContextType = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    logout,
    getCurrentUser,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export { AuthContext, AuthProvider, useAuth };
