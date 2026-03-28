"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";

import { getMockOwnerGarageById } from "@/lib/mocks/owner-garage-mock";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { GarageDashboardHeader } from "../components/garage-dashboard-header";
import { GarageSidebar } from "../components/garage-sidebar";
import { NavGarageMenu } from "../components/nav-garage-menu";

export default function GarageDashboardIdLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const garageId = typeof params?.id === "string" ? params.id : "";

  const garage = getMockOwnerGarageById(garageId);
  const garageName = garage?.businessName ?? "Garage";
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      className="min-h-dvh bg-background"
    >
      <GarageSidebar garageId={garageId} garageName={garageName} />
      <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <GarageDashboardHeader
          className="shrink-0"
          garageId={garageId}
          mobileActions={<NavGarageMenu garageId={garageId} />}
        />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
