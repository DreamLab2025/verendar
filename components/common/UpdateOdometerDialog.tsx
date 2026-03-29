"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  type Transition,
} from "framer-motion";
import { LicensePlateBadge } from "./LicensePlateBadge";
import { OdometerRoller } from "@/components/odometer/OdometerRoller";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateOdometer } from "@/hooks/useOdometer";
import { cn } from "@/lib/utils";

const SHEET_MQ = "(max-width: 1023px)";

/** Tween ổn định hơn spring — ít “nảy”/khựng khi mở đóng sheet */
const SHEET_OPEN: Transition = {
  type: "tween",
  duration: 0.44,
  ease: [0.22, 1, 0.36, 1],
};

const SHEET_CLOSE: Transition = {
  type: "tween",
  duration: 0.34,
  ease: [0.4, 0, 0.2, 1],
};

const SHEET_SNAP_BACK: Transition = {
  type: "tween",
  duration: 0.26,
  ease: [0.22, 1, 0.36, 1],
};

function subscribeMaxLg(onStoreChange: () => void) {
  const mq = window.matchMedia(SHEET_MQ);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMaxLgSnapshot() {
  return window.matchMedia(SHEET_MQ).matches;
}

function getMaxLgServerSnapshot() {
  return false;
}

function useIsSheetLayout() {
  return useSyncExternalStore(subscribeMaxLg, getMaxLgSnapshot, getMaxLgServerSnapshot);
}

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
  /** Khi sheet mobile: thanh kéo nằm ngoài form */
  hideDragHandle?: boolean;
};

