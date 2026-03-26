"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice";
import { getHubConnection } from "@/lib/realtime/signalr";

export function useSignalRNotifications() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

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
