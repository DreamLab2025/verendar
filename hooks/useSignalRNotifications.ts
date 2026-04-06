"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getHubConnection } from "@/hubs/notificationHub";

export function useSignalRNotifications() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    const connection = getHubConnection();
    const onNotify = (message: string, title?: string) => {
      toast(title || "Thong bao", { description: message });
    };
    connection.on("ReceiveNotification", onNotify);
    return () => {
      connection.off("ReceiveNotification", onNotify);
    };
  }, [isAuthenticated]);
}
