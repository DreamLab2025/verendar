"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Phone } from "lucide-react";

import { branchDetailHref } from "@/app/(owner)/garage-dashboard/[id]/branch/components/branch-tab-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import {
  formatGarageBranchAddress,
  getGarageBranchStatusLabelVi,
  type GarageBranchDto,
} from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";
import { AwsBranchMiniMap } from "@/components/maps/aws-branch-mini-map";

interface GarageOwnerBranchCardProps {
  branch: GarageBranchDto;
  /** Có thì hiển thị nút mở trang chi nhánh trên garage-dashboard. */
  garageId?: string;
  /** `row`: một dòng — map trái, nội dung phải (nhân viên 1 chi nhánh). */
  variant?: "default" | "row";
}

function isPendingBranch(status: string): boolean {
  return status === "Pending";
}

function BranchMapBlock({
  branch,
  pending,
  statusLabel,
  className,
  /** Ẩn badge trạng thái trên map (dùng badge ở góc card). */
  hideStatusOnMap = false,
}: {
  branch: GarageBranchDto;
  pending: boolean;
  statusLabel: string;
  className?: string;
  hideStatusOnMap?: boolean;
}) {
  return (
    <div className={cn("relative bg-muted", className)}>
      <div className="absolute inset-0 bg-linear-to-b from-muted to-muted/60" aria-hidden />
      <span className="sr-only">
        Bản đồ. Tọa độ {branch.latitude}, {branch.longitude}
      </span>
      <div className="absolute inset-x-2 top-2 z-1 flex flex-wrap items-start justify-between gap-2 sm:inset-x-3 sm:top-3">
        <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium text-background sm:px-2.5 sm:py-1 sm:text-xs">
          Chi nhánh
        </span>
        {!hideStatusOnMap ? (
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:py-1 sm:text-xs",
              pending
                ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                : "border-border bg-background text-muted-foreground",
            )}
          >
            {statusLabel}
          </span>
        ) : null}
      </div>
      <div className="absolute inset-0 z-0">
        <AwsBranchMiniMap
          className="rounded-none"
          latitude={branch.latitude}
          longitude={branch.longitude}
          name={branch.name?.trim() || "—"}
          statusLabel={statusLabel}
        />
      </div>
    </div>
  );
}

function CardStatusBadge({ pending, statusLabel, className }: { pending: boolean; statusLabel: string; className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-xs",
        pending
          ? "border-sky-200 bg-sky-50/95 text-sky-800 dark:border-sky-800 dark:bg-sky-950/80 dark:text-sky-200"
          : "border-border/80 bg-background/95 text-muted-foreground",
        className,
      )}
    >
      {statusLabel}
    </span>
  );
}

export function GarageOwnerBranchCard({ branch, garageId, variant = "default" }: GarageOwnerBranchCardProps) {
  const router = useRouter();
  const pending = isPendingBranch(branch.status);
  const statusLabel = pending ? "Đang chờ duyệt" : getGarageBranchStatusLabelVi(branch.status);
  const addressLine = formatGarageBranchAddress(branch.address);

  if (variant === "row") {
    const href = garageId ? branchDetailHref(garageId, branch.id, "overview") : undefined;

    const body = (
      <>
        <CardStatusBadge
          pending={pending}
          statusLabel={statusLabel}
          className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3"
        />
        <BranchMapBlock
          branch={branch}
          pending={pending}
          statusLabel={statusLabel}
          hideStatusOnMap
          className="min-h-38 w-[min(40%,10.5rem)] shrink-0 sm:min-h-44 sm:w-44 md:w-52"
        />
        <CardContent className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 p-3 sm:gap-3 sm:p-4 md:p-5">
          <div className="min-w-0 space-y-0.5">
            <CardTitle className="text-base font-semibold leading-snug tracking-tight sm:text-lg">
              {branch.name?.trim() || "—"}
            </CardTitle>
            <CardDescription className="line-clamp-1 font-mono text-[11px] sm:text-xs">
              {branch.slug?.trim() || "—"}
            </CardDescription>
          </div>

          <p className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <Phone className="size-3.5 shrink-0 stroke-[1.5] sm:size-4" aria-hidden />
            <span className="min-w-0 truncate tabular-nums">{branch.phoneNumber?.trim() || "—"}</span>
          </p>

          <p className="flex gap-2 text-xs text-muted-foreground sm:text-sm">
            <MapPin className="mt-0.5 size-3.5 shrink-0 stroke-[1.5] sm:size-4" aria-hidden />
            <span className="line-clamp-2 leading-snug">{addressLine}</span>
          </p>
        </CardContent>
      </>
    );

    return (
      <Card
        className={cn(
          "relative flex flex-row gap-0 overflow-hidden p-0",
          href && "border-border/80 transition-[border-color] duration-200 hover:border-primary",
        )}
      >
        {href ? (
          <Link
            href={href}
            className="relative flex min-h-0 w-full min-w-0 flex-1 flex-row outline-none ring-offset-background transition-colors hover:bg-muted/20 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {body}
          </Link>
        ) : (
          <div className="relative flex w-full flex-row">{body}</div>
        )}
      </Card>
    );
  }

  return (
    <Card className="h-full gap-0 overflow-hidden p-0">
      <div className="relative aspect-4/3 w-full min-h-48 bg-muted sm:min-h-56 md:min-h-64">
        <div className="absolute inset-0 bg-linear-to-b from-muted to-muted/60" aria-hidden />
        <span className="sr-only">
          Bản đồ (tạm trống). Tọa độ {branch.latitude}, {branch.longitude}
        </span>
        <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
              Chi nhánh
            </span>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
              pending
                ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                : "border-border bg-background text-muted-foreground",
            )}
          >
            {statusLabel}
          </span>
        </div>
        <div className="absolute inset-0 z-0">
          <AwsBranchMiniMap
            className="rounded-none"
            latitude={branch.latitude}
            longitude={branch.longitude}
            name={branch.name?.trim() || "—"}
            statusLabel={statusLabel}
          />
        </div>
      </div>

      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
            {branch.name?.trim() || "—"}
          </CardTitle>
          <CardDescription className="font-mono text-xs">{branch.slug?.trim() || "—"}</CardDescription>
        </div>

        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="size-4 shrink-0 stroke-[1.5]" aria-hidden />
          <span className="tabular-nums">{branch.phoneNumber?.trim() || "—"}</span>
        </p>

        <p className="flex gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 stroke-[1.5]" aria-hidden />
          <span>{addressLine}</span>
        </p>

        {garageId ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1 w-full gap-2 font-medium sm:w-auto"
            onClick={() => router.push(branchDetailHref(garageId, branch.id, "overview"))}
          >
            Xem chi tiết
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
