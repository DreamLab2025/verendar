import type { ReactNode } from "react";
import { UserLayoutSurfaces } from "@/components/layout/user-layout-surfaces";

/**
 * Layout khu vực người dùng: nền root + `UserLayoutSurfaces` (một `children`, mobile/desktop chỉ khác CSS).
 * Trang home tách nhánh UI bằng `UserHomeMobileView` / `UserHomeDesktopView`.
 */
export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F9F8F6] dark:bg-neutral-950">
      <UserLayoutSurfaces>{children}</UserLayoutSurfaces>
    </div>
  );
}
