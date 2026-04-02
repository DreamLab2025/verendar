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

export function BranchMapCard({ branch, branchMe, statusLabel, pending }: BranchMapCardProps) {
  const { line } = addressLines(branchMe);

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <div className="border-b border-border/60 p-5 sm:p-7">
        <div className="flex min-w-0 gap-4">
          <MapPin className="mt-0.5 size-6 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Địa chỉ</h3>
          </div>
        </div>
      </div>
      <div className="px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
        <div className="mb-3">
          <p className="text-base font-medium leading-snug text-foreground">{line}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/60">
          <div className="relative aspect-4/3 w-full min-h-56 bg-muted">
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
