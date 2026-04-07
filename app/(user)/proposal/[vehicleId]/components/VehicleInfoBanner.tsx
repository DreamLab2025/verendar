"use client";

import { Car, Gauge, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SafeImage from "@/components/ui/SafeImage";
import { useUserVehicle } from "@/hooks/useUserVehice";
import { cn } from "@/lib/utils";
import { LicensePlateBadge } from "@/components/shared/LicensePlateBadge";

interface VehicleInfoBannerProps {
  vehicleId: string;
}

export function VehicleInfoBanner({ vehicleId }: VehicleInfoBannerProps) {
  const { vehicle, isLoading } = useUserVehicle(vehicleId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-neutral-200/70 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 animate-pulse">
        <Skeleton className="size-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-neutral-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="grid size-12 place-items-center rounded-xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
          <Car className="size-6" />
        </div>
        <h1 className="text-[16px] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Thông tin xe</h1>
      </div>
    );
  }

  const model = vehicle.variant?.model;
  const brand = model?.brandName;
  const modelName = model?.name;
  const displayName = model ? `${brand} ${modelName}` : "Thông tin xe";
  const year = model?.releaseYear;
  const color = vehicle.variant?.color;
  const imageUrl = vehicle.variant?.imageUrl;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-5 overflow-hidden rounded-xl border border-neutral-200/70 bg-linear-to-br from-[#F9F8F6] to-neutral-100/40 p-4 shadow-sm transition-all hover:border-neutral-300 dark:border-neutral-800 dark:from-neutral-950 dark:to-neutral-900/80",
      )}
    >
      {/* Red accent circle like in home dashboard */}
      <div 
        className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-[#E22028]/[0.07] blur-2xl dark:bg-[#E22028]/10" 
        aria-hidden 
      />

      {/* Vehicle image thumbnail */}
      <div
        className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200/50 bg-white shadow-sm transition-transform group-hover:scale-105 dark:border-neutral-800 dark:bg-neutral-900"
      >
        {imageUrl ? (
          <SafeImage
            src={imageUrl}
            alt={displayName}
            width={64}
            height={64}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <Car className="size-8 text-neutral-300 dark:text-neutral-700" />
        )}
      </div>

      <div className="relative min-w-0 flex-1 border-l-2 border-[#E22028] pl-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
          Xe đang chọn
        </p>
        
        <div className="mt-1 flex items-center gap-2">
          <h1 className="truncate text-[17px] font-semibold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50">
            {displayName}
          </h1>
          {year && (
            <span 
              className="shrink-0 rounded-full px-2 py-0.5 text-[8px] font-black text-white bg-[#E22028] shadow-sm"
            >
              {year}
            </span>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          {vehicle.licensePlate && (
            <LicensePlateBadge 
              licensePlate={vehicle.licensePlate} 
              size="sm" 
              className="scale-[0.8] origin-left border-black/20"
            />
          )}

          <div className="flex items-center gap-3 text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <Sparkles className="size-3 text-neutral-400" />
              {color || "Màu sắc"}
            </span>

            {vehicle.currentOdometer != null && (
              <span className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
                <Gauge className="size-3 text-neutral-400" />
                <span className="tabular-nums">
                  {vehicle.currentOdometer.toLocaleString("vi-VN")} km
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
