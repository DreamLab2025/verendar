"use client";

import { useEffect, useRef } from "react";
import { setCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { AuthService } from "@/lib/api/services/fetchAuth";
import api8080Service from "@/lib/api/api8080Service";
import apiService from "@/lib/api/apiService";
import { getAuthCookieConfig } from "@/utils/cookieConfig";
import { AUTH_STORAGE_KEY, useAuthStore } from "@/lib/stores/auth-store";

const REFRESH_BUFFER_MS = 2 * 60 * 1000;

function getTokenExpMs(token: string): number | null {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) return null;
    return decoded.exp * 1000;
  } catch {
    return null;
  }
}

export function useAuthSyncAcrossTabs() {
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const logout = useAuthStore((state) => state.logout);
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const isRefreshingRef = useRef(false);
  const didBootstrapRefreshRef = useRef(false);

  useEffect(() => {
    const onLogout = () => {
      logout();
      api8080Service.setAuthToken(null);
      apiService.setAuthToken(null);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY) return;

      if (!event.newValue) {
        onLogout();
        return;
      }

      try {
        const persisted = JSON.parse(event.newValue) as {
          state?: { token?: string | null; refreshToken?: string | null };
        };
        const nextToken = persisted.state?.token ?? null;
        const nextRefreshToken = persisted.state?.refreshToken ?? null;

        if (!nextToken) {
          onLogout();
          return;
        }

        setAuthSession({ accessToken: nextToken, refreshToken: nextRefreshToken });
        api8080Service.setAuthToken(nextToken);
        apiService.setAuthToken(nextToken);
      } catch {
        onLogout();
      }
    };

    window.addEventListener("logout", onLogout);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("logout", onLogout);
      window.removeEventListener("storage", onStorage);
    };
  }, [logout, setAuthSession]);

  useEffect(() => {
    if (!token || !refreshToken) return;

    const expMs = getTokenExpMs(token);
    if (!expMs) return;

    const triggerRefresh = () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      void (async () => {
        try {
          const response = await AuthService.refreshToken(refreshToken);
          if (!response.data.isSuccess || !response.data.data.accessToken) {
            onRefreshFailed();
            return;
          }

          const nextAccessToken = response.data.data.accessToken;
          const nextRefreshToken = response.data.data.refreshToken ?? null;

          setCookie("authToken", nextAccessToken, getAuthCookieConfig());
          setAuthSession({ accessToken: nextAccessToken, refreshToken: nextRefreshToken });
          api8080Service.setAuthToken(nextAccessToken);
          apiService.setAuthToken(nextAccessToken);
        } catch {
          onRefreshFailed();
        } finally {
          isRefreshingRef.current = false;
        }
      })();
    };

    const onRefreshFailed = () => {
      // ✅ Nếu refresh token đã không còn hợp lệ, logout ngay lập tức để tránh loop
      console.warn("[Auth] Refresh token is invalid or expired. Terminating session...");
      logout();
      api8080Service.setAuthToken(null);
      apiService.setAuthToken(null);
    };

    if (!didBootstrapRefreshRef.current) {
      didBootstrapRefreshRef.current = true;
      // Chỉ refresh ngay khi bootstrap nếu token sắp hết hạn (< REFRESH_BUFFER_MS còn lại)
      // Tránh gọi refresh vô ích mỗi lần F5 khi token vẫn còn hàng giờ hạn dùng
      const remainingMs = expMs - Date.now();
      if (remainingMs <= REFRESH_BUFFER_MS) {
        triggerRefresh();
      }
      return;
    }

    const delayMs = expMs - Date.now() - REFRESH_BUFFER_MS;

    if (delayMs <= 0) {
      triggerRefresh();
      return;
    }

    const timerId = window.setTimeout(() => {
      triggerRefresh();
    }, delayMs);

    return () => window.clearTimeout(timerId);
  }, [logout, refreshToken, setAuthSession, token]);

  useEffect(() => {
    if (token && refreshToken) return;
    didBootstrapRefreshRef.current = false;
    isRefreshingRef.current = false;
  }, [refreshToken, token]);
}
