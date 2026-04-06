"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import {
  getGarageDashboardNavItems,
  isGarageDashboardNavItemActive,
} from "../garage-nav";

type GarageDashboardNavBottomProps = {
  garageId: string;
};

/** Chỉ hiển thị dưới `md` — đi cặp với `useMobile` / padding nội dung trong layout. */
export function GarageDashboardNavBottom({ garageId }: GarageDashboardNavBottomProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = getGarageDashboardNavItems(garageId);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-md md:hidden"
      aria-label="Garage dashboard"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0 px-1">
        {items.map(({ title: label, href, icon: Icon, tab }) => {
          const active = isGarageDashboardNavItemActive(pathname, garageId, searchParams, tab);

          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                className={cn(
                  "flex min-h-13 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-[10px] leading-tight sm:text-xs",
                  active ? "font-semibold text-primary" : "font-medium text-muted-foreground",
                )}
              >
                <Icon className={cn("size-5 shrink-0", active ? "stroke-[2.25]" : "stroke-[1.75]")} aria-hidden />
                <span className="line-clamp-2 max-w-full text-center">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
