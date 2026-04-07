"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { 
  Building2, 
  Calendar, 
  ChevronRight, 
  ClipboardEdit, 
  Loader2, 
  MessageSquareQuote, 
  Wallet,
  Gauge
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useApplyMaintenanceProposalMutation } from "@/hooks/useMaintenanceProposals";
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
  const applyMutation = useApplyMaintenanceProposalMutation(vehicleId);
  const [editOpen, setEditOpen] = useState(false);

  const applying = applyMutation.isPending && applyMutation.variables === p.id;
  const isPendingStatus = p.status === "Pending";

  const onApply = () => {
    applyMutation.mutate(p.id, {
      onSuccess: (body) => {
        if (body?.isSuccess) {
          const extra = body.data?.trackingUpdated?.length
            ? ` (Đã cập nhật: ${body.data.trackingUpdated.join(", ")})`
            : "";
          toast.success(
            (body.message?.trim() || "Đã xác nhận áp dụng.") + extra,
          );
        } else {
          toast.error(body?.message?.trim() || "Không xác nhận được.");
        }
      },
      onError: (err: Error) => {
        toast.error(err.message || "Xác nhận thất bại.");
      },
    });
  };

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
          "group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all hover:border-neutral-300",
          "dark:border-neutral-800 dark:bg-neutral-900/60 dark:backdrop-blur-sm",
        )}
      >
        {/* Header Section */}
        <div className="relative border-b border-neutral-100 bg-neutral-50/50 px-5 py-5 dark:border-neutral-800 dark:bg-neutral-900/40 sm:px-6">
          <div className="absolute left-0 top-0 h-full w-[3px]" style={{ backgroundColor: BRAND }} />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-neutral-100 text-neutral-500 shadow-sm dark:bg-neutral-800 dark:text-neutral-400">
                  <Building2 className="size-4" />
                </div>
                <h2 className="truncate text-[16px] font-bold tracking-[0.02em] text-neutral-900 dark:text-neutral-100 uppercase">
                  {p.branchName}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-semibold text-neutral-500 dark:text-neutral-400">
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

            <div className="flex flex-col items-end gap-3">
              <StatusBadge status={p.status} />
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-tighter text-neutral-400 opacity-60">Tổng:</span>
                <p className="text-2xl font-black tabular-nums text-neutral-900 dark:text-neutral-100 tracking-tight">
                  {formatVnd(p.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="px-5 py-6 sm:px-6">
          <div className="space-y-6">
            {/* Items Label Sync */}
            <div className="mb-4">
               <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Tiến độ</p>
               <h3 className="mt-1 flex items-center gap-2 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                 Hạng mục & Định kỳ
                 <ChevronRight className="size-3.5 opacity-30" />
               </h3>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {p.items.map((it) => (
                <ProposalItemCard key={it.id} it={it} />
              ))}
            </ul>

            {/* Info Grid (ODO & Notes) */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
              {/* Service Info (ODO) Section */}
              <div className="relative rounded-2xl border border-neutral-100 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/60 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900/80">
                <div className="absolute right-0 top-0 p-4 opacity-[0.03] rotate-12">
                  <Gauge className="size-12 text-neutral-900 dark:text-neutral-100" />
                </div>
                
                <div className="mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">ODO</p>
                  <h4 className="mt-0.5 text-[14px] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Số km bảo dưỡng</h4>
                </div>

                <p className={cn(
                  "text-[14px] font-bold tabular-nums pl-3 border-l-2 decoration-neutral-200/50",
                  p.odometerAtService != null 
                    ? "text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700" 
                    : "text-neutral-400 dark:text-neutral-500 border-neutral-100 dark:border-neutral-800 italic"
                )}>
                  {p.odometerAtService != null 
                    ? `${p.odometerAtService.toLocaleString("vi-VN")} km` 
                    : "Chưa cập nhật"}
                </p>
              </div>

              {/* User Notes Section */}
              <div className="relative rounded-2xl border border-neutral-100 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/60 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900/80">
                <div className="absolute right-0 top-0 p-4 opacity-[0.03] rotate-12">
                  <MessageSquareQuote className="size-12 text-neutral-900 dark:text-neutral-100" />
                </div>
                
                <div className="mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">Ghi chú</p>
                  <h4 className="mt-0.5 text-[14px] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Đề xuất bảo dưỡng</h4>
                </div>

                <p className={cn(
                  "text-[14px] leading-relaxed italic pl-3 border-l-2",
                  p.notes?.trim() 
                    ? "text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700" 
                    : "text-neutral-400 dark:text-neutral-500 border-neutral-100 dark:border-neutral-800 font-medium"
                )}>
                  {p.notes?.trim() || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (if pending) */}
        {isPendingStatus && (
          <div className="mt-auto border-t border-neutral-100 bg-neutral-50/10 px-5 py-5 dark:border-neutral-800 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 rounded-xl bg-white font-bold text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 hover:shadow dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                disabled={applying}
                onClick={() => setEditOpen(true)}
              >
                <ClipboardEdit className="mr-2 size-4 opacity-70" />
                Cập nhật đề xuất
              </Button>
              <Button
                type="button"
                className="h-11 flex-1 rounded-xl font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] shadow-[#E22028]/20"
                style={{ backgroundColor: BRAND }}
                disabled={applying}
                onClick={onApply}
              >
                {applying ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang chuẩn bị…
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 size-4" />
                    Xác nhận áp dụng
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </article>
    </>
  );
}
