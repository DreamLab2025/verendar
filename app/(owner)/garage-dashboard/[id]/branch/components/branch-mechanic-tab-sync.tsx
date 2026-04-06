"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { GARAGE_PORTAL_ROLE_MECHANIC, GARAGE_PORTAL_ROLE_OWNER } from "@/lib/auth/garage-portal-roles";
import { useAuthStore } from "@/lib/stores/auth-store";

import { branchDetailHref, parseBranchTab, roleClaimContainsMechanic } from "./branch-tab-config";

const EMPTY_ROLES: string[] = [];


export function BranchMechanicTabSync({ garageId, branchId }: { garageId: string; branchId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const roles = user?.role ?? EMPTY_ROLES;
  const mechanicBranchOnly =
    roles.includes(GARAGE_PORTAL_ROLE_MECHANIC) && !roles.includes(GARAGE_PORTAL_ROLE_OWNER);
  const canSeeRequires = roleClaimContainsMechanic(roles);
  const tab = parseBranchTab(searchParams.get("tab"));

  useEffect(() => {
    if (mechanicBranchOnly) {
      if (tab === "requires") return;
      router.replace(branchDetailHref(garageId, branchId, "requires"));
      return;
    }
    if (!canSeeRequires && tab === "requires") {
      router.replace(branchDetailHref(garageId, branchId, "overview"));
    }
  }, [mechanicBranchOnly, canSeeRequires, tab, garageId, branchId, router]);

  return null;
}
