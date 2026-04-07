"use client";

import { Calendar, Gauge, Sparkles } from "lucide-react";
import type { MaintenanceProposalLineDto } from "@/lib/api/services/fetchMaintenanceProposals";

interface ProposalItemCardProps {
  it: MaintenanceProposalLineDto;
}

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ProposalItemCard({ it }: ProposalItemCardProps) {
  return (
    <li className="group relative overflow-hidden rounded-lg border border-border/60 bg-card p-3.5 transition-all hover:bg-muted/20">
      {/* Background accent */}
      <div className="absolute right-0 top-0 -z-10 translate-x-1/2 -translate-y-1/2 text-primary opacity-0 blur-xl transition-opacity group-hover:opacity-[0.04]">
        <Sparkles className="size-24" />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-foreground">
              {it.itemName}
            </p>
          </div>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {it.partCategoryName}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[15px] font-semibold tabular-nums text-foreground">
            {formatVnd(it.price)}
          </p>
        </div>
      </div>

      {/* Intervals */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/20 px-2.5 py-2">
          <div className="grid size-7 place-items-center rounded-md bg-background text-muted-foreground">
            <Calendar className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Tháng
            </p>
            <p className="truncate text-xs font-semibold tabular-nums text-foreground sm:text-sm">
              {it.recommendedMonthsInterval != null
                ? `${it.recommendedMonthsInterval} tháng`
                : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/20 px-2.5 py-2">
          <div className="grid size-7 place-items-center rounded-md bg-background text-muted-foreground">
            <Gauge className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Số km
            </p>
            <p className="truncate text-xs font-semibold tabular-nums text-foreground sm:text-sm">
              {it.recommendedKmInterval != null
                ? `${it.recommendedKmInterval.toLocaleString("vi-VN")} km`
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}
