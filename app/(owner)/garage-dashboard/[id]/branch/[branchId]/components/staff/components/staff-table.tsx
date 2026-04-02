"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useBranchMembersQuery, useUpdateBranchMemberStatus } from "@/hooks/useBranchMember";
import {
  BranchMemberStatus,
  getBranchMemberRoleLabelVi,
  getBranchMemberStatusLabelVi,
  type BranchMemberDto,
} from "@/lib/api/services/fetchBranchMember";

import { StaffTableSkeleton } from "./staff-table-skeleton";
import type { StaffSortOrder } from "./staff-toolbar";

function filterMembers(list: BranchMemberDto[], search: string, roleFilter: string): BranchMemberDto[] {
  let next = list;
  const q = search.trim().toLowerCase();
  if (q) {
    next = next.filter((m) => {
      const name = (m.fullName ?? "").toLowerCase();
      const email = (m.email ?? "").toLowerCase();
      const phone = (m.phoneNumber ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }
  const rf = roleFilter.trim();
  if (rf) {
    next = next.filter((m) => m.role === rf);
  }
  return next;
}

function memberStatusAllowsToggle(status: string): boolean {
  const s = status.trim();
  return s === BranchMemberStatus.Active || s === BranchMemberStatus.Inactive;
}

export interface StaffTableProps {
  garageId: string;
  branchId: string;
  search: string;
  roleFilter: string;
  sortOrder: StaffSortOrder;
}

export function StaffTable({ garageId, branchId, search, roleFilter, sortOrder }: StaffTableProps) {
  const isDescending = sortOrder === "default" ? undefined : sortOrder === "desc";

  const { mutate: updateStatus, isPending: isUpdatingStatus, variables: updateVars } =
    useUpdateBranchMemberStatus();

  const { data: res, isPending, isError, error, refetch } = useBranchMembersQuery(
    garageId || undefined,
    branchId || undefined,
    { PageNumber: 1, PageSize: 100, IsDescending: isDescending },
    Boolean(garageId && branchId),
  );

  const raw = useMemo(
    () => (res?.isSuccess && Array.isArray(res.data) ? res.data : []),
    [res],
  );
  const rows = useMemo(() => filterMembers(raw, search, roleFilter), [raw, search, roleFilter]);
  const rawCount = raw.length;
  const total = rows.length;

  if (isPending) {
    return <StaffTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <p className="text-destructive">{error?.message ?? "Không tải được danh sách nhân viên."}</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (!res?.isSuccess) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {res?.message ?? "Chưa có dữ liệu nhân viên."}
      </p>
    );
  }

  if (rawCount === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Chưa có nhân viên tại chi nhánh này.
      </p>
    );
  }

  if (total === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Không có nhân viên phù hợp bộ lọc.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Họ tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.fullName?.trim() || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{m.email?.trim() || "—"}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {m.phoneNumber?.trim() || "—"}
              </TableCell>
              <TableCell>{getBranchMemberRoleLabelVi(m.role)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-sm">{getBranchMemberStatusLabelVi(m.status)}</span>
                  {memberStatusAllowsToggle(m.status) ? (
                    <Switch
                      checked={m.status.trim() === BranchMemberStatus.Active}
                      disabled={isUpdatingStatus && updateVars?.memberId === m.id}
                      aria-label={
                        m.status.trim() === BranchMemberStatus.Active
                          ? "Chuyển sang ngưng hoạt động"
                          : "Chuyển sang đang hoạt động"
                      }
                      onCheckedChange={(checked) => {
                        updateStatus({
                          garageId,
                          memberId: m.id,
                          payload: {
                            status: checked ? BranchMemberStatus.Active : BranchMemberStatus.Inactive,
                          },
                        });
                      }}
                    />
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
