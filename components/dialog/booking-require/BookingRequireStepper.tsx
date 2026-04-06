"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { Activity, AlertCircle, Check, Clock } from "lucide-react";

import { milestoneLabelAtIndex, statusToMilestoneIndex } from "@/components/helper/booking-require";
import { cn } from "@/lib/utils";

/** 3 mốc — chỉ hiển thị (read-only), không tương tác. */
const MILESTONES = [
  { id: "confirmed", InactiveIcon: Clock },
  { id: "in_progress", InactiveIcon: Activity },
  { id: "completed", InactiveIcon: Check },
] as const;

/** Đoạn nối giữa hai mốc: đỏ nếu đã qua; xám + đổ đầy đỏ lặp nếu đang chờ bước kế. */
function BookingRequireStepConnector({
  filled,
  sweep,
  className,
}: {
  filled: boolean;
  sweep: boolean;
  className?: string;
}) {
  if (filled) {
    return <div className={cn("h-0.5 min-w-[0.4rem] flex-1 rounded-full bg-primary sm:min-w-3", className)} aria-hidden />;
  }

  return (
    <div
      className={cn(
        "relative h-0.5 min-w-[0.4rem] flex-1 overflow-hidden rounded-full bg-border sm:min-w-3",
        className,
      )}
      aria-hidden
    >
      {sweep ? (
        <span
          className={cn(
            "ver-booking-stepper-line-fill pointer-events-none absolute inset-y-0 left-0 block w-full rounded-full bg-primary",
            "shadow-[0_0_0_1px_rgba(205,38,38,0.15)]",
          )}
        />
      ) : null}
    </div>
  );
}

export type BookingRequireStepperProps = {
  serverStatus: string;
  /** Framer `layoutId` — đổi khi có nhiều stepper cùng màn hình. */
  layoutId?: string;
  className?: string;
};

export function BookingRequireStepper({
  serverStatus,
  layoutId = "booking-require-progress-pill",
  className,
}: BookingRequireStepperProps) {
  const activeIndex = statusToMilestoneIndex(serverStatus);
  const isCancelled = serverStatus === "Cancelled";

  if (isCancelled) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive",
          className,
        )}
      >
        <AlertCircle className="size-5 shrink-0" aria-hidden />
        <span>Đơn đã hủy.</span>
      </div>
    );
  }

  const currentPhaseLabel = milestoneLabelAtIndex(activeIndex, serverStatus, activeIndex);

  return (
    <div
      role="status"
      aria-label={`Tiến trình: ${currentPhaseLabel}`}
      className={cn("pointer-events-none w-full select-none", className)}
    >
      <div className="flex w-full min-w-0 items-center justify-between gap-1 sm:gap-2">
        {MILESTONES.map((step, i) => {
          const isActive = activeIndex === i;
          const stepLabel = milestoneLabelAtIndex(i, serverStatus, activeIndex);
          const InactiveIcon = step.InactiveIcon;
          const lineBeforeRed = i > 0 && activeIndex > i - 1;
          const sweepBeforeThisStep = i > 0 && activeIndex === i - 1;

          return (
            <Fragment key={step.id}>
              {i > 0 ? (
                <BookingRequireStepConnector filled={lineBeforeRed} sweep={sweepBeforeThisStep} />
              ) : null}

              <div className="flex min-w-0 shrink-0 flex-col items-center gap-1 sm:flex-row sm:gap-2">
                {isActive ? (
                  <motion.div
                    layoutId={layoutId}
                    className="flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1.5 text-primary-foreground shadow-md sm:gap-2 sm:px-3 sm:py-2"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  >
                    <span className="grid size-6 place-items-center rounded-full bg-white/25 sm:size-7">
                      <Check className="size-3.5 text-white sm:size-4" strokeWidth={2.5} aria-hidden />
                    </span>
                    <span className="max-w-22 text-[11px] font-semibold leading-tight sm:max-w-none sm:text-xs">{stepLabel}</span>
                  </motion.div>
                ) : (
                  <div
                    className={cn(
                      "flex items-center gap-1.5 sm:gap-2",
                      i === 2 ? "text-foreground" : "text-foreground/90",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full sm:size-8",
                        i === 2
                          ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : i === 0
                            ? "bg-primary/12 text-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                      aria-hidden
                    >
                      <InactiveIcon className="size-3.5 sm:size-4" strokeWidth={1.75} />
                    </span>
                    <span
                      className={cn(
                        "max-w-18 text-[11px] font-medium leading-tight sm:max-w-none sm:text-sm",
                        i === 2
                          ? "text-emerald-800 dark:text-emerald-300/90"
                          : i === 0
                            ? "text-foreground/85"
                            : "text-muted-foreground",
                      )}
                    >
                      {stepLabel}
                    </span>
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
