"use client";

import * as React from "react";
import { Suspense, type ReactNode } from "react";
import { useParams } from "next/navigation";

import { getMockOwnerGarageById } from "@/lib/mocks/owner-garage-mock";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMyGarageQuery } from "@/hooks/useGarage";

import { GarageDashboardHeader } from "../components/garage-dashboard-header";
import { GarageSidebar } from "../components/garage-sidebar";
import { NavGarageMenu } from "../components/nav-garage-menu";

export default function GarageDashboardIdLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const garageId = typeof params?.id === "string" ? params.id : "";

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

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      className="min-h-dvh bg-background"
    >
      <Suspense fallback={null}>
        <GarageSidebar garageId={garageId} businessName={businessName} />
      </Suspense>
      <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <Suspense fallback={null}>
          <GarageDashboardHeader
            className="shrink-0"
            garageId={garageId}
            mobileActions={<NavGarageMenu garageId={garageId} />}
          />
        </Suspense>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
