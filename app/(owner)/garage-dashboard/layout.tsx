import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verendar - Dashboard",
  description: "Bảng điều khiển quản lý garage trên Verendar.",
};

export default function GarageDashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
