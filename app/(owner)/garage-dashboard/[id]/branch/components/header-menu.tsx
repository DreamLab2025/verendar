"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CarFront, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOwnerSessionLogout } from "@/hooks/useOwnerSessionLogout";
import { readAuthUserFromCookies } from "@/lib/auth/read-auth-cookie-user";
import { cn } from "@/lib/utils";

import {
  BRANCH_TAB_IDS,
  BRANCH_TAB_LABELS,
  branchDetailHref,
  garageDashboardHref,
  parseBranchTab,
  type BranchTabId,
} from "./branch-tab-config";

type BranchHeaderMenuProps = {
  garageId: string;
  branchId: string;
};

export function BranchHeaderMenu({ garageId, branchId }: BranchHeaderMenuProps) {
  const searchParams = useSearchParams();
  const activeTab = parseBranchTab(searchParams.get("tab"));
  const user = readAuthUserFromCookies();
  const logout = useOwnerSessionLogout();

  return (
    <header className="sticky top-0 z-40 hidden w-full shrink-0 border-b border-border/60 bg-background md:block">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <Link
          href={branchDetailHref(garageId, branchId, "overview")}
          className="flex min-w-0 shrink-0 items-center gap-2.5"
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <CarFront className="size-5" aria-hidden />
          </div>
          <span className="truncate text-lg font-semibold tracking-tight text-foreground lowercase">varender</span>
        </Link>

        <nav
          className="flex min-w-0 flex-1 items-end justify-center gap-1 overflow-x-auto sm:gap-3 lg:gap-6"
          aria-label="Chi nhánh"
        >
          {BRANCH_TAB_IDS.map((tab) => (
            <TabLink
              key={tab}
              garageId={garageId}
              branchId={branchId}
              tab={tab}
              active={activeTab === tab}
            />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="hidden rounded-full border-border/80 px-4 font-medium shadow-none lg:inline-flex"
            asChild
          >
            <Link href={garageDashboardHref(garageId)}>Chuyển sang garage</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="default"
            className="inline-flex rounded-full border-border/80 px-3 font-medium shadow-none lg:hidden"
            asChild
          >
            <Link href={garageDashboardHref(garageId)}>Garage</Link>
          </Button>

          <div
            className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-base font-semibold text-primary"
            aria-hidden
          >
            {user?.initials ?? "?"}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="default"
                className="size-11 shrink-0 rounded-full border-border/80"
                aria-label="Mở menu"
              >
                <Menu className="size-5" />
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
      </div>
    </header>
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
