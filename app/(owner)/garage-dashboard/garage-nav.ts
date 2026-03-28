import type { LucideIcon } from "lucide-react";
import { Building2, LayoutDashboard, Settings } from "lucide-react";

export type GarageDashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact: boolean;
};

export function getGarageDashboardNavItems(garageId: string): GarageDashboardNavItem[] {
  const root = `/garage-dashboard/${garageId}`;
  return [
    { title: "Tổng quan", href: root, icon: LayoutDashboard, exact: true },
    {
      title: "Chi nhánh",
      href: `${root}/components/branches`,
      icon: Building2,
      exact: false,
    },
    {
      title: "Cài đặt",
      href: `${root}/components/settings`,
      icon: Settings,
      exact: false,
    },
  ];
}

export function isGarageDashboardNavActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Tiêu đề header theo route hiện tại. */
export function getGarageDashboardPageLabel(pathname: string, garageId: string): string {
  const root = `/garage-dashboard/${garageId}`.replace(/\/$/, "");
  const path = pathname.replace(/\/$/, "") || pathname;
  if (path === root) return "Dashboard";
  if (path.startsWith(`${root}/components/branches`)) return "Chi nhánh";
  if (path.startsWith(`${root}/components/settings`)) return "Cài đặt";
  return "Dashboard";
}
