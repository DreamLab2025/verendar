"use client";

import { ChevronDown, Plus, Search } from "lucide-react";
import { useState } from "react";

import { StaffBranchDialog } from "@/components/dialog/staff/StaffBranchDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  BRANCH_MEMBER_ROLE_LABEL_VI,
  BranchMemberRole,
} from "@/lib/api/services/fetchBranchMember";
import { cn } from "@/lib/utils";

export type StaffSortOrder = "default" | "desc" | "asc";

export interface StaffToolbarProps {
  garageId: string;
  branchId: string;
  className?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  sortOrder: StaffSortOrder;
  onSortOrderChange: (value: StaffSortOrder) => void;
}

function roleFilterLabel(filter: string): string {
  if (filter === "") return "Tất cả vai trò";
  if (filter === BranchMemberRole.Manager) return BRANCH_MEMBER_ROLE_LABEL_VI[BranchMemberRole.Manager];
  if (filter === BranchMemberRole.Mechanic) return BRANCH_MEMBER_ROLE_LABEL_VI[BranchMemberRole.Mechanic];
  return filter;
}

function sortOrderLabel(order: StaffSortOrder): string {
  if (order === "default") return "Sắp xếp mặc định";
  if (order === "desc") return "Giảm dần";
  return "Tăng dần";
}

export function StaffToolbar({
  garageId,
  branchId,
  className,
  searchValue,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  sortOrder,
  onSortOrderChange,
}: StaffToolbarProps) {
  const [addOpen, setAddOpen] = useState(false);
  const canAdd = Boolean(garageId && branchId);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex w-full flex-wrap items-center gap-2 pb-4">
        <div className="relative min-h-9 min-w-0 flex-1 basis-full sm:basis-[min(100%,20rem)]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại…"
            className="pl-9"
            aria-label="Tìm nhân viên"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="default"
              className="shrink-0 gap-1 px-3 font-normal"
              aria-label="Lọc theo vai trò"
            >
              <span className="max-w-40 truncate sm:max-w-48">{roleFilterLabel(roleFilter)}</span>
              <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuItem onClick={() => onRoleFilterChange("")}>Tất cả</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleFilterChange(BranchMemberRole.Manager)}>
              {BRANCH_MEMBER_ROLE_LABEL_VI[BranchMemberRole.Manager]}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleFilterChange(BranchMemberRole.Mechanic)}>
              {BRANCH_MEMBER_ROLE_LABEL_VI[BranchMemberRole.Mechanic]}
            </DropdownMenuItem>
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

        <Button
          type="button"
          size="default"
          className="shrink-0 px-4"
          disabled={!canAdd}
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4 shrink-0" aria-hidden /> Thêm nhân viên
        </Button>
      </div>
      <StaffBranchDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        garageId={garageId}
        branchId={branchId}
      />
      <div className="-mx-4 h-px bg-black/10 md:-mx-6 dark:bg-white/10" aria-hidden />
    </div>
  );
}
