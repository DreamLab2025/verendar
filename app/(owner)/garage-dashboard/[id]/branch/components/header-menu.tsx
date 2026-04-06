"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, LogOut, Menu } from "lucide-react";

import { NotificationInboxPopover } from "@/components/shell/notification-inbox-popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOwnerSessionLogout } from "@/hooks/useOwnerSessionLogout";
import { getInitialsFromDisplayName } from "@/lib/auth/read-auth-cookie-user";
import { GARAGE_PORTAL_ROLE_OWNER } from "@/lib/auth/garage-portal-roles";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

import {
  BRANCH_TAB_LABELS,
  branchDetailHref,
  garageDashboardHref,
  getVisibleBranchTabIds,
  parseBranchTab,
  type BranchTabId,
} from "./branch-tab-config";
import SafeImage from "@/components/ui/SafeImage";

type BranchHeaderMenuProps = {
  garageId: string;
  branchId: string;
};

const EMPTY_ROLES: string[] = [];

export function BranchHeaderMenu({ garageId, branchId }: BranchHeaderMenuProps) {
  const searchParams = useSearchParams();
  const activeTab = parseBranchTab(searchParams.get("tab"));
  const user = useAuthStore((s) => s.user);
  const roles = user?.role ?? EMPTY_ROLES;
  const isGarageOwner = roles.includes(GARAGE_PORTAL_ROLE_OWNER);
  const visibleTabs = getVisibleBranchTabIds(roles);
  const defaultBranchTab = visibleTabs.length === 1 && visibleTabs[0] === "requires" ? "requires" : "overview";
  const initials = user
    ? getInitialsFromDisplayName(user.fullName?.trim() || user.email || "")
    : "?";
  const logout = useOwnerSessionLogout();

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-border/60 bg-background">
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4 md:h-16 lg:px-8">
        <Link
          href={branchDetailHref(garageId, branchId, defaultBranchTab)}
          className="flex min-w-0 shrink-0 items-center justify-start"
        >
          <span className="relative block h-8 w-38">
            <SafeImage
              src="/logo.svg"
              alt="Verendar"
              fill
              className="object-cover object-left "
              priority
            />
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-end justify-center gap-1 overflow-x-auto sm:gap-3 md:flex lg:gap-6"
          aria-label="Chi nhánh"
        >
          {visibleTabs.map((tab) => (
            <TabLink
              key={tab}
              garageId={garageId}
              branchId={branchId}
              tab={tab}
              active={activeTab === tab}
            />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5 md:gap-2">
          <div
            className={cn(
              "[&_button]:size-10 [&_button]:md:size-11",
              "[&_button_svg]:size-5.5 md:[&_button_svg]:size-6",
            )}
          >
            <NotificationInboxPopover />
          </div>

          <div
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border/80 bg-primary/10 text-sm font-semibold text-primary md:size-11 md:text-base"
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
                className="inline-flex size-10 shrink-0 rounded-full border-border/80 bg-primary/10 px-0 text-primary shadow-none hover:bg-primary/15 md:size-11"
                aria-label="Mở menu tài khoản"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <BranchAccountMenuItems
                garageId={garageId}
                isGarageOwner={isGarageOwner}
                onLogout={() => logout()}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function BranchAccountMenuItems({
  garageId,
  isGarageOwner,
  onLogout,
}: {
  garageId: string;
  isGarageOwner: boolean;
  onLogout: () => void;
}) {
  return (
    <>
      {isGarageOwner ? (
        <>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={garageDashboardHref(garageId)} className="flex items-center gap-2">
              <Building2 className="size-4 shrink-0" aria-hidden />
              Chuyển về garage
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

function TabLink({
  garageId,
  branchId,
  tab,
  active,
}: {
  garageId: string;
  branchId: string;
  tab: BranchTabId;
  active: boolean;
}) {
  const href = branchDetailHref(garageId, branchId, tab);
  const label = BRANCH_TAB_LABELS[tab];

  return (
    <Link
      href={href}
      className={cn(
        "whitespace-nowrap border-b-2 px-1 pb-2.5 pt-2 text-sm transition-colors lg:px-2",
        active
          ? "border-foreground font-semibold text-foreground"
          : "border-transparent font-normal text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
