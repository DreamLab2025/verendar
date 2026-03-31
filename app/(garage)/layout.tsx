import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verendar - Tạo chi nhánh",
  description: "Tạo chi nhánh mới cho garage trên Verendar.",
};

export default function GarageNewBranchLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-background">{children}</div>;
}
