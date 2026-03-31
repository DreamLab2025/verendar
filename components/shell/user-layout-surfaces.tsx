import type { ReactNode } from "react";

/**
 * Khung khu vực user: một `children` duy nhất (không double-mount).
 * - Dưới `lg`: cột dọc, cuộn dọc, nền gradient nhẹ (giống login).
 * - `lg`+: hàng 3 cột, overflow khóa như dashboard.
 */
export function UserLayoutSurfaces({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden p-3 pb-2 max-lg:overflow-x-clip sm:max-lg:p-4 lg:flex-row lg:bg-[#F9F8F6] lg:p-4">
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/10 via-background to-background max-lg:block lg:hidden dark:from-primary/15 dark:via-background dark:to-background"
        aria-hidden
      />
      <div className="relative z-1 flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 max-lg:gap-4 lg:flex-row lg:gap-4 lg:overflow-hidden">
        {children}
      </div>
    </div>
  );
}
