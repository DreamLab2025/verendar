"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCookie } from "cookies-next";
import { useEffect } from "react";
import { Globe } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/shell/mobile-bottom-nav";
import { BookingCartHeaderButton } from "@/components/shell/booking-cart-header";
import { NotificationInboxPopover } from "@/components/shell/notification-inbox-popover";
import { NotificationRealtimeBridge } from "@/components/shell/notification-realtime-bridge";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import apiService from "@/lib/api/apiService";
import api8080Service from "@/lib/api/api8080Service";

interface RootShellProps {
  children: ReactNode;
}

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export function RootShell({ children }: RootShellProps) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  useEffect(() => {
    const token = (getCookie("authToken") as string | undefined) ?? (getCookie("auth-token") as string | undefined);
    if (!token) return;
    apiService.setAuthToken(token);
    api8080Service.setAuthToken(token);
  }, []);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen>
      <NotificationRealtimeBridge />
      <AppSidebar />
      <SidebarInset className="h-dvh overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-linear-to-b from-primary/10 via-primary/5 to-transparent" />
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-3 backdrop-blur-xl supports-backdrop-filter:bg-background/70 md:h-16 md:border-border/60 md:bg-background/65 md:px-6 md:supports-backdrop-filter:bg-background/65">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="hidden border border-border/60 bg-background/70 backdrop-blur-sm md:inline-flex" />
            <div className="min-w-0">
              <p className="truncate bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-[15px] font-bold text-transparent tracking-tight md:text-base md:font-semibold">
                Verendar
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">Quan ly xe thong minh</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <BookingCartHeaderButton />
            <NotificationInboxPopover />
            <Button variant="ghost" size="icon" className="size-10 rounded-full md:size-9" asChild>
              <Link href="/settings" aria-label="Ngôn ngữ và cài đặt">
                <Globe className="size-[1.35rem] md:size-5" aria-hidden />
              </Link>
            </Button>
          </div>
        </header>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </div>
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
