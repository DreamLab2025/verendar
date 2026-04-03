"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, CarFront, HomeIcon, LayoutDashboard, LogOut, MessageSquare, Settings, Users } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const USER_ITEMS = [
  { href: "/", label: "Xe", icon: CarFront, match: (p: string) => p === "/" || p.startsWith("/vehicle/") },
  { href: "/user/garage", label: "Garage", icon: HomeIcon, match: (p: string) => p.startsWith("/user/garage") },
  { href: "/notifications", label: "Nhắc", icon: CalendarClock, match: (p: string) => p.startsWith("/notifications") },
  { href: "/settings", label: "Cài đặt", icon: Settings, match: (p: string) => p.startsWith("/settings") },
];

const ADMIN_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p.startsWith("/admin/dashboard") },
  { href: "/admin/users", label: "Người dùng", icon: Users, match: (p: string) => p.startsWith("/admin/users") },
  { href: "/admin/feedback", label: "Phản hồi", icon: MessageSquare, match: (p: string) => p.startsWith("/admin/feedback") },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = pathname.startsWith("/admin");
  const items = isAdmin ? ADMIN_ITEMS : USER_ITEMS;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-background/90 px-1 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-background/80 md:hidden"
      aria-label="Điều hướng chính"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0">
        {items.map(({ href, label, icon: Icon, match }) => {
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

        {/* Profile / Logout Menu (Chỉ dành cho Admin) */}
        {isAdmin && (
          <li className="min-w-0 flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex h-full w-full min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium transition-colors touch-manipulation",
                    pathname.startsWith("/settings") ? "text-primary" : "text-muted-foreground active:bg-muted/60",
                  )}
                >
                  <Avatar className="size-6 shrink-0">
                    <AvatarImage src={user?.avatarUrl} alt={user?.userName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-bold">
                      {user?.userName?.slice(0, 2).toUpperCase() || "AD"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-full truncate">Tài khoản</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" sideOffset={10} className="w-48 p-2">
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => logout()}
                >
                  <LogOut className="mr-2 size-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        )}
      </ul>
    </nav>
  );
}
