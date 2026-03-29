"use client";

import { useState } from "react";
import { LicensePlateBadge } from "./LicensePlateBadge";
import { OdometerRoller } from "@/components/odometer/OdometerRoller";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateOdometer } from "@/hooks/useOdometer";
import { cn } from "@/lib/utils";

type UpdateOdometerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userVehicleId: string;
  currentOdometer: number;
  licensePlate?: string;
};

type FormProps = {
  userVehicleId: string;
  currentOdometer: number;
  licensePlate?: string;
  onClose: () => void;
};

function UpdateOdometerForm({ userVehicleId, currentOdometer, licensePlate, onClose }: FormProps) {
  const [value, setValue] = useState(currentOdometer);
  const { updateOdometerAsync, isUpdating } = useUpdateOdometer();

  const belowCurrent = value < currentOdometer;
  const canSubmit = value > currentOdometer;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await updateOdometerAsync({
        userVehicleId,
        payload: { currentOdometer: value },
      });
      onClose();
    } catch {
      /* toast trong hook */
    }
  };

  return (
    <>
      <div className="border-b border-border px-6 pb-4 pt-5 sm:pr-12">
        <DialogHeader className="space-y-3 text-left">
          <DialogTitle className="text-2xl uppercase font-bold tracking-tight text-foreground">
            Cập nhật Odomenter{" "}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm leading-relaxed text-muted-foreground">
              {licensePlate ? (
                <p className="flex justify-between items-center gap-x-2 gap-y-2">
                  <LicensePlateBadge licensePlate={licensePlate} size="md" className="max-w-full shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    · Hiện tại{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {currentOdometer.toLocaleString("vi-VN")} km
                    </span>
                  </span>
                </p>
              ) : (
                <p>
                  Hiện tại{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {currentOdometer.toLocaleString("vi-VN")} km
                  </span>
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="space-y-4 px-6 py-4">
        <OdometerRoller digits={6} value={value} minValue={currentOdometer} mode="update" onChange={setValue} />

        <p
          role="status"
          className={cn(
            "text-sm leading-relaxed",
            belowCurrent && "text-destructive",
            !belowCurrent && canSubmit && "text-foreground",
            !belowCurrent && !canSubmit && "text-muted-foreground",
          )}
        >
          {belowCurrent ? (
            "Không thể nhập nhỏ hơn số km đang lưu trên hệ thống."
          ) : value <= currentOdometer ? (
            "Cập nhật chính xác số km đã thay đổi."
          ) : (
            <>
              Giá trị cập nhật: <span className="font-bold  text-primary">{value.toLocaleString("vi-VN")} km</span>
            </>
          )}
        </p>
      </div>

      <DialogFooter className="gap-2 border-t border-border px-6 py-3 sm:justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isUpdating}>
          Hủy
        </Button>
        <Button type="button" size="sm" className="min-w-22" onClick={handleSubmit} disabled={!canSubmit || isUpdating}>
          {isUpdating ? "Đang lưu…" : "Lưu"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function UpdateOdometerDialog({
  open,
  onOpenChange,
  userVehicleId,
  currentOdometer,
  licensePlate,
}: UpdateOdometerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-lg gap-0 overflow-hidden border-border bg-card p-0 shadow-lg",
          "sm:max-w-[min(32rem,calc(100vw-1.5rem))]",
        )}
      >
        {open ? (
          <UpdateOdometerForm
            key={`${userVehicleId}-${currentOdometer}`}
            userVehicleId={userVehicleId}
            currentOdometer={currentOdometer}
            licensePlate={licensePlate}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
