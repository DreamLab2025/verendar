"use client";

import { useNotificationListener } from "@/hooks/useNotification";

/** Gắn SignalR (toast + invalidate React Query) khi có JWT — đặt trong shell, không render UI. */
export function NotificationRealtimeBridge() {
  useNotificationListener();
  return null;
}
