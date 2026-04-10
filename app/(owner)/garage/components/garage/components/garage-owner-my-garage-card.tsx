"use client";

import Link from "next/link";
import { Building2, ChevronRight, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SafeImage from "@/components/ui/SafeImage";
import { useResubmitGarage } from "@/hooks/useGarage";
import {
  GarageStatus,
  getGarageStatusLabelVi,
  isGarageStatusActive,
  type GarageMeDto,
} from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

interface GarageOwnerMyGarageCardProps {
  garage: GarageMeDto;
  /** `null` khi garage chờ duyệt — không điều hướng tới dashboard. */
  dashboardHref: string | null;
}

export function GarageOwnerMyGarageCard({ garage, dashboardHref }: GarageOwnerMyGarageCardProps) {
  const businessName = garage.businessName ?? "Garage";
  const shortName = garage.shortName ?? "—";
  const logoUrl = garage.logoUrl?.trim() || null;
  const canOpenDashboard = Boolean(dashboardHref);
  const isRejected = garage.status === GarageStatus.Rejected;
  const resubmit = useResubmitGarage();

  const inner = (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 transition-all duration-200",
        canOpenDashboard
          ? "group-hover:border-primary/35 group-hover:shadow-md"
          : !isRejected && "cursor-not-allowed opacity-90",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-accent/5" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/15 text-primary shadow-inner">
            {logoUrl ? (
              <SafeImage src={logoUrl} alt={businessName} fill className="object-cover" />
            ) : (
              <Building2 className="size-6" />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold md:text-xl">{businessName}</p>
            <p className="text-sm text-muted-foreground">{shortName}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Badge variant={isGarageStatusActive(garage.status) ? "default" : "secondary"}>
            {getGarageStatusLabelVi(garage.status)}
          </Badge>
          {canOpenDashboard ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-1.5">
              Vào dashboard
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          ) : null}
        </div>
      </div>
      <div className="relative mt-4 space-y-2 border-t border-border/50 pt-4 text-sm text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Mã số thuế:</span> {garage.taxCode ?? "—"}
        </p>
        <p>
          <span className="font-medium text-foreground">Số chi nhánh:</span> {garage.branchCount}
        </p>
        {isRejected ? (
          <div className="pt-2">
            <Button
              type="button"
              size="sm"
              className="rounded-lg"
              disabled={resubmit.isPending}
              onClick={() => resubmit.mutate(garage.id)}
            >
              {resubmit.isPending ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
              Gửi lại hồ sơ
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <Card className="border-border/80 bg-card/80 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Garage của tôi</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {canOpenDashboard ? (
          <Link
            href={dashboardHref!}
            className="group block rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            {inner}
          </Link>
        ) : (
          <div className="block rounded-xl" aria-disabled="true">
            {inner}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
