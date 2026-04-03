"use client";

import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout, refreshTokenAsync } from "@/lib/redux/slices/authSlice";

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
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const isRefreshingRef = useRef(false);
  const didBootstrapRefreshRef = useRef(false);

  useEffect(() => {
    const onLogout = () => dispatch(logout());
    window.addEventListener("logout", onLogout);
    return () => window.removeEventListener("logout", onLogout);
  }, [dispatch]);

  useEffect(() => {
    if (!token || !refreshToken) return;

    const expMs = getTokenExpMs(token);
    if (!expMs) return;

    const triggerRefresh = () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      void dispatch(refreshTokenAsync()).finally(() => {
        isRefreshingRef.current = false;
      });
    };

    if (!didBootstrapRefreshRef.current) {
      didBootstrapRefreshRef.current = true;
      triggerRefresh();
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
  }, [dispatch, refreshToken, token]);

  useEffect(() => {
    if (token && refreshToken) return;
    didBootstrapRefreshRef.current = false;
    isRefreshingRef.current = false;
  }, [refreshToken, token]);
}
