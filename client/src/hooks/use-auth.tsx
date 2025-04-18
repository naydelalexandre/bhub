import React, { createContext, ReactNode, useContext, useState } from "react";
import { InsertUser } from "@shared/schema";

// Define a simplified User type that matches our expected structure
type User = {
  id: number;
  username: string;
  password: string;
  name: string;
  role: "manager" | "broker";
  avatarInitials?: string;
};

// Simplified AuthContextType for now
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: InsertUser) => Promise<void>;
};

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

// Temporary auth provider with mock data to get the UI working
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // For testing UI, create a mock user
      if (username === "manager@example.com" && password === "password") {
        setUser({
          id: 1,
          username: "manager@example.com",
          name: "Manager User",
          role: "manager",
          password: "", // We never expose the password
          avatarInitials: "MU"
        });
      } else if (username === "broker@example.com" && password === "password") {
        setUser({
          id: 2,
          username: "broker@example.com",
          name: "Broker User",
          role: "broker",
          password: "", // We never expose the password
          avatarInitials: "BU"
        });
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Login failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
  };

  const register = async (userData: InsertUser) => {
    setIsLoading(true);
    try {
      // Simulate register
      setUser({
        id: 3,
        ...userData,
        password: "", // We never expose the password
        avatarInitials: userData.avatarInitials || "NU"
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Registration failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
