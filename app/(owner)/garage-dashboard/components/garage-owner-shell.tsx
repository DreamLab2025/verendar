"use client";

import type { ReactNode } from "react";
import { CarFront } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function GarageOwnerShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false} collapsible="offcanvas">
      <div className="flex h-dvh w-full overflow-hidden">
        <Sidebar collapsible="offcanvas" variant="sidebar">
          <SidebarHeader>
            <div className="flex items-center gap-3 px-1">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <CarFront className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Verendar</p>
                <p className="truncate text-xs text-muted-foreground">Hệ thống garage</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <Button type="button" className="w-full shadow-sm">
              Tạo garage
            </Button>
          </SidebarContent>
          <SidebarFooter className="mt-auto" />
        </Sidebar>
        <SidebarInset
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-linear-to-b from-background to-muted/25",
          )}
        >
          <SidebarTrigger
            className="fixed left-3 top-3 z-50 md:hidden"
            aria-label="Mở sidebar garage"
          />
          <div className="flex w-full min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-12 pt-14 md:px-6 md:pt-6">
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
