"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice";
import { startHubConnection, stopHubConnection } from "@/hubs/notificationHub";

export function useSignalR() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    startHubConnection().catch(() => undefined);
    return () => {
      stopHubConnection().catch(() => undefined);
    };
  }, [isAuthenticated]);
}
