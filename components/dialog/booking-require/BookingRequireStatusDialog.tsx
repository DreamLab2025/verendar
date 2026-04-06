"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePatchBookingStatusMutation } from "@/hooks/useBookings";
import { cn } from "@/lib/utils";

function isRadixSelectPortalTarget(node: EventTarget | null): boolean {
  if (!(node instanceof Element)) return false;
  return Boolean(
    node.closest("[data-radix-select-viewport]") ||
      node.closest('[role="listbox"]') ||
      node.closest("[data-radix-popper-content-wrapper]"),
  );
}

export type BookingRequireStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
  branchId?: string;
};

/**
 * Dialog lồng trong `BookingRequireDialog`.
 * Chọn InProgress / Completed → PATCH với `currentOdometer: null`.
 */
export function BookingRequireStatusDialog({
  open,
  onOpenChange,
  bookingId,
  branchId,
}: BookingRequireStatusDialogProps) {
  const patchStatus = usePatchBookingStatusMutation(branchId);
  const [selectedPatchStatus, setSelectedPatchStatus] = useState<"InProgress" | "Completed" | null>(null);
  /** Remount Select mỗi lần mở dialog — Radix có thể giữ state khi `value` về `undefined`. */
  const [selectMountKey, setSelectMountKey] = useState(0);
  const prevOpenRef = useRef(false);

  /* eslint-disable react-hooks/set-state-in-effect -- reset form theo open */
  useEffect(() => {
    if (!open) {
      setSelectedPatchStatus(null);
      return;
    }
    setSelectedPatchStatus(null);
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect -- remount Select khi mở lại dialog */
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setSelectMountKey((k) => k + 1);
    }
    prevOpenRef.current = open;
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setSelectedPatchStatus(null);
    }
  };

  const handleConfirm = async () => {
    if (!bookingId || !selectedPatchStatus) return;
    try {
      await patchStatus.mutateAsync({
        bookingId,
        status: selectedPatchStatus,
        currentOdometer: null,
      });
      onOpenChange(false);
    } catch {
      /* toast trong mutation */
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "booking-require-status-dialog z-[100] sm:max-w-md",
          "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:left-0 max-lg:right-0 max-lg:w-full max-lg:max-w-none max-lg:translate-x-0 max-lg:translate-y-0 max-lg:gap-3 max-lg:rounded-t-2xl max-lg:rounded-b-none max-lg:border-x-0 max-lg:border-b-0 max-lg:p-4 max-lg:pb-[max(1rem,env(safe-area-inset-bottom))] max-lg:pt-5 max-lg:shadow-2xl max-lg:max-h-[min(88dvh,560px)] max-lg:overflow-y-auto",
        )}
        showCloseButton
        onPointerDownOutside={(e) => {
          if (isRadixSelectPortalTarget(e.target)) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (isRadixSelectPortalTarget(e.target)) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái</DialogTitle>
          <DialogDescription>Chọn trạng thái mới cho lịch hẹn.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <Label htmlFor="booking-patch-status">Trạng thái</Label>
          <Select
            key={selectMountKey}
            value={selectedPatchStatus ?? undefined}
            onValueChange={(v) => setSelectedPatchStatus(v as "InProgress" | "Completed")}
          >
            <SelectTrigger id="booking-patch-status" className="w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent className="z-[200]">
              <SelectItem value="InProgress">Đang xử lý</SelectItem>
              <SelectItem value="Completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={patchStatus.isPending}>
            Hủy
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={!selectedPatchStatus || patchStatus.isPending}>
            {patchStatus.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Đang gửi…
              </>
            ) : (
              "Xác nhận"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
