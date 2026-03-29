"use client";

import Link from "next/link";
import { Bike, CarFront, ChevronRight, Gauge, Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { UserVehicle } from "@/lib/api/services/fetchUserVehicle";
import { cn } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";
import { LicensePlateBadge } from "@/components/shared/LicensePlateBadge";
import { Button } from "@/components/ui/button";

export type VehicleHomeProps = {
  vehicles: UserVehicle[];
  onRequestAddVehicle: () => void;
  isAddSlot: boolean;
};

const CARD_BG = "/images/Card_bg.png";

function formatOdometerVi(n: number) {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 360, damping: 28 },
  },
};

function MobileHomeVehicleCard({ vehicle: v }: { vehicle: UserVehicle }) {
  const brand = v.variant?.model?.brandName ?? "Xe";
  const modelName = v.variant?.model?.name ?? "—";
  const avg = v.averageKmPerDay;
  const avgLabel = avg > 0 ? `${Math.round(avg)} km` : "—";

  return (
    <motion.li variants={cardVariants} className="list-none">
      <Link
        href={`/vehicle/${v.id}`}
        className="block rounded-2xl shadow-lg shadow-black/25 outline-none transition-transform active:scale-[0.99] "
        aria-label={`${brand} ${modelName}, biển ${v.licensePlate}, xem chi tiết`}
      >
        <article className="relative isolate min-h-40 overflow-hidden rounded-2xl ring-1 ring-white/15">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${CARD_BG})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent" aria-hidden />
          <div className="relative z-1 flex flex-col gap-3.5 p-3.5 sm:p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-white p-1 shadow-md ring-1 ring-black/5">
                  {v.variant?.imageUrl ? (
                    <SafeImage src={v.variant.imageUrl} alt="" fill className="object-contain object-center" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-300">
                      <CarFront className="size-5" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                    {brand}
                  </p>
                  <p className="truncate text-sm text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">{modelName}</p>
                </div>
              </div>
              <div className="shrink-0 scale-[0.92] origin-top-right sm:scale-100">
                <LicensePlateBadge licensePlate={v.licensePlate} size="sm" className="shadow-md" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2.5 backdrop-blur-[6px]">
                <div className="flex items-center gap-1 text-[11px] font-medium text-white/70">
                  <Gauge className="size-3.5 shrink-0 opacity-90" aria-hidden />
                  <span>Số km</span>
                </div>
                <p className="mt-1 truncate text-lg font-bold tabular-nums tracking-tight text-white drop-shadow-sm">
                  {formatOdometerVi(v.currentOdometer)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 px-2 py-2.5 backdrop-blur-[6px]">
                <div className="flex items-center gap-1 text-[11px] font-medium text-white/70">
                  <Bike className="size-3.5 shrink-0 opacity-90" aria-hidden />
                  <span>TB/ngày</span>
                </div>
                <p className="mt-1 truncate text-lg font-bold tabular-nums tracking-tight text-white drop-shadow-sm">
                  {avgLabel}
                </p>
              </div>
              <div className="flex min-h-[72px] items-center justify-center rounded-xl border border-white/20 bg-primary/85 px-2 py-2 text-center shadow-inner backdrop-blur-xs">
                <span className="flex items-center gap-0.5 text-sm font-semibold text-white drop-shadow-sm">
                  Chi tiết
                  <ChevronRight className="size-4 opacity-95" aria-hidden />
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.li>
  );
}

export function VehicleHome({ vehicles, onRequestAddVehicle, isAddSlot }: VehicleHomeProps) {
  return (
    <section className="flex w-full flex-col gap-5">
      <motion.ul className="flex flex-col gap-4 p-2" variants={listVariants} initial="hidden" animate="show">
        {vehicles.map((v) => (
          <MobileHomeVehicleCard key={v.id} vehicle={v} />
        ))}
      </motion.ul>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 32, delay: 0.12 }}
        className="mx-2"
      >
        <Button
          type="button"
          variant="outline"
          className="flex h-14 w-full justify-center border-2 border-dashed border-primary rounded-2xl text-base shadow-md"
          onClick={onRequestAddVehicle}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                isAddSlot ? "bg-muted" : "bg-primary-foreground/15",
              )}
            >
              <Plus className="size-5" aria-hidden />
            </span>
            <span className="font-medium">Thêm xe</span>
          </span>
        </Button>
      </motion.div>
    </section>
  );
}
