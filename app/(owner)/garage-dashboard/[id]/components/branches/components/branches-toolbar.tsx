"use client";

import { ChevronDown, Plus, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { GarageBranchStatus, GARAGE_BRANCH_STATUS_LABEL_VI } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

export type BranchesSortOrder = "default" | "desc" | "asc";

export interface BranchesToolbarProps {
  garageId: string;
  className?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortOrder: BranchesSortOrder;
  onSortOrderChange: (value: BranchesSortOrder) => void;
}

function statusFilterLabel(filter: string): string {
  if (filter === "") return "Tất cả trạng thái";
  if (filter === GarageBranchStatus.Active) return GARAGE_BRANCH_STATUS_LABEL_VI[GarageBranchStatus.Active];
  if (filter === GarageBranchStatus.Inactive) return GARAGE_BRANCH_STATUS_LABEL_VI[GarageBranchStatus.Inactive];
  if (filter === "Pending") return "Đang chờ duyệt";
  return filter;
}

function sortOrderLabel(order: BranchesSortOrder): string {
  if (order === "default") return "Sắp xếp mặc định";
  if (order === "desc") return "Giảm dần";
  return "Tăng dần";
}

export function BranchesToolbar({
  garageId,
  className,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
}: BranchesToolbarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex w-full flex-wrap items-center gap-2 pb-4">
        <div className="relative min-h-9 min-w-0 flex-1 basis-full sm:basis-[min(100%,20rem)]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, slug, địa chỉ…"
            className="pl-9"
            aria-label="Tìm chi nhánh"
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
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuItem onClick={() => onStatusFilterChange("")}>Tất cả</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange(GarageBranchStatus.Active)}>
              {GARAGE_BRANCH_STATUS_LABEL_VI[GarageBranchStatus.Active]}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange(GarageBranchStatus.Inactive)}>
              {GARAGE_BRANCH_STATUS_LABEL_VI[GarageBranchStatus.Inactive]}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange("Pending")}>Đang chờ duyệt</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="default"
              className="shrink-0 gap-1 px-3 font-normal"
              aria-label="Sắp xếp (isDescending)"
            >
              <span className="max-w-40 truncate sm:max-w-48">{sortOrderLabel(sortOrder)}</span>
              <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuItem onClick={() => onSortOrderChange("default")}>Mặc định</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortOrderChange("desc")}>Giảm dần</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortOrderChange("asc")}>Tăng dần</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button type="button" size="default" className="shrink-0 px-4" asChild>
          <Link href={`/garage/${garageId}/branches/new`}>
            <Plus className="size-4 shrink-0" aria-hidden /> Tạo chi nhánh
          </Link>
        </Button>
      </div>
      {/* Full-bleed vs p-4 md:p-6 của trang cha — chỉ separator kéo full ngang */}
      <div
        className="-mx-4 h-px bg-black/10 md:-mx-6 dark:bg-white/10"
        aria-hidden
      />
    </div>
  );
}
