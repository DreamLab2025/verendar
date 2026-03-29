"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, CarFront, HomeIcon, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS: { href: string; label: string; icon: typeof CarFront; match: (p: string) => boolean }[] = [
  { href: "/", label: "Xe", icon: CarFront, match: (p) => p === "/" || p.startsWith("/vehicle/") },
  { href: "/user/dashboard", label: "Garage", icon: HomeIcon, match: (p) => p.startsWith("/user/dashboard") },
  { href: "/notifications", label: "Nhắc", icon: CalendarClock, match: (p) => p.startsWith("/notifications") },
  { href: "/settings", label: "Cài đặt", icon: Settings, match: (p) => p.startsWith("/settings") },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-background/90 px-1 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-background/80 md:hidden"
      aria-label="Điều hướng chính"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0">
        {ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                className={cn(
                  "flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium transition-colors touch-manipulation",
                  active ? "text-primary" : "text-muted-foreground active:bg-muted/60",
                )}
              >
                <Icon className={cn("size-5 shrink-0", active && "text-primary")} aria-hidden />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
