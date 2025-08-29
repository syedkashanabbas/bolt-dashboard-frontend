'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SuperAdmin' | 'Admin' | 'Manager' | 'User';
  organization?: string;      // optional now
  organizationId?: string;    // optional now
  department?: string;
  avatar?: string;
  lastLogin?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }

    setLoading(false);
  }, []);

  // LOGIN
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // allows refreshToken cookie
      });

      if (!res.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await res.json(); // { accessToken, user }

      // Normalize user object
      const normalizedUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        organization: data.user.organization || "System",
        organizationId: data.user.organizationId || "",
        department: data.user.department || "",
        avatar: data.user.avatar || "",
        lastLogin: new Date().toISOString(),
      };

      // Save in localStorage
      localStorage.setItem("auth_token", data.accessToken);
      localStorage.setItem("user_data", JSON.stringify(normalizedUser));

      setUser(normalizedUser);
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  // REFRESH TOKEN
  const refreshToken = async (): Promise<void> => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/refresh", {
        method: "GET",
        credentials: "include", // sends refreshToken cookie
      });

      if (!res.ok) {
        logout();
        return;
      }

      const data = await res.json(); // { accessToken }
      localStorage.setItem("auth_token", data.accessToken);
    } catch {
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
