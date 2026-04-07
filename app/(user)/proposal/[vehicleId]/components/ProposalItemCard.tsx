"use client";

import { Calendar, Gauge, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <li className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-4 transition-all hover:border-primary/30 hover:bg-card/70 hover:shadow-sm">
      {/* Background accent */}
      <div className="absolute right-0 top-0 -z-10 translate-x-1/2 -translate-y-1/2 text-primary opacity-0 blur-xl transition-opacity group-hover:opacity-5">
         <Sparkles className="size-24" />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-bold text-foreground">
              {it.itemName}
            </p>
          </div>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            {it.partCategoryName}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-base font-bold tabular-nums text-foreground">
            {formatVnd(it.price)}
          </p>
        </div>
      </div>

      {/* Intervals */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2.5 rounded-xl border border-sky-500/10 bg-sky-500/5 px-3 py-2.5 dark:bg-sky-500/10 transition-colors group-hover:bg-sky-500/8">
          <div className="grid size-7 place-items-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Calendar className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-sky-700/60 dark:text-sky-300/60">
              Tháng
            </p>
            <p className="truncate text-xs font-bold tabular-nums text-foreground sm:text-sm">
              {it.recommendedMonthsInterval != null
                ? `${it.recommendedMonthsInterval} tháng`
                : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-violet-500/10 bg-violet-500/5 px-3 py-2.5 dark:bg-violet-500/10 transition-colors group-hover:bg-violet-500/8">
          <div className="grid size-7 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Gauge className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-violet-700/60 dark:text-violet-300/60">
              Số km
            </p>
            <p className="truncate text-xs font-bold tabular-nums text-foreground sm:text-sm">
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
