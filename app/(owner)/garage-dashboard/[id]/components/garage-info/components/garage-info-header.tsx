"use client";

import { CarFront } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyGarageQuery } from "@/hooks/useGarage";
import { cn } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";

interface GarageInfoHeaderProps {
  garageId: string;
}

export function GarageInfoHeader({ garageId }: GarageInfoHeaderProps) {
  const { data: meRes, isPending, isError } = useMyGarageQuery(Boolean(garageId));

  if (isPending) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <Skeleton className="h-36 w-full rounded-none md:h-44" />
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6 md:px-8">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-5">
            <Skeleton className="-mt-16 size-24 shrink-0 rounded-full border-4 border-background sm:-mt-20 sm:size-28" />
            <div className="min-w-0 space-y-2 sm:pb-1">
              <Skeleton className="h-8 w-48 max-w-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-40 shrink-0 rounded-xl" />
        </div>
      </div>
    );
  }

  const garage =
    meRes?.isSuccess && meRes.data && meRes.data.id === garageId ? meRes.data : null;

  if (isError || !garage) {
    return (
      <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground md:px-8">
        {isError
          ? "Không tải được thông tin garage. Thử tải lại trang."
          : "Không tìm thấy garage khớp với tài khoản của bạn."}
      </div>
    );
  }

  const businessName = garage.businessName?.trim() || "Garage";
  const shortName = garage.shortName?.trim();
  const logoUrl = garage.logoUrl?.trim();


  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div
        className={cn(
          "relative h-36 md:h-44",
          "bg-linear-to-br from-primary/30 via-primary/15 to-muted/80",
          "dark:from-primary/20 dark:via-primary/10 dark:to-muted/40",
        )}
        aria-hidden
      />

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-6 md:px-8">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-5">
          <div className="-mt-16 shrink-0 sm:-mt-20">
            <div
              className={cn(
                "flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-background shadow-md sm:size-28",
                "ring-1 ring-border/60",
              )}
            >
              {logoUrl ? (
                <SafeImage src={logoUrl} alt={businessName} width={100} height={100} className="size-full object-cover" />
              ) : (
                <CarFront className="size-10 text-muted-foreground sm:size-12" aria-hidden />
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-2 sm:pb-1">
            <h1 className="text-xl font-bold uppercase leading-tight tracking-tight text-foreground md:text-2xl">
              {businessName}
            </h1>
            {shortName ? (
              <Badge variant="secondary" className="font-medium">
                {shortName}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
