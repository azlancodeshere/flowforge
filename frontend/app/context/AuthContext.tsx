"use client";

import {createContext,useContext,useState, useEffect, type ReactNode,} from "react";
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

  

  const logout = async () => {
    try {
      await api.post("/user/logout");
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await api.get("/users/current-user");
      const currentUser = response.data.data;

      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser));
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void getCurrentUser();
  }, []);

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