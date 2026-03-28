"use client";

import { useState } from "react";
import { Car, Gauge, Plus } from "lucide-react";
import type { UserVehicle } from "@/lib/api/services/fetchUserVehicle";
import { cn } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LicensePlateBadge } from "./common/LicensePlateBadge";
import { Separator } from "@radix-ui/react-select";

const BRAND = "#E22028";

/** Chỉ transition kích thước/vị trí bằng CSS — không dùng Framer layout (tránh scale FLIP). */
const easeCard = "cubic-bezier(0.22, 1, 0.36, 1)";
const durMs = 320;

type DesktopVehicleColumnProps = {
  vehicles: UserVehicle[];
  currentVehicleId: string | null;
  currentIndex: number;
  isAddSlot: boolean;
  onSelect: (index: number) => void;
  declarationPercentForSelected: number;
};

export function DesktopVehicleColumn({
  vehicles,
  currentVehicleId,
  currentIndex,
  isAddSlot,
  onSelect,
  declarationPercentForSelected,
}: DesktopVehicleColumnProps) {
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null);
  const router = useRouter();

  const handleVehicleCardClick = (v: UserVehicle, index: number) => {
    onSelect(index);
    setExpandedVehicleId((prev) => (prev === v.id ? null : v.id));
  };

  return (
    <section className="flex h-full min-h-0 w-[22%] shrink-0 flex-col rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="mb-2 flex h-14 shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6 text-neutral-900 dark:text-neutral-100" />
          <h2 className="text-[16px] font-bold text-neutral-900 dark:text-neutral-100">Xe của bạn</h2>
        </div>
        {!isAddSlot && vehicles[currentIndex] && (
          <Button
            onClick={() => router.push(`/vehicle/odometer/${vehicles[currentIndex].id}`)}
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
                active
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
                    transition: `max-height ${durMs}ms ${easeCard}, opacity ${expanded ? 220 : 140}ms ${easeCard}, margin 200ms ${easeCard}`,
                  }}
                  aria-hidden={!expanded}
                >
                  <div className="flex items-center justify-between gap-2 px-0.5">
                    <span className="text-[15px] font-bold tabular-nums text-neutral-900 dark:text-neutral-100">{pct}%</span>
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

                  <div
                    className={cn(
                      "grid min-w-0 flex-1 px-2",
                      expanded
                        ? "grid-cols-1 grid-rows-[auto_auto] justify-items-center gap-2"
                        : "grid-cols-[minmax(0,1fr)_auto] grid-rows-1 items-center gap-x-2.5",
                    )}
                  >
                    <div className={cn("min-w-0", expanded ? "w-full justify-self-center" : "justify-self-start")}>
                      <LicensePlateBadge
                        licensePlate={v.licensePlate}
                        size="md"
                        className={cn(expanded ? "mx-auto w-fit max-w-full" : "min-w-0")}
                      />
                    </div>
                    <div
                      className={cn(
                        "flex min-h-0 min-w-0 self-stretch",
                        expanded ? "w-full max-w-full justify-end" : "w-full justify-center justify-self-end",
                      )}
                    >
                      <div
                        className="relative max-w-full shrink-0 overflow-hidden rounded-xl bg-muted/40"
                        style={{
                          width: expanded ? "100%" : 72,
                          height: expanded ? 188 : 72,
                          minWidth: expanded ? undefined : 72,
                          minHeight: expanded ? undefined : 72,
                          transition: `width ${durMs}ms ${easeCard}, height ${durMs}ms ${easeCard}`,
                        }}
                      >
                      {v.variant?.imageUrl ? (
                        <SafeImage
                          src={v.variant.imageUrl}
                          alt={v.variant?.model?.name}
                          fill
                          className={cn(
                            expanded ? "object-cover object-right" : "object-contain object-center",
                          )}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-neutral-400">
                          {expanded ? "No image" : "—"}
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setExpandedVehicleId(null);
            onSelect(vehicles.length);
          }}
          className={cn(
            "mt-auto flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors",
            isAddSlot
              ? "border-[#E22028] bg-red-50/50 dark:bg-red-950/20"
              : "border-neutral-300 bg-white hover:border-[#E22028]/50 dark:border-neutral-700 dark:bg-neutral-950",
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md" style={{ backgroundColor: BRAND }}>
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-[12px] font-medium text-neutral-600 dark:text-neutral-400">Thêm xe</span>
        </button>
      </div>
    </section>
  );
}

