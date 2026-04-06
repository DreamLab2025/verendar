import type { Metadata } from "next";

import { GarageOwnerShell } from "../garage-dashboard/components/garage-owner-shell";

export const metadata: Metadata = {
  title: "Verendar - Quản lý Garage",
  description: "Quản lý garage và chi nhánh của bạn trên Verendar.",
};

export default function GarageOwnerLayout({ children }: { children: React.ReactNode }) {
  return <GarageOwnerShell>{children}</GarageOwnerShell>;
}