function UpdateOdometerForm({
  userVehicleId,
  currentOdometer,
  licensePlate,
  onClose,
  hideDragHandle,
}: FormProps) {
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
      <div
        className={cn(
          "shrink-0 border-b border-border px-4 pb-3 sm:px-6 sm:pb-4 sm:pt-5 sm:pr-12",
          hideDragHandle ? "pt-3 max-lg:pt-2" : "pt-4 max-lg:pt-3",
        )}
      >
        {!hideDragHandle ? (
          <div
            className="mx-auto mb-2 hidden h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25 max-lg:block"
            aria-hidden
          />
        ) : null}
        <DialogHeader className="space-y-3 text-left">
          <DialogTitle
            className={cn(
              "text-lg font-bold uppercase tracking-tight text-foreground max-lg:normal-case max-lg:pr-10",
              "sm:text-xl lg:text-2xl",
            )}
          >
            Cập nhật số km
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm leading-relaxed text-muted-foreground max-lg:text-[15px]">
              {licensePlate ? (
                <div className="flex flex-col gap-3 max-lg:gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-x-3">
                  <LicensePlateBadge licensePlate={licensePlate} size="md" className="w-fit max-w-full shrink-0" />
                  <p className="text-muted-foreground max-lg:text-[15px] sm:text-sm">
                    <span className="text-muted-foreground/80">Hiện tại </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {currentOdometer.toLocaleString("vi-VN")} km
                    </span>
                  </p>
                </div>
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

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 py-4 sm:px-6">
        <div className="space-y-4">
          <OdometerRoller digits={6} value={value} minValue={currentOdometer} mode="update" onChange={setValue} />

          <p
            role="status"
            className={cn(
              "text-[15px] leading-relaxed max-lg:text-base",
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
                Giá trị cập nhật:{" "}
                <span className="font-bold text-primary">{value.toLocaleString("vi-VN")} km</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex w-full shrink-0 flex-col-reverse gap-3 border-t border-border bg-card px-4 py-4 sm:px-6 lg:flex-row lg:justify-end lg:gap-3",
          "max-lg:pb-[max(1rem,env(safe-area-inset-bottom))]",
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onClose}
          disabled={isUpdating}
          className="w-full touch-manipulation active:bg-accent/90 lg:w-auto"
        >
          Hủy
        </Button>
        <Button
          type="button"
          size="lg"
          className="w-full touch-manipulation lg:w-auto lg:min-w-30"
          onClick={handleSubmit}
          disabled={!canSubmit || isUpdating}
        >
          {isUpdating ? "Đang lưu…" : "Lưu"}
        </Button>
      </div>
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
  const isSheetLayout = useIsSheetLayout();
  const sheetY = useMotionValue(0);
  const dragControls = useDragControls();
  const onOpenChangeRef = useRef(onOpenChange);
  const closingRef = useRef(false);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const closeWithAnimation = useCallback(() => {
    if (closingRef.current) return;
    if (!isSheetLayout) {
      onOpenChangeRef.current(false);
      return;
    }
    if (typeof window === "undefined") return;
    closingRef.current = true;
    const el = document.activeElement;
    if (el instanceof HTMLElement) el.blur();
    const targetY = window.innerHeight;
    requestAnimationFrame(() => {
      animate(sheetY, targetY, {
        ...SHEET_CLOSE,
        onComplete: () => {
          onOpenChangeRef.current(false);
          closingRef.current = false;
        },
      });
    });
  }, [isSheetLayout, sheetY]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        onOpenChangeRef.current(next);
        return;
      }
      if (isSheetLayout && open) {
        closeWithAnimation();
        return;
      }
      onOpenChangeRef.current(false);
    },
    [isSheetLayout, open, closeWithAnimation],
  );

  useLayoutEffect(() => {
    if (!open) {
      prevOpenRef.current = false;
      return;
    }
    if (!isSheetLayout || typeof window === "undefined") {
      prevOpenRef.current = true;
      return;
    }
    const justOpened = !prevOpenRef.current;
    prevOpenRef.current = true;
    if (!justOpened) return;
    closingRef.current = false;
    const h = window.innerHeight;
    sheetY.set(h);
    const raf = requestAnimationFrame(() => {
      animate(sheetY, 0, SHEET_OPEN);
    });
    return () => cancelAnimationFrame(raf);
  }, [open, isSheetLayout, sheetY]);

  useEffect(() => {
    if (!open) {
      sheetY.set(0);
      closingRef.current = false;
    }
  }, [open, sheetY]);

  const onDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      if (!isSheetLayout) return;
      const dismiss = info.offset.y > 72 || info.velocity.y > 480;
      if (dismiss) {
        closeWithAnimation();
      } else {
        animate(sheetY, 0, SHEET_SNAP_BACK);
      }
    },
    [isSheetLayout, sheetY, closeWithAnimation],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          if (typeof window !== "undefined" && window.matchMedia(SHEET_MQ).matches) {
            e.preventDefault();
          }
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className={cn(
          "update-odo-dialog flex max-h-dvh flex-col gap-0 overflow-hidden border-border bg-card p-0 shadow-lg",
          "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-auto max-lg:left-0 max-lg:right-0 max-lg:max-h-none max-lg:w-full max-lg:max-w-none max-lg:translate-x-0 max-lg:translate-y-0 max-lg:rounded-none max-lg:border-0 max-lg:bg-transparent max-lg:shadow-none",
          "sm:max-w-[min(32rem,calc(100vw-1.5rem))] lg:max-w-lg",
        )}
      >
        <button
          type="button"
          onClick={() => closeWithAnimation()}
          className="absolute right-2 top-2 z-60 inline-flex size-11 items-center justify-center rounded-xl opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:bg-accent/80 sm:right-4 sm:top-4 sm:size-9 sm:rounded-sm"
          aria-label="Đóng"
        >
          <X className="size-5 sm:size-4" aria-hidden />
        </button>
        {open ? (
          <motion.div
            className={cn(
              "flex max-h-[min(92dvh,880px)] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-border bg-card shadow-xl",
              "max-lg:max-h-[min(92dvh,880px)] max-lg:border-x-0 max-lg:border-b-0 max-lg:border-t",
              "transform-gpu will-change-transform backface-hidden",
            )}
            style={{ y: isSheetLayout ? sheetY : 0 }}
            drag={isSheetLayout ? "y" : false}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.22 }}
            dragTransition={{ bounceStiffness: 480, bounceDamping: 34 }}
            onDragEnd={onDragEnd}
          >
            {isSheetLayout ? (
              <div
                className="flex min-h-11 shrink-0 cursor-grab touch-none flex-col items-center justify-center py-2 active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.preventDefault();
                  dragControls.start(e);
                }}
                role="separator"
                aria-orientation="horizontal"
                aria-label="Kéo xuống để đóng"
              >
                <span className="pointer-events-none h-1 w-10 rounded-full bg-muted-foreground/30" />
              </div>
            ) : null}
            <UpdateOdometerForm
              key={`${userVehicleId}-${currentOdometer}`}
              userVehicleId={userVehicleId}
              currentOdometer={currentOdometer}
              licensePlate={licensePlate}
              hideDragHandle={isSheetLayout}
              onClose={closeWithAnimation}
            />
          </motion.div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
