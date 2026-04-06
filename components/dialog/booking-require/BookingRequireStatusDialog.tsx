"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { isRadixSelectPortalTarget } from "./radix-select-portal-guard";

export type BookingRequireStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
  branchId?: string;
  /** ODO từ booking (GET) — dùng làm mặc định bước nhập km. */
  currentOdometer: number | null | undefined;
};

/**
 * Dialog lồng trong `BookingRequireDialog` (cùng cây `DialogContent` cha).
 * Bước 1: chọn InProgress / Completed; Completed → PATCH ngay; InProgress → bước 2 nhập ODO.
 */
export function BookingRequireStatusDialog({
  open,
  onOpenChange,
  bookingId,
  branchId,
  currentOdometer,
}: BookingRequireStatusDialogProps) {
  const patchStatus = usePatchBookingStatusMutation(branchId);
  const [statusStep, setStatusStep] = useState<1 | 2>(1);
  const [selectedPatchStatus, setSelectedPatchStatus] = useState<"InProgress" | "Completed" | null>(null);
  const [odometerStr, setOdometerStr] = useState("0");
  /** Remount Select mỗi lần mở dialog — Radix có thể giữ state khi `value` về `undefined`. */
  const [selectMountKey, setSelectMountKey] = useState(0);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      //eslint-disable-next-line react-hooks/exhaustive-deps
      setStatusStep(1);
      setSelectedPatchStatus(null);
      setOdometerStr("0");
      return;
    }
    setStatusStep(1);
    setSelectedPatchStatus(null);
    const odo = currentOdometer;
    setOdometerStr(
      odo != null && typeof odo === "number" && !Number.isNaN(odo) ? String(Math.max(0, odo)) : "0",
    );
  }, [open, currentOdometer]);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      //eslint-disable-next-line react-hooks/exhaustive-deps
      setSelectMountKey((k) => k + 1);
    }
    prevOpenRef.current = open;
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setStatusStep(1);
      setSelectedPatchStatus(null);
      setOdometerStr("0");
    }
  };

  const handleContinueStep1 = async () => {
    if (!bookingId || !selectedPatchStatus) return;
    if (selectedPatchStatus === "Completed") {
      try {
        await patchStatus.mutateAsync({
          bookingId,
          status: "Completed",
          currentOdometer: 0,
        });
        onOpenChange(false);
      } catch {
        /* toast trong mutation */
      }
      return;
    }
    setStatusStep(2);
    const odo = currentOdometer;
    setOdometerStr(
      odo != null && typeof odo === "number" && !Number.isNaN(odo) ? String(Math.max(0, odo)) : "0",
    );
  };

  const handleConfirmInProgress = async () => {
    if (!bookingId) return;
    const n = Number.parseInt(String(odometerStr).replace(/\s/g, ""), 10);
    if (Number.isNaN(n) || n < 0) {
      toast.error("Nhập số km hợp lệ (≥ 0).");
      return;
    }
    try {
      await patchStatus.mutateAsync({
        bookingId,
        status: "InProgress",
        currentOdometer: n,
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
          "booking-require-status-dialog z-100 sm:max-w-md",
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
          <DialogDescription>
            {statusStep === 1
              ? "Chọn trạng thái mới cho lịch hẹn."
              : "Nhập số km hiện tại (ODO) trên xe khi chuyển sang đang xử lý."}
          </DialogDescription>
        </DialogHeader>

        {statusStep === 1 ? (
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
              <SelectContent className="z-200">
                <SelectItem value="InProgress">Đang xử lý</SelectItem>
                <SelectItem value="Completed">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            <Label htmlFor="booking-patch-odo">Số km hiện tại (ODO)</Label>
            <Input
              id="booking-patch-odo"
              inputMode="numeric"
              min={0}
              value={odometerStr}
              onChange={(e) => setOdometerStr(e.target.value)}
              placeholder="0"
              autoComplete="off"
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {statusStep === 1 ? (
            <>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={patchStatus.isPending}>
                Hủy
              </Button>
              <Button
                type="button"
                onClick={() => void handleContinueStep1()}
                disabled={!selectedPatchStatus || patchStatus.isPending}
              >
                {patchStatus.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    Đang gửi…
                  </>
                ) : selectedPatchStatus === "Completed" ? (
                  "Xác nhận"
                ) : (
                  "Tiếp tục"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => setStatusStep(1)} disabled={patchStatus.isPending}>
                Quay lại
              </Button>
              <Button type="button" onClick={() => void handleConfirmInProgress()} disabled={patchStatus.isPending}>
                {patchStatus.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    Đang gửi…
                  </>
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
