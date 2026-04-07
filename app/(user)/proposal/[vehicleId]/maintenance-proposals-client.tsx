"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutGrid,
  Loader2,
  Sparkles,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEFAULT_PAGE_SIZE,
  useMaintenanceProposalsQuery,
} from "@/hooks/useMaintenanceProposals";

// Extracted Components
import { VehicleInfoBanner } from "./components/VehicleInfoBanner";
import { ProposalCard } from "./components/ProposalCard";

const layoutSync = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

export function MaintenanceProposalsPageClient() {
  const params = useParams();
  const vehicleId =
    typeof params.vehicleId === "string" ? params.vehicleId : undefined;
  const [page, setPage] = useState(1);

  const q = useMaintenanceProposalsQuery(vehicleId, page, DEFAULT_PAGE_SIZE);

  const meta = q.data?.metadata;
  const totalPages = meta?.totalPages ?? 0;
  const hasNext = meta?.hasNextPage ?? false;
  const hasPrev = meta?.hasPreviousPage ?? false;

  // Statistics for the sidebar
  const list = useMemo(() => q.data?.data ?? [], [q.data?.data]);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-2 pb-2 pt-1 sm:px-3 sm:pb-3 sm:pt-2 lg:px-4">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pr-1 sm:gap-3">
        <header className="rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border/50 bg-muted/20 px-3 py-3 sm:px-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-1 h-9 gap-1.5 rounded-lg text-muted-foreground"
                asChild
              >
                <Link href={vehicleId ? `/vehicle/${vehicleId}` : "/"}>
                  <ArrowLeft className="size-4" />
                  <span className="text-[13px] font-semibold tracking-tight">Quay lại xe</span>
                </Link>
              </Button>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <Sparkles className="size-3" />
                Bảo dưỡng
              </span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Đề xuất bảo dưỡng
                </h1>
                <p className="max-w-xl text-sm text-muted-foreground">
                  Theo dõi đề xuất dịch vụ, cập nhật thông tin ODO, và xác nhận nhanh để giữ xe luôn ở trạng thái tốt nhất.
                </p>
              </div>

              {!q.isPending && !q.isError && list.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2"
                >
                  <div className="grid size-8 place-items-center rounded-lg bg-muted/40 text-muted-foreground">
                    <ClipboardList className="size-4" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Trang hiện tại
                    </p>
                    <p className="text-sm font-semibold tracking-tight text-foreground">
                      {list.length} đề xuất
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {vehicleId ? (
              <VehicleInfoBanner vehicleId={vehicleId} />
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4">
                <div className="grid size-12 place-items-center rounded-xl bg-muted/40 text-muted-foreground">
                  <Wrench className="size-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Đề xuất bảo dưỡng</h2>
                  <p className="text-sm text-muted-foreground">
                    Vui lòng chọn phương tiện để xem chi tiết.
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">
          {!vehicleId ? (
            <div className="rounded-xl border border-dashed border-border/50 bg-card/30 px-4 py-20 text-center text-sm text-muted-foreground">
              Thiếu mã xe.
            </div>
          ) : q.isPending ? (
            <div className="space-y-5">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="space-y-6 rounded-xl border border-border/60 bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-48 rounded-lg" />
                      <Skeleton className="h-4 w-32 rounded-lg" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : q.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-destructive">
              {q.error instanceof Error ? q.error.message : "Đã xảy ra lỗi khi tải dữ liệu."}
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-border/50 bg-card/30 py-24 text-center">
              <div className="grid size-16 place-items-center rounded-2xl bg-muted/40 text-muted-foreground">
                <LayoutGrid className="size-8" strokeWidth={1} />
              </div>
              <div className="space-y-1.5 px-6">
                <h3 className="text-base font-semibold text-foreground">Chưa có đề xuất mới</h3>
                <p className="max-w-[320px] text-sm text-muted-foreground">
                  Hiện tại phương tiện này chưa có đề xuất bảo dưỡng nào cần được xử lý.
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-2 h-10 rounded-lg"
                asChild
              >
                <Link href={`/vehicle/${vehicleId}`}>Trở về chi tiết xe</Link>
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3 pb-6">
                {list.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: idx * 0.08,
                      duration: 0.38,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <ProposalCard vehicleId={vehicleId} p={p} />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </main>

        {vehicleId && !q.isPending && !q.isError && list.length > 0 && totalPages > 1 ? (
          <footer className="sticky bottom-0 z-10 mt-auto shrink-0 rounded-xl border border-border/60 bg-card/95 px-3 py-3 shadow-sm backdrop-blur sm:px-4">
            <div className="relative flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
                disabled={!hasPrev || q.isFetching}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <ChevronLeft className="mr-1 size-4" />
                Trước
              </Button>

              <div className="flex flex-1 items-center justify-center">
                <span className="inline-flex h-9 items-center rounded-lg border border-border/60 bg-muted/30 px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Trang {meta?.pageNumber ?? page}
                  <span className="mx-2 text-[8px] opacity-40">/</span>
                  {totalPages}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
                disabled={!hasNext || q.isFetching}
                onClick={() => {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Kế tiếp
                <ChevronRight className="ml-1 size-4" />
              </Button>
            {q.isFetching && (
              <div className="absolute left-1/2 -top-3 -translate-x-1/2">
                <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground shadow-sm">
                  <Loader2 className="size-3 animate-spin" />
                  Đang tải
                </div>
              </div>
            )}
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
