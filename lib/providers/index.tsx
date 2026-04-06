"use client";

import type { ReactNode } from "react";
import { NotificationRealtimeBridge } from "@/components/shell/notification-realtime-bridge";
import { QueryProvider } from "@/lib/providers/queryProvider";
// import { SignalRProvider } from "@/lib/providers/signalRProvider";
import { useAuthSyncAcrossTabs } from "@/hooks/useAuthSyncAcrossTabs";

function AuthSyncProvider({ children }: { children: ReactNode }) {
  useAuthSyncAcrossTabs();
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {/* SignalR + toast + invalidate notifications — phải nằm ngoài RootShell vì /garage-dashboard bỏ qua RootShell */}
      <NotificationRealtimeBridge />
      {/* Temporarily avoid next-themes script injection in Next 16 client render */}
      {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange> */}
      {/* <SignalRProvider> */}
      <AuthSyncProvider>{children}</AuthSyncProvider>
      {/* </SignalRProvider> */}
      {/* </ThemeProvider> */}
    </QueryProvider>
  );
}
