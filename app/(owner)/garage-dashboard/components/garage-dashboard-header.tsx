"use client";

import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { getGarageDashboardPageLabel } from "../garage-nav";

interface GarageDashboardHeaderProps {
  garageId: string;
  mobileActions?: ReactNode;
  className?: string;
}

export function GarageDashboardHeader({
  garageId,
  mobileActions,
  className,
}: GarageDashboardHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageLabel = getGarageDashboardPageLabel(pathname, garageId, searchParams);
  const { open, toggleSidebar } = useSidebar();

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
      {mobileActions ? <div className="shrink-0 lg:hidden">{mobileActions}</div> : null}
    </header>
  );
}
