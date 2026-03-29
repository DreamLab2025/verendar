import { MapPin, Phone } from "lucide-react";

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
}

function isPendingBranch(status: string): boolean {
  return status === "Pending";
}

export function GarageOwnerBranchCard({ branch }: GarageOwnerBranchCardProps) {
  const pending = isPendingBranch(branch.status);
  const statusLabel = pending ? "Đang chờ duyệt" : getGarageBranchStatusLabelVi(branch.status);
  const addressLine = formatGarageBranchAddress(branch.address);

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
      </CardContent>
    </Card>
  );
}
