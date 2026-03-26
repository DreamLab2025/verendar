import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";

type HubCallback = (...args: unknown[]) => void;

class NotificationHubService {
  private connection: HubConnection | null = null;
  private isConnecting = false;

  private getHubUrl() {
    const base = process.env.NEXT_PUBLIC_API_URL_API_GATEWAY || "http://localhost:8080/";
    return new URL("/hubs/notification", base).toString();
  }

  private ensureConnection(token: string) {
    if (this.connection) return this.connection;

    this.connection = new HubConnectionBuilder()
      .withUrl(this.getHubUrl(), {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Warning)
      .build();

    return this.connection;
  }

  async startConnection(token: string, callback?: HubCallback): Promise<boolean> {
    if (!token) return false;

    const conn = this.ensureConnection(token);
    if (conn.state === HubConnectionState.Connected) {
      if (callback) conn.on("Notification", callback);
      return true;
    }

    if (this.isConnecting) return false;

    try {
      this.isConnecting = true;
      await conn.start();
      if (callback) conn.on("Notification", callback);
      return true;
    } catch {
      return false;
    } finally {
      this.isConnecting = false;
    }
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
    return {
      connection: this.connection,
      isConnected: this.connection?.state === HubConnectionState.Connected,
      isConnecting: this.isConnecting,
    };
  }
}

const notificationHubService = new NotificationHubService();
export default notificationHubService;
