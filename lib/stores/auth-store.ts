import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { normalizeJwtRolesClaim } from "@/lib/auth/role-routing";

export const AUTH_STORAGE_KEY = "verendar-auth";

type AuthUser = {
  id: string;
  email: string;
  fullName?: string;
  role: string[];
};

type JwtAuthPayload = {
  sub?: string;
  email?: string;
  fullName?: string;
  role?: string | string[];
};

type SetAuthSessionPayload = {
  accessToken: string;
  refreshToken?: string | null;
};

type AuthStore = {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuthSession: (payload: SetAuthSessionPayload) => void;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

function decodeUser(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<JwtAuthPayload>(token);
    return {
      id: decoded.sub ?? "",
      email: decoded.email ?? "",
      fullName: decoded.fullName,
      role: normalizeJwtRolesClaim(decoded.role),
    };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setAuthSession: ({ accessToken, refreshToken }) =>
        set((state) => ({
          token: accessToken,
          refreshToken: typeof refreshToken === "undefined" ? state.refreshToken : refreshToken,
          user: decodeUser(accessToken),
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),
      clearError: () => set({ error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
