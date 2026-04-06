"use client";

import { ChevronDown, RefreshCw, Search } from "lucide-react";

import { bookingStatusLabelVi } from "@/components/helper/booking-require";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Các giá trị `status` phổ biến từ API — đồng bộ với badge / chi tiết. */
const BOOKING_STATUS_FILTERS = [
  "",
  "Pending",
  "AwaitingConfirmation",
  "Confirmed",
  "InProgress",
  "Completed",
  "Cancelled",
] as const;

export type RequireBookingSortOrder = "default" | "desc" | "asc";

export interface RequireBookingToolbarProps {
  className?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortOrder: RequireBookingSortOrder;
  onSortOrderChange: (value: RequireBookingSortOrder) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function statusFilterLabel(filter: string): string {
  if (filter === "") return "Tất cả trạng thái";
  return bookingStatusLabelVi(filter);
}


export function RequireBookingToolbar({
  className,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  isRefreshing,
}: RequireBookingToolbarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex w-full flex-wrap items-center gap-2 pb-4">
        <div className="relative min-h-9 min-w-0 flex-1 basis-full sm:basis-[min(100%,20rem)]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo dịch vụ, chi nhánh…"
            className="pl-9"
            aria-label="Tìm lịch hẹn"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="default"
              className="shrink-0 gap-1 px-3 font-normal"
              aria-label="Lọc theo trạng thái"
            >
              <span className="max-w-40 truncate sm:max-w-48">{statusFilterLabel(statusFilter)}</span>
              <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-52 max-h-[min(24rem,70dvh)] overflow-y-auto">
            {BOOKING_STATUS_FILTERS.map((value) => (
              <DropdownMenuItem key={value || "all"} onClick={() => onStatusFilterChange(value)}>
                {value === "" ? "Tất cả" : bookingStatusLabelVi(value)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {onRefresh ? (
          <Button
            type="button"
            variant="outline"
            size="default"
            className="shrink-0 px-3"
            disabled={isRefreshing}
            onClick={() => onRefresh()}
            aria-label="Làm mới danh sách"
          >
            <RefreshCw className={cn("size-4 shrink-0", isRefreshing && "animate-spin")} aria-hidden />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        ) : null}
      </div>
      <div className="-mx-4 h-px bg-black/10 md:-mx-6 dark:bg-white/10" aria-hidden />
    </div>
  );
}
