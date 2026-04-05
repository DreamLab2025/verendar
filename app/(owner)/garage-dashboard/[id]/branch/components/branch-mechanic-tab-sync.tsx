"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { GARAGE_PORTAL_ROLE_MECHANIC, GARAGE_PORTAL_ROLE_OWNER } from "@/lib/auth/garage-portal-roles";
import { useAuthStore } from "@/lib/stores/auth-store";

import { branchDetailHref, parseBranchTab } from "./branch-tab-config";

/** Cùng reference mỗi lần — tránh `?? []` trong selector Zustand (gây getSnapshot / vòng lặp). */
const EMPTY_ROLES: string[] = [];

/** Gắn URL `?tab=requires` khi user là thợ máy (không phải chủ garage) mở tab khác. */
export function BranchMechanicTabSync({ garageId, branchId }: { garageId: string; branchId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const roles = user?.role ?? EMPTY_ROLES;
  const mechanicBranchOnly =
    roles.includes(GARAGE_PORTAL_ROLE_MECHANIC) && !roles.includes(GARAGE_PORTAL_ROLE_OWNER);
  const tab = parseBranchTab(searchParams.get("tab"));

  useEffect(() => {
    if (!mechanicBranchOnly) return;
    if (tab === "requires") return;
    router.replace(branchDetailHref(garageId, branchId, "requires"));
  }, [mechanicBranchOnly, tab, garageId, branchId, router]);

  return null;
}
