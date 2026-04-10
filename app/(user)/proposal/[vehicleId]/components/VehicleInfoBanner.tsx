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
      <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm animate-pulse">
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
      <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4">
        <div className="grid size-12 place-items-center rounded-xl bg-muted/40 text-muted-foreground">
          <Car className="size-6" />
        </div>
        <h1 className="text-base font-semibold tracking-tight text-foreground">Thông tin xe</h1>
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
        "group relative flex items-center gap-5 overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all",
      )}
    >
      <div
        className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm transition-transform group-hover:scale-105"
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
          <Car className="size-8 text-muted-foreground" />
        )}
      </div>

      <div className="relative min-w-0 flex-1 border-l-2 border-primary/60 pl-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Xe đang chọn
        </p>

        <div className="mt-1 flex items-center gap-2">
          <h1 className="truncate text-[17px] font-semibold leading-tight tracking-tight text-foreground">
            {displayName}
          </h1>
          {year && (
            <span
              className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[8px] font-bold text-primary-foreground shadow-sm"
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
              className="origin-left scale-[0.8] border-black/20"
            />
          )}

          <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="size-3" />
              {color || "Màu sắc"}
            </span>

            {vehicle.currentOdometer != null && (
              <span className="flex items-center gap-1 font-semibold text-foreground/80">
                <Gauge className="size-3" />
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
