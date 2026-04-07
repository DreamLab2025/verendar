"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignBookingMutation } from "@/hooks/useBookings";
import { useBranchMembersQuery } from "@/hooks/useBranchMember";
import {
  BranchMemberRole,
  BranchMemberStatus,
  getBranchMemberRoleLabelVi,
  type BranchMemberDto,
} from "@/lib/api/services/fetchBranchMember";
import { cn } from "@/lib/utils";

export function canAssignBookingMechanic(status: string) {
  return status === "Pending" || status === "AwaitingConfirmation";
}

function pickMechanicsForAssign(members: BranchMemberDto[]) {
  return members.filter(
    (m) =>
      String(m.role) === BranchMemberRole.Mechanic && String(m.status) === BranchMemberStatus.Active,
  );
}

export type AssignMechanicDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
  garageId: string;
  branchId: string;
};

export function AssignMechanicDialog({
  open,
  onOpenChange,
  bookingId,
  garageId,
  branchId,
}: AssignMechanicDialogProps) {
  const [selectedId, setSelectedId] = useState("");

  const membersQ = useBranchMembersQuery(
    garageId || undefined,
    branchId || undefined,
    { PageNumber: 1, PageSize: 100 },
    open && Boolean(garageId && branchId && bookingId),
  );

  const mechanics = useMemo(() => {
    const raw = membersQ.data?.isSuccess && Array.isArray(membersQ.data.data) ? membersQ.data.data : [];
    return pickMechanicsForAssign(raw);
  }, [membersQ.data]);

  const assign = useAssignBookingMutation(branchId || undefined);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setSelectedId("");
      }, 0);
    }
  }, [open, bookingId]);

  const handleConfirm = () => {
    if (!bookingId || !selectedId) return;
    assign.mutate(
      { bookingId, garageMemberId: selectedId },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const busy = assign.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex max-h-[min(88dvh,100svh)] w-[calc(100vw-0.75rem)] max-w-[calc(100vw-0.75rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[min(85vh,640px)] sm:w-full sm:max-w-md sm:rounded-2xl",
        )}
      >
        <DialogHeader className="shrink-0 border-b border-border/60 px-4 pb-3 pt-4 sm:px-5">
          <DialogTitle className="text-left text-base font-semibold sm:text-lg">Gán thợ máy</DialogTitle>
          <p className="text-left text-[11px] leading-snug text-muted-foreground sm:text-xs">
            Chọn thành viên vai trò Thợ máy đang hoạt động tại chi nhánh này. Sau khi xác nhận, lịch hẹn chuyển sang Đã
            xác nhận.
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
          {membersQ.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-14 w-full rounded-lg" />
            </div>
          ) : membersQ.isError ? (
            <div className="rounded-lg border border-destructive/25 bg-destructive/6 p-3 text-xs text-destructive sm:text-sm">
              {membersQ.error?.message ?? "Không tải được danh sách nhân viên."}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => void membersQ.refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : mechanics.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 bg-muted/15 px-3 py-4 text-center text-sm text-muted-foreground">
              Chưa có thợ máy đang hoạt động tại chi nhánh này. Thêm nhân viên ở tab Nhân viên trước khi gán.
            </p>
          ) : (
            <RadioGroup value={selectedId} onValueChange={setSelectedId} className="gap-2">
              {mechanics.map((m) => {
                const name = m.fullName?.trim() || "—";
                const sub = [getBranchMemberRoleLabelVi(m.role), m.email?.trim(), m.phoneNumber?.trim()]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 transition-colors",
                      selectedId === m.id && "border-primary/50 bg-primary/5 ring-1 ring-primary/20",
                    )}
                  >
                    <RadioGroupItem value={m.id} id={`mech-${m.id}`} className="mt-0.5" />
                    <Label htmlFor={`mech-${m.id}`} className="min-w-0 flex-1 cursor-pointer space-y-0.5 leading-snug">
                      <span className="block text-sm font-medium text-foreground">{name}</span>
                      {sub ? <span className="block text-[11px] text-muted-foreground">{sub}</span> : null}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border/60 px-4 py-3 sm:flex-row sm:justify-end sm:px-5 sm:py-3.5">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={busy || !selectedId || mechanics.length === 0}
            onClick={() => void handleConfirm()}
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Đang xác nhận…
              </>
            ) : (
              "Xác nhận gán"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
