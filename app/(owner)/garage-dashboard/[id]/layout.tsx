"use client";

import * as React from "react";
import { Suspense, type ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";

import { getMockOwnerGarageById } from "@/lib/mocks/owner-garage-mock";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMyGarageQuery } from "@/hooks/useGarage";

import { GarageDashboardHeader } from "../components/garage-dashboard-header";
import { GarageDashboardNavBottom } from "../components/garage-dashboard-nav-bottom";
import { GarageSidebar } from "../components/garage-sidebar";

export default function GarageDashboardIdLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const garageId = typeof params?.id === "string" ? params.id : "";

  const isBranchRoute =
    Boolean(garageId) && Boolean(pathname?.includes(`/garage-dashboard/${garageId}/branch`));

  const { data: meRes } = useMyGarageQuery(Boolean(garageId));

  const businessName = React.useMemo(() => {
    const apiGarage = meRes?.isSuccess ? meRes.data : null;
    if (apiGarage && apiGarage.id === garageId) {
      const name = apiGarage.businessName?.trim();
      if (name) return name;
    }
    return getMockOwnerGarageById(garageId)?.businessName ?? "Garage";
  }, [meRes, garageId]);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  if (isBranchRoute) {
    return (
      <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-background">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    );
  }

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      className="h-dvh max-h-dvh min-h-0 overflow-hidden bg-background"
    >
      <Suspense fallback={null}>
        <GarageSidebar garageId={garageId} businessName={businessName} />
      </Suspense>
      <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <Suspense fallback={null}>
          <GarageDashboardHeader className="shrink-0" garageId={garageId} />
        </Suspense>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </div>
        <Suspense fallback={null}>
          <GarageDashboardNavBottom garageId={garageId} />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
