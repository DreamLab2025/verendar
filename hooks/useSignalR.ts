"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { startHubConnection, stopHubConnection } from "@/hubs/notificationHub";

export function useSignalR() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    startHubConnection().catch(() => undefined);
    return () => {
      stopHubConnection().catch(() => undefined);
    };
  }, [isAuthenticated]);
}
