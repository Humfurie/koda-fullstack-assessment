"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api, ApiError } from "./api";
import { AuthResponse, User } from "./types";

const TOKEN_KEY = "koda_access_token";
const USER_KEY = "koda_user";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ user, token, isLoading }, setSession] = useState<{
    user: User | null;
    token: string | null;
    isLoading: boolean;
  }>({ user: null, token: null, isLoading: true });

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    // One-time hydration from localStorage on mount; not derivable during render (SSR has no localStorage).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(
      storedToken && storedUser
        ? { token: storedToken, user: JSON.parse(storedUser), isLoading: false }
        : { user: null, token: null, isLoading: false },
    );
  }, []);

  function persist(auth: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, auth.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    setSession({ token: auth.access_token, user: auth.user, isLoading: false });
  }

  async function login(email: string, password: string) {
    const auth = await api.post<AuthResponse>("/login", { email, password });
    persist(auth);
  }

  async function register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) {
    const auth = await api.post<AuthResponse>("/register", {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    persist(auth);
  }

  async function logout() {
    try {
      if (token) await api.post("/logout", {}, token);
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setSession({ user: null, token: null, isLoading: false });
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
