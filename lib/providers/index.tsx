"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/lib/providers/queryProvider";
import { ReduxProvider } from "@/lib/providers/reduxProvider";
import { SignalRProvider } from "@/lib/providers/signalRProvider";
import { useAuthSyncAcrossTabs } from "@/hooks/useAuthSyncAcrossTabs";

function AuthSyncProvider({ children }: { children: ReactNode }) {
  useAuthSyncAcrossTabs();
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SignalRProvider>
            <AuthSyncProvider>{children}</AuthSyncProvider>
          </SignalRProvider>
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
