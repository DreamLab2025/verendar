import {
  GARAGE_PORTAL_ROLE_MECHANIC,
  GARAGE_PORTAL_ROLE_OWNER,
} from "@/lib/auth/garage-portal-roles";

export const BRANCH_TAB_IDS = ["overview", "profile", "staff", "services", "bookings", "requires"] as const;
export type BranchTabId = (typeof BRANCH_TAB_IDS)[number];

export const BRANCH_TAB_LABELS: Record<BranchTabId, string> = {
  overview: "Tổng quan",
  profile: "Hồ sơ chi nhánh",
  staff: "Nhân viên",
  services: "Dịch vụ",
  bookings: "Đặt lịch",
  requires: "Yêu cầu",
};

/** Tab cũ `products` đã gộp vào Dịch vụ — chuyển hướng URL bookmark. */
export function parseBranchTab(raw: string | null | undefined): BranchTabId {
  if (raw === "products") return "services";
  if (raw && (BRANCH_TAB_IDS as readonly string[]).includes(raw)) return raw as BranchTabId;
  return "overview";
}

export function branchDetailHref(garageId: string, branchId: string, tab: BranchTabId): string {
  const u = new URLSearchParams();
  u.set("tab", tab);
  return `/garage-dashboard/${garageId}/branch/${branchId}?${u.toString()}`;
}

export function garageDashboardHref(garageId: string): string {
  return `/garage-dashboard/${garageId}?tab=overview`;
}

/** Claim có chứa chuỗi Mechanic (đồng bộ claim BE). */
export function roleClaimContainsMechanic(roles: string[]): boolean {
  return roles.some((r) => String(r).includes(GARAGE_PORTAL_ROLE_MECHANIC));
}

export function getVisibleBranchTabIds(roles: string[]): BranchTabId[] {
  if (roles.includes(GARAGE_PORTAL_ROLE_MECHANIC) && !roles.includes(GARAGE_PORTAL_ROLE_OWNER)) {
    return ["requires"];
  }
  const showRequires = roleClaimContainsMechanic(roles);
  return BRANCH_TAB_IDS.filter((id) => id !== "requires" || showRequires);
}
