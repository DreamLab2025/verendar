"use client";

import { KeyRound, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { StaffMemberPasswordDialog } from "@/components/dialog/staff/StaffMemberPasswordDialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useBranchMembersQuery,
  useDeleteBranchMember,
  useUpdateBranchMemberStatus,
} from "@/hooks/useBranchMember";
import { BranchMemberStatus, getBranchMemberRoleLabelVi, type BranchMemberDto } from "@/lib/api/services/fetchBranchMember";

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
  const [passwordMember, setPasswordMember] = useState<BranchMemberDto | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<BranchMemberDto | null>(null);

  const { mutate: updateStatus, isPending: isUpdatingStatus, variables: updateVars } =
    useUpdateBranchMemberStatus();
  const { mutate: deleteMember, isPending: isDeletingMember, variables: deleteVars } =
    useDeleteBranchMember();

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
    <TooltipProvider delayDuration={300}>
      <StaffMemberPasswordDialog
        open={passwordMember != null}
        onOpenChange={(open) => {
          if (!open) setPasswordMember(null);
        }}
        garageId={garageId}
        memberId={passwordMember?.id ?? null}
        memberName={passwordMember?.fullName ?? null}
      />

      <AlertDialog
        open={memberToDelete != null}
        onOpenChange={(open) => {
          if (!open) setMemberToDelete(null);
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhân viên?</AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              {memberToDelete
                ? `Hành động này sẽ gỡ ${memberToDelete.fullName?.trim() || "nhân viên"} khỏi chi nhánh. Bạn có chắc chắn?`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Hủy</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletingMember}
              onClick={() => {
                if (!memberToDelete) return;
                const id = memberToDelete.id;
                deleteMember(
                  { garageId, memberId: id },
                  {
                    onSuccess: () => {
                      setMemberToDelete(null);
                      setPasswordMember((prev) => (prev?.id === id ? null : prev));
                    },
                  },
                );
              }}
            >
              Xóa
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead className="w-[1%] min-w-48 text-center">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => {
              const isActive = m.status.trim() === BranchMemberStatus.Active;
              const statusTooltip = isActive ? "Ngưng hoạt động" : "Kích hoạt";
              const statusAriaLabel = statusTooltip;

              return (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.fullName?.trim() || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{m.email?.trim() || "—"}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {m.phoneNumber?.trim() || "—"}
                  </TableCell>
                  <TableCell>{getBranchMemberRoleLabelVi(m.role)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                      {memberStatusAllowsToggle(m.status) ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className={cn(
                                "shrink-0",
                                isActive &&
                                  "border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300",
                                !isActive && "text-muted-foreground",
                              )}
                              disabled={isUpdatingStatus && updateVars?.memberId === m.id}
                              aria-label={statusAriaLabel}
                              aria-pressed={isActive}
                              onClick={() => {
                                updateStatus({
                                  garageId,
                                  memberId: m.id,
                                  payload: {
                                    status: isActive ? BranchMemberStatus.Inactive : BranchMemberStatus.Active,
                                  },
                                });
                              }}
                            >
                              {isActive ? (
                                <ToggleRight className="size-4" aria-hidden />
                              ) : (
                                <ToggleLeft className="size-4" aria-hidden />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">{statusTooltip}</TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            aria-label="Mật khẩu"
                            onClick={() => setPasswordMember(m)}
                          >
                            <KeyRound className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Mật khẩu</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Xóa"
                            disabled={isDeletingMember && deleteVars?.memberId === m.id}
                            onClick={() => setMemberToDelete(m)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Xóa</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
