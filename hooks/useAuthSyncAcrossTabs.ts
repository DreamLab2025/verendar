"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/slices/authSlice";

export function useAuthSyncAcrossTabs() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onLogout = () => dispatch(logout());
    window.addEventListener("logout", onLogout);
    return () => window.removeEventListener("logout", onLogout);
  }, [dispatch]);
}
