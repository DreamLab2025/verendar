export const BRANCH_TAB_IDS = ["overview", "profile", "staff", "services", "bookings"] as const;
export type BranchTabId = (typeof BRANCH_TAB_IDS)[number];

export const BRANCH_TAB_LABELS: Record<BranchTabId, string> = {
  overview: "Tổng quan",
  profile: "Hồ sơ chi nhánh",
  staff: "Nhân viên",
  services: "Dịch vụ",
  bookings: "Đặt lịch",
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
