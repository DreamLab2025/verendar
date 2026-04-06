"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { GarageDialog } from "@/components/dialog/garage/GarageDialog";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { GarageOwnerShellMobileHeader } from "./garage-owner-shell-mobile-header";
import { getGaragePortalViewFromRoles } from "@/lib/auth/garage-portal-roles";
import { readAuthRolesFromCookies } from "@/lib/auth/read-auth-cookie-user";
import { cn } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";

export function GarageOwnerShell({ children }: { children: ReactNode }) {
  const branchStaffOnly = useMemo(() => {
    const roles = readAuthRolesFromCookies();
    return getGaragePortalViewFromRoles(roles) === "branchStaff";
  }, []);

  if (branchStaffOnly) {
    return (
      <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-background">
        <div className="flex w-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-12 pt-14 md:px-6 md:pt-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Chi nhánh</h1>
            <p className="text-sm text-muted-foreground md:text-base">Thông tin chi nhánh bạn đang làm việc.</p>
          </header>
          {children}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      defaultOpen={false}
      collapsible="offcanvas"
      className="h-dvh max-h-dvh min-h-0 overflow-hidden bg-background"
    >
      <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
        <Sidebar collapsible="offcanvas" variant="sidebar">
          <SidebarHeader>
            <div className="flex min-w-0 items-center gap-3 px-1">
              <div className="relative size-8 shrink-0 overflow-hidden rounded-xl">
                <SafeImage
                  src="/icon.svg"
                  alt="Verendar"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Verendar</p>
                <p className="truncate text-xs text-muted-foreground">Hệ thống garage</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <GarageDialog>
              <Button type="button" className="w-full shadow-sm">
                Tạo garage
              </Button>
            </GarageDialog>
          </SidebarContent>
          <SidebarFooter className="mt-auto" />
        </Sidebar>
        <SidebarInset
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-linear-to-b from-background to-muted/25",
          )}
        >
          <div className="md:hidden">
            <GarageOwnerShellMobileHeader />
          </div>
          <div className="flex w-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-12 pt-4 md:px-6 md:pt-6">
            <header className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Quản lý garage</h1>
              <p className="text-sm text-muted-foreground md:text-base">Quản lý garage và chi nhánh của bạn.</p>
            </header>
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
