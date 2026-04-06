"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, Calendar, ClipboardList, LayoutDashboard, Users, Wrench } from "lucide-react";

import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

import {
  BRANCH_TAB_LABELS,
  branchDetailHref,
  getVisibleBranchTabIds,
  parseBranchTab,
  type BranchTabId,
} from "./branch-tab-config";

const EMPTY_ROLES: string[] = [];

const TAB_ICONS: Record<BranchTabId, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  profile: Building2,
  staff: Users,
  services: Wrench,
  bookings: Calendar,
  requires: ClipboardList,
};

type BranchNavMenuBottomProps = {
  garageId: string;
  branchId: string;
};

export function BranchNavMenuBottom({ garageId, branchId }: BranchNavMenuBottomProps) {
  const searchParams = useSearchParams();
  const activeTab = parseBranchTab(searchParams.get("tab"));
  const user = useAuthStore((s) => s.user);
  const roles = user?.role ?? EMPTY_ROLES;
  const visibleTabs = getVisibleBranchTabIds(roles);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-md md:hidden"
      aria-label="Chi nhánh"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0 px-1">
        {visibleTabs.map((tab) => {
          const Icon = TAB_ICONS[tab];
          const href = branchDetailHref(garageId, branchId, tab);
          const active = activeTab === tab;
          const label = BRANCH_TAB_LABELS[tab];

          return (
            <li key={tab} className="min-w-0 flex-1">
              <Link
                href={href}
                className={cn(
                  "flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-[10px] leading-tight sm:text-xs",
                  active ? "font-semibold text-primary" : "font-medium text-muted-foreground",
                )}
              >
                <Icon className={cn("size-5 shrink-0", active ? "stroke-[2.25]" : "stroke-[1.75]")} aria-hidden />
                <span className="line-clamp-2 max-w-full text-center">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
