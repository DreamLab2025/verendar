import type { ReadonlyURLSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Building2, IdCard, LayoutDashboard, Settings } from "lucide-react";

export type GarageDashboardTab = "overview" | "garage-info" | "branches" | "settings";

export type GarageDashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  tab: GarageDashboardTab;
};

function garageBasePath(garageId: string) {
  return `/garage-dashboard/${garageId}`.replace(/\/$/, "");
}

export function getGarageDashboardNavItems(garageId: string): GarageDashboardNavItem[] {
  const base = garageBasePath(garageId);
  return [
    { title: "Tổng quan", href: `${base}?tab=overview`, icon: LayoutDashboard, tab: "overview" },
    { title: "Thông tin garage", href: `${base}?tab=garage-info`, icon: IdCard, tab: "garage-info" },
    { title: "Chi nhánh", href: `${base}?tab=branches`, icon: Building2, tab: "branches" },
    { title: "Cài đặt", href: `${base}?tab=settings`, icon: Settings, tab: "settings" },
  ];
}

export function getGarageDashboardActiveTab(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): GarageDashboardTab {
  const t = searchParams.get("tab");
  if (t === "garage-info" || t === "branches" || t === "settings") return t;
  return "overview";
}

export function isGarageDashboardNavItemActive(
  pathname: string,
  garageId: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  itemTab: GarageDashboardTab,
): boolean {
  if (pathname.replace(/\/$/, "") !== garageBasePath(garageId)) return false;
  return getGarageDashboardActiveTab(searchParams) === itemTab;
}

/** Tiêu đề header theo route hiện tại. */
export function getGarageDashboardPageLabel(
  pathname: string,
  garageId: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): string {
  const path = pathname.replace(/\/$/, "") || pathname;
  if (path !== garageBasePath(garageId)) return "Dashboard";

  const tab = getGarageDashboardActiveTab(searchParams);
  if (tab === "garage-info") return "Thông tin garage";
  if (tab === "branches") return "Chi nhánh";
  if (tab === "settings") return "Cài đặt";
  return "Dashboard";
}
