"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Building2, LogOut, Menu, PanelLeft } from "lucide-react";

import { NotificationInboxPopover } from "@/components/shell/notification-inbox-popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useOwnerSessionLogout } from "@/hooks/useOwnerSessionLogout";
import { getInitialsFromDisplayName } from "@/lib/auth/read-auth-cookie-user";
import { GARAGE_PORTAL_ROLE_OWNER } from "@/lib/auth/garage-portal-roles";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

import { getGarageDashboardPageLabel } from "../garage-nav";

interface GarageDashboardHeaderProps {
  garageId: string;
  className?: string;
}

export function GarageDashboardHeader({ garageId, className }: GarageDashboardHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageLabel = getGarageDashboardPageLabel(pathname, garageId, searchParams);
  const { open, toggleSidebar } = useSidebar();
  const user = useAuthStore((s) => s.user);
  const roles = user?.role ?? [];
  const isGarageOwner = roles.includes(GARAGE_PORTAL_ROLE_OWNER);
  const initials = user
    ? getInitialsFromDisplayName(user.fullName?.trim() || user.email || "")
    : "?";
  const logout = useOwnerSessionLogout();

  return (
    <header
      className={cn(
        "flex h-14 min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-md md:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="hidden shrink-0 lg:inline-flex border-none hover:bg-white hover:text-foreground"
          onClick={toggleSidebar}
          aria-expanded={open}
          aria-label={open ? "Thu gọn sidebar (chỉ hiện biểu tượng)" : "Mở rộng sidebar"}
        >
          <PanelLeft className="size-4" />
        </Button>
        <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight">{pageLabel}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        <div
          className={cn(
            "[&_button]:size-10 [&_button]:md:size-11",
            "[&_button_svg]:size-5.5 md:[&_button_svg]:size-6",
          )}
        >
          <NotificationInboxPopover />
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 md:hidden">
          <div
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border/80 bg-primary/10 text-sm font-semibold text-primary"
            aria-label={user?.fullName?.trim() || user?.email || "Tài khoản"}
          >
            {initials}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="default"
                className="inline-flex size-10 shrink-0 rounded-full border-border/80 bg-primary/10 px-0 text-primary shadow-none hover:bg-primary/15"
                aria-label="Mở menu tài khoản"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <GarageDashboardAccountMenuItems isGarageOwner={isGarageOwner} onLogout={() => logout()} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function GarageDashboardAccountMenuItems({
  isGarageOwner,
  onLogout,
}: {
  isGarageOwner: boolean;
  onLogout: () => void;
}) {
  return (
    <>
      {isGarageOwner ? (
        <>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/garage" className="flex items-center gap-2">
              <Building2 className="size-4 shrink-0" aria-hidden />
              Garage của tôi
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      ) : null}
      <DropdownMenuItem
        className="cursor-pointer text-destructive focus:text-destructive"
        onClick={() => onLogout()}
      >
        <LogOut className="mr-2 size-4" />
        Đăng xuất
      </DropdownMenuItem>
    </>
  );
}
