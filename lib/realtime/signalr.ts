import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { store } from "@/lib/redux/store";

let connection: HubConnection | null = null;

function getHubUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL_API_GATEWAY || "http://localhost:8080/";
  return new URL("/hubs/notification", base).toString();
}

export function getHubConnection() {
  if (typeof window === "undefined") throw new Error("SignalR runs only on browser");
  if (connection) return connection;
  connection = new HubConnectionBuilder()
    .withUrl(getHubUrl(), {
      accessTokenFactory: () => store.getState().auth.token || "",
    })
    .withAutomaticReconnect()
    .configureLogging(process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Warning)
    .build();
  return connection;
}

export async function startHubConnection() {
  const conn = getHubConnection();
  if (conn.state === "Connected") return conn;
  await conn.start();
  return conn;
}

export async function stopHubConnection() {
  if (!connection) return;
  await connection.stop();
  connection = null;
}
