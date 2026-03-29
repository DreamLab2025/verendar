import type { ReactNode } from "react";

/**
 * Layout khu vực người dùng (dashboard xe): khung full chiều cao inset, nền & lưới 3 cột.
 * Root `app/layout.tsx` giữ fonts, Providers, RootShell — không đụng vào cấu trúc đó.
 */
export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-[#F9F8F6] dark:bg-neutral-950">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4">
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
