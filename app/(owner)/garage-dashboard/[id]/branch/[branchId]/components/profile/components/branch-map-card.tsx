"use client";

import { MapPin } from "lucide-react";

import { AwsBranchMiniMap } from "@/components/maps/aws-branch-mini-map";
import { Card } from "@/components/ui/card";
import { formatGarageBranchAddress, type GarageBranchDto, type GarageBranchMeDto } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

type BranchMapCardProps = {
  branch: GarageBranchDto;
  branchMe: GarageBranchMeDto;
  statusLabel: string;
  pending: boolean;
  isMobile: boolean;
};

function addressLines(me: GarageBranchMeDto) {
  const addr = me.address;
  const full = formatGarageBranchAddress(addr);
  if (addr && typeof addr === "object") {
    return {
      line: full,
      province: addr.provinceCode?.trim() || "—",
      ward: addr.wardCode?.trim() || "—",
    };
  }
  return { line: full, province: "—", ward: "—" };
}

export function BranchMapCard({ branch, branchMe, statusLabel, pending, isMobile }: BranchMapCardProps) {
  const { line } = addressLines(branchMe);
  const pad = isMobile ? "p-4" : "p-5 sm:p-7";
  const bodyPad = isMobile ? "px-4 pb-5 pt-4" : "px-5 pb-6 pt-5 sm:px-7 sm:pb-7";

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <div className={cn("border-b border-border/60", pad)}>
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground sm:size-6" aria-hidden />
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">Địa chỉ</h3>
          </div>
        </div>
      </div>
      <div className={bodyPad}>
        <div className="mb-3">
          <p className="text-sm font-medium leading-snug text-foreground sm:text-base">{line}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60">
          <div
            className={cn(
              "relative w-full bg-muted",
              isMobile ? "aspect-video min-h-44" : "aspect-4/3 min-h-56",
            )}
          >
            <AwsBranchMiniMap
              className="rounded-none"
              latitude={branch.latitude}
              longitude={branch.longitude}
              name={branch.name?.trim() || "—"}
              statusLabel={statusLabel}
            />
            <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
              <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
                Bản đồ
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full border bg-background/95 px-2.5 py-1 text-xs font-medium backdrop-blur-sm",
                  pending
                    ? "border-sky-200 text-sky-800 dark:border-sky-800 dark:text-sky-200"
                    : "border-border text-muted-foreground",
                )}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
