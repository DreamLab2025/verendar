"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getCookie } from "cookies-next";
import { useEffect } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import apiService from "@/lib/api/apiService";
import api8080Service from "@/lib/api/api8080Service";

interface RootShellProps {
  children: ReactNode;
}

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

/** Route group `(owner)` — layout riêng trong `app/(owner)`, không bọc AppSidebar. */
function isOwnerAppRoute(pathname: string | null) {
  if (!pathname) return false;
  if (pathname === "/garage") return true;
  if (pathname === "/garage-dashboard" || pathname.startsWith("/garage-dashboard/")) return true;
  return false;
}

export function RootShell({ children }: RootShellProps) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  useEffect(() => {
    const token = (getCookie("authToken") as string | undefined) ?? (getCookie("auth-token") as string | undefined);
    if (!token) return;
    apiService.setAuthToken(token);
    api8080Service.setAuthToken(token);
  }, []);

  if (isAuthRoute || isOwnerAppRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="h-dvh overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-linear-to-b from-primary/10 via-primary/5 to-transparent" />
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/65 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="border border-border/60 bg-background/70 backdrop-blur-sm" />
            <div>
              <p className="bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-sm font-semibold text-transparent md:text-base">
                Verendar
              </p>
              <p className="text-xs text-muted-foreground">Quan ly xe thong minh</p>
            </div>
          </div>
          <Button size="sm" className="shadow-sm">
            Tao lich nhac
          </Button>
        </header>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
