"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  Building2,
  Calendar,
  ChevronRight,
  ClipboardEdit,
  MessageSquareQuote,
  Gauge
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MaintenanceProposalDto } from "@/lib/api/services/fetchMaintenanceProposals";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { ProposalItemCard } from "./ProposalItemCard";
import { EditProposalDialog } from "./EditProposalDialog";

const BRAND = "#E22028";

interface ProposalCardProps {
  vehicleId: string;
  p: MaintenanceProposalDto;
}

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ProposalCard({ vehicleId, p }: ProposalCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  const isPendingStatus = p.status === "Pending";

  return (
    <>
      <EditProposalDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        p={p}
        vehicleId={vehicleId}
      />

      <article
        className={cn(
          "group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all",
          "hover:border-border",
        )}
      >
        <div className="relative border-b border-border/50 bg-muted/20 px-4 py-4 sm:px-5">
          <div className="absolute left-0 top-0 h-full w-0.75" style={{ backgroundColor: BRAND }} />

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-background text-muted-foreground shadow-sm">
                  <Building2 className="size-4" />
                </div>
                <h2 className="truncate text-[15px] font-semibold uppercase tracking-[0.02em] text-foreground">
                  {p.branchName}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground">
                <div className="flex items-center gap-1.5 opacity-80 transition-opacity group-hover:opacity-100 line-clamp-1">
                  <Calendar className="size-3.5" />
                  <span>
                    {dayjs(p.serviceDate).isValid()
                      ? dayjs(p.serviceDate).format("dddd, D/M/YYYY")
                      : p.serviceDate}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 opacity-40">
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Ref:</span>
                  <span className="font-mono">{p.id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={p.status} />
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Tổng chi phí
                </span>
                <p className="text-[22px] font-semibold tabular-nums tracking-tight text-foreground">
                  {formatVnd(p.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Hạng mục</p>
              <p className="mt-1 text-[14px] font-semibold text-foreground">{p.items.length} mục</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Ngày bảo dưỡng</p>
              <p className="mt-1 text-[14px] font-semibold text-foreground">
                {dayjs(p.serviceDate).isValid()
                  ? dayjs(p.serviceDate).format("DD/MM/YYYY")
                  : p.serviceDate}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Mã đề xuất</p>
              <p className="mt-1 font-mono text-[14px] font-semibold text-foreground">
                {p.id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-start">
          <section className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Hạng mục dịch vụ</p>
              <h3 className="mt-1 flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
                Danh sách đề xuất
                <ChevronRight className="size-3.5 opacity-30" />
              </h3>
            </div>

            <ul className="grid gap-2.5">
              {p.items.map((it) => (
                <ProposalItemCard key={it.id} it={it} />
              ))}
            </ul>
          </section>

          <aside className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="relative rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="absolute right-0 top-0 p-4 opacity-[0.03]">
                <Gauge className="size-12 text-foreground" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">ODO</p>
              <p
                className={cn(
                  "mt-2 border-l-2 pl-3 text-[14px] tabular-nums",
                  p.odometerAtService != null
                    ? "border-border font-semibold text-foreground"
                    : "border-border/50 text-muted-foreground italic",
                )}
              >
                {p.odometerAtService != null
                  ? `${p.odometerAtService.toLocaleString("vi-VN")} km`
                  : "Chưa cập nhật"}
              </p>
            </div>

            <div className="relative rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="absolute right-0 top-0 p-4 opacity-[0.03]">
                <MessageSquareQuote className="size-12 text-foreground" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Ghi chú</p>
              <p
                className={cn(
                  "mt-2 border-l-2 pl-3 text-[14px] leading-relaxed",
                  p.notes?.trim()
                    ? "border-border text-foreground/80"
                    : "border-border/50 italic text-muted-foreground",
                )}
              >
                {p.notes?.trim() || "Chưa cập nhật"}
              </p>
            </div>

            {isPendingStatus && (
              <div className="flex">
                <Button
                  type="button"
                  variant="default"
                  className="h-9 w-full rounded-lg"
                  onClick={() => setEditOpen(true)}
                >
                  <ClipboardEdit className="mr-2 size-4 opacity-70" />
                  Cập nhật và xác nhận
                </Button>
              </div>
            )}
          </aside>
        </div>
      </article>
    </>
  );
}
