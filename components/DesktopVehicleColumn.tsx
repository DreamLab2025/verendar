"use client";

import { useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { Car, Gauge, Plus } from "lucide-react";
import type { UserVehicle } from "@/lib/api/services/fetchUserVehicle";
import { cn } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";
import { Button } from "@/components/ui/button";
import { LicensePlateBadge } from "./common/LicensePlateBadge";
import { UpdateOdometerDialog } from "./common/UpdateOdometerDialog";
import { Separator } from "@radix-ui/react-select";

const BRAND = "#E22028";

const easeCard = "cubic-bezier(0.22, 1, 0.36, 1)";
const durMs = 320;
const layoutSync = { duration: durMs / 1000, ease: [0.22, 1, 0.36, 1] as const };

type DesktopVehicleColumnProps = {
  vehicles: UserVehicle[];
  /** Card đang mở rộng (đồng bộ với khối giữa/phải) — controlled từ page */
  expandedVehicleId: string | null;
  onExpandedChange: (id: string | null) => void;
  /** Xe đang mở: % khai báo trên card */
  currentVehicleId: string | null;
  currentIndex: number;
  /** true khi đang mở form Thêm xe (có ít nhất 1 xe) — chỉ để highlight ô Thêm xe */
  isAddSlot: boolean;
  onSelect: (index: number) => void;
  onRequestAddVehicle: () => void;
  declarationPercentForSelected: number;
};

export function DesktopVehicleColumn({
  vehicles,
  expandedVehicleId,
  onExpandedChange,
  currentVehicleId,
  currentIndex,
  isAddSlot,
  onSelect,
  onRequestAddVehicle,
  declarationPercentForSelected,
}: DesktopVehicleColumnProps) {
  const [odometerDialogOpen, setOdometerDialogOpen] = useState(false);
  const expandedVehicle = expandedVehicleId ? vehicles.find((x) => x.id === expandedVehicleId) : undefined;

  const handleVehicleCardClick = (v: UserVehicle, index: number) => {
    if (currentIndex === index) {
      onExpandedChange(expandedVehicleId === v.id ? null : v.id);
    } else {
      onSelect(index);
      onExpandedChange(v.id);
    }
  };

  return (
    <section className="flex h-full min-h-0 w-[22%] shrink-0 flex-col rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
      {expandedVehicle && (
        <UpdateOdometerDialog
          open={odometerDialogOpen}
          onOpenChange={setOdometerDialogOpen}
          userVehicleId={expandedVehicle.id}
          currentOdometer={expandedVehicle.currentOdometer}
          licensePlate={expandedVehicle.licensePlate}
        />
      )}
      <div className="mb-2 flex h-14 shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6 text-neutral-900 dark:text-neutral-100" />
          <h2 className="text-[16px] font-bold text-neutral-900 dark:text-neutral-100">Xe của bạn</h2>
        </div>
        {!isAddSlot && expandedVehicle && (
          <Button
            type="button"
            onClick={() => setOdometerDialogOpen(true)}
            variant="default"
            size="sm"
            className="h-auto w-auto rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: BRAND }}
          >
            <Gauge className="h-4 w-4 text-white" />
            Cập Nhật Odo
          </Button>
        )}
      </div>
      <Separator className="mb-4 h-px w-[60%] self-center bg-neutral-200 dark:bg-neutral-700" />
      <h1 className="mb-4 text-[16px] font-bold text-[#80868E] dark:text-neutral-400">Chọn Xe Của bạn</h1>

      <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden overscroll-contain pr-1">
        {vehicles.map((v, index) => {
          const active = !isAddSlot && currentIndex === index;
          const expanded = expandedVehicleId === v.id;
          const pct = v.id === currentVehicleId ? declarationPercentForSelected : 0;

          return (
            <button
              key={v.id}
              type="button"
              aria-expanded={expanded}
              onClick={() => handleVehicleCardClick(v, index)}
              className={cn(
                "w-full rounded-2xl border bg-white text-left dark:bg-neutral-950",
                "transition-[padding,box-shadow] duration-200 ease-out",
                expanded ? "p-3" : "p-2.5",
                active && expanded
                  ? "border-[#E22028] shadow-md ring-1 ring-[#E22028]/20"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700",
              )}
            >
              <div className="flex w-full min-w-0 flex-col">
                <div
                  className={cn("overflow-hidden", expanded ? "mb-2" : "mb-0")}
                  style={{
                    maxHeight: expanded ? 48 : 0,
                    opacity: expanded ? 1 : 0,
                    transition: `max-height ${durMs}ms ${easeCard}, opacity ${durMs}ms ${easeCard}, margin ${durMs}ms ${easeCard}`,
                  }}
                  aria-hidden={!expanded}
                >
                  <div className="flex items-center justify-between gap-2 px-0.5">
                    <span className="text-[15px] font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                      {pct}%
                    </span>
                    <span
                      className="h-3 w-3 shrink-0 rounded-full shadow-sm ring-2 ring-white dark:ring-neutral-950"
                      style={{ backgroundColor: BRAND }}
                      aria-hidden
                    />
                  </div>
                </div>

                <div className="flex w-full min-w-0">
                  <div
                    className="flex shrink-0 justify-center overflow-hidden"
                    style={{
                      width: expanded ? 8 : 0,
                      height: expanded ? 188 : 0,
                      marginRight: expanded ? 12 : 0,
                      opacity: expanded ? 1 : 0,
                      transition: `width ${durMs}ms ${easeCard}, height ${durMs}ms ${easeCard}, margin ${durMs}ms ${easeCard}, opacity ${durMs}ms ${easeCard}`,
                    }}
                    aria-hidden={!expanded}
                  >
                    <div className="flex h-full w-2 shrink-0 justify-center pt-0.5">
                      <div className="relative h-full min-h-0 w-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500"
                          style={{ height: `${pct}%`, backgroundColor: BRAND }}
                        />
                      </div>
                    </div>
                  </div>

                  <LayoutGroup id={`vehicle-card-${v.id}`}>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 px-2">
                      <div
                        className={cn(
                          "flex w-full min-w-0 items-center",
                          expanded ? "justify-center" : "justify-between gap-2.5",
                        )}
                      >
                        <motion.div layout="position" transition={{ layout: layoutSync }} className="min-w-0 shrink">
                          <LicensePlateBadge
                            licensePlate={v.licensePlate}
                            size="md"
                            className={cn(expanded ? "mx-auto w-fit max-w-full" : "min-w-0")}
                          />
                        </motion.div>
                        {!expanded && (
                          <motion.div
                            layoutId={`vehicle-image-${v.id}`}
                            transition={{ layout: layoutSync }}
                            className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl"
                          >
                            {v.variant?.imageUrl ? (
                              <SafeImage
                                src={v.variant.imageUrl}
                                alt={v.variant?.model?.name ?? ""}
                                fill
                                className="object-contain object-center"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                                —
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                      {expanded && (
                        <motion.div
                          layoutId={`vehicle-image-${v.id}`}
                          transition={{ layout: layoutSync }}
                          className="relative h-[188px] w-full max-w-full overflow-hidden rounded-xl"
                        >
                          {v.variant?.imageUrl ? (
                            <SafeImage
                              src={v.variant.imageUrl}
                              alt={v.variant?.model?.name ?? ""}
                              fill
                              className="object-cover object-right"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                              No image
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </LayoutGroup>
                </div>
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            onExpandedChange(null);
            onRequestAddVehicle();
          }}
          className={cn(
            "mt-auto flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors",
            isAddSlot
              ? "border-[#E22028] bg-red-50/50 dark:bg-red-950/20"
              : "border-neutral-300 bg-white hover:border-[#E22028]/50 dark:border-neutral-700 dark:bg-neutral-950",
          )}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md"
            style={{ backgroundColor: BRAND }}
          >
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400">Thêm xe</span>
        </button>
      </div>
    </section>
  );
}
