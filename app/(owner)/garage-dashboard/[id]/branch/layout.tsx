"use client";

import { Suspense, type ReactNode } from "react";
import { useParams } from "next/navigation";

import { BranchMechanicTabSync } from "./components/branch-mechanic-tab-sync";
import { BranchHeaderMenu } from "./components/header-menu";
import { BranchNavMenuBottom } from "./components/nav-menu-bottom";

/** Không dùng sidebar — shell chi nhánh (header desktop + bottom nav mobile). */
export default function GarageDashboardBranchLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const garageId = typeof params?.id === "string" ? params.id : "";
  const branchId = typeof params?.branchId === "string" ? params.branchId : "";

  if (!garageId || !branchId) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">{children}</div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      <Suspense fallback={null}>
        <BranchMechanicTabSync garageId={garageId} branchId={branchId} />
        <BranchHeaderMenu garageId={garageId} branchId={branchId} />
      </Suspense>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>

      <Suspense fallback={null}>
        <BranchNavMenuBottom garageId={garageId} branchId={branchId} />
      </Suspense>
    </div>
  );
}
