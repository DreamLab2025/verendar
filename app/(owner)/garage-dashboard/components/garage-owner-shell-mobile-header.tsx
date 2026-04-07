"use client";

import { CarFront, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOwnerSessionLogout } from "@/hooks/useOwnerSessionLogout";
import { getInitialsFromDisplayName } from "@/lib/auth/read-auth-cookie-user";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

import { GarageOwnerShellPrimaryAction } from "./garage-owner-shell-primary-action";

export function GarageOwnerShellMobileHeader() {
  const user = useAuthStore((s) => s.user);
  const initials = user
    ? getInitialsFromDisplayName(user.fullName?.trim() || user.email || "")
    : "?";
  const logout = useOwnerSessionLogout();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 min-h-14 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background/95 px-3 backdrop-blur-md",
      )}
    >
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary" aria-hidden>
        <CarFront className="size-5" />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-1.5">
        <GarageOwnerShellPrimaryAction
          variant="outline"
          size="sm"
          className="h-9 shrink-0 px-3 text-xs font-medium shadow-sm sm:text-sm"
        />

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
              aria-label="Mở menu"
            >
              <Menu className="size-5" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 size-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
