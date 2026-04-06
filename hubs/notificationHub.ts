"use client";

import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { useEffect, useMemo, useState } from "react";

import { isAccessTokenValid, useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/lib/stores/auth-store";

// —— URL (env + mặc định `/hubs/notifications`) ——————————————————————

const DEFAULT_HUB_PATH = "/hubs/notifications";

export function getNotificationHubPath(): string {
  const p = process.env.NEXT_PUBLIC_SIGNALR_NOTIFICATION_HUB_PATH?.trim();
  if (!p) return DEFAULT_HUB_PATH;
  return p.startsWith("/") ? p : `/${p}`;
}

export function getNotificationHubUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL_API_GATEWAY || "http://localhost:8080/";
  return new URL(getNotificationHubPath(), base).toString();
}

// —— Singleton dùng JWT (`useNotificationListener`) ————————————————————

type HubCallback = (...args: unknown[]) => void;

class NotificationHubService {
  private connection: HubConnection | null = null;
  private isConnecting = false;

  private ensureConnection() {
    if (this.connection) return this.connection;

    this.connection = new HubConnectionBuilder()
      .withUrl(getNotificationHubUrl(), {
        // Always resolve latest token to avoid stale token closure after refresh.
        accessTokenFactory: () => useAuthStore.getState().token || "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    return this.connection;
  }

  /** Chỉ bật kết nối — không đăng ký handler (tránh trùng handler khi async race / Strict Mode). Handler gọi `on("Notification", cb)` sau khi await. */
  async startConnection(token?: string | null): Promise<boolean> {
    const effectiveToken = token ?? useAuthStore.getState().token;
    if (!effectiveToken) return false;

    const conn = this.ensureConnection();
    if (conn.state === HubConnectionState.Connected) {
      return true;
    }

    if (this.isConnecting) return false;

    try {
      this.isConnecting = true;
      await conn.start();
      return true;
    } catch {
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  /** Gỡ mọi listener method `Notification` (một hub chỉ một subscriber UI). */
  offAllNotifications() {
    this.connection?.off("Notification");
  }

  async stopConnection(): Promise<void> {
    if (!this.connection) return;
    if (this.connection.state !== HubConnectionState.Disconnected) {
      await this.connection.stop();
    }
    this.connection = null;
    this.isConnecting = false;
  }

  on(methodName: string, callback: HubCallback) {
    this.connection?.on(methodName, callback);
  }

  off(methodName: string, callback: HubCallback) {
    this.connection?.off(methodName, callback);
  }

  getConnectionState() {
    const state = this.connection?.state ?? HubConnectionState.Disconnected;
    return {
      connection: this.connection,
      signalRState: state,
      isConnected: state === HubConnectionState.Connected,
      isConnecting:
        this.isConnecting ||
        state === HubConnectionState.Connecting ||
        state === HubConnectionState.Reconnecting,
    };
  }
}

const notificationHubService = new NotificationHubService();
export default notificationHubService;

// —— UI trạng thái kết nối (trang /notifications) ——————————————————————

export type NotificationHubUiStatus = "no_auth" | "offline" | "connecting" | "live" | "reconnecting";

export function useNotificationHubConnection() {
  const { resolvedAccessToken: accessToken } = useAuth();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    void tick;
    if (!accessToken || !isAccessTokenValid(accessToken)) {
      return {
        status: "no_auth" as NotificationHubUiStatus,
        label: "Chưa đăng nhập",
        detail: "Đăng nhập để nhận thông báo đẩy qua SignalR.",
      };
    }

    const { signalRState } = notificationHubService.getConnectionState();

    switch (signalRState) {
      case HubConnectionState.Connected:
        return {
          status: "live" as NotificationHubUiStatus,
          label: "Realtime đã kết nối",
          detail: "Có tin mới sẽ toast và làm mới danh sách (REST).",
        };
      case HubConnectionState.Connecting:
        return {
          status: "connecting" as NotificationHubUiStatus,
          label: "Đang kết nối realtime…",
          detail: `Hub ${getNotificationHubPath()} — danh sách vẫn lấy từ API.`,
        };
      case HubConnectionState.Reconnecting:
        return {
          status: "reconnecting" as NotificationHubUiStatus,
          label: "Đang kết nối lại…",
          detail: "Giữ tab mở; danh sách có thể cập nhật chậm hơn.",
        };
      case HubConnectionState.Disconnecting:
        return {
          status: "connecting" as NotificationHubUiStatus,
          label: "Đang ngắt kết nối…",
          detail: "",
        };
      default:
        return {
          status: "offline" as NotificationHubUiStatus,
          label: "Realtime chưa kết nối",
          detail: "Badge vẫn có thể cập nhật theo chu kỳ (30s). Tin mới sẽ hiện khi hub kết nối lại.",
        };
    }
  }, [accessToken, tick]);
}

// —— Legacy Redux token (SignalRProvider / useSignalR*) ———————————————————

let reduxHubConnection: HubConnection | null = null;

export function getHubConnection() {
  if (typeof window === "undefined") throw new Error("SignalR runs only on browser");
  if (reduxHubConnection) return reduxHubConnection;
  reduxHubConnection = new HubConnectionBuilder()
    .withUrl(getNotificationHubUrl(), {
      accessTokenFactory: () => useAuthStore.getState().token || "",
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.None)
    .build();
  return reduxHubConnection;
}

export async function startHubConnection() {
  const conn = getHubConnection();
  if (conn.state === HubConnectionState.Connected) return conn;
  await conn.start();
  return conn;
}

export async function stopHubConnection() {
  if (!reduxHubConnection) return;
  await reduxHubConnection.stop();
  reduxHubConnection = null;
}
