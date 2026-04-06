"use client";

import { useMemo } from "react";

import { readAuthRolesFromCookies } from "@/lib/auth/read-auth-cookie-user";
import { getGaragePortalViewFromRoles } from "@/lib/auth/garage-portal-roles";

import GarageOwnerBranchesSectionPage from "./components/branches/page";
import GarageOwnerGarageSectionPage from "./components/garage/page";
import StaffMyBranch from "./components/branches/components/staff-my-branch";

export default function OwnerGaragePage() {
  const view = useMemo(() => getGaragePortalViewFromRoles(readAuthRolesFromCookies()), []);

  if (view === "branchStaff") {
    return (
      <div className="flex w-full flex-col gap-6">
        <StaffMyBranch />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <GarageOwnerGarageSectionPage />
      <GarageOwnerBranchesSectionPage />
    </div>
  );
}
