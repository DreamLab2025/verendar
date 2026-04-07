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
  History,
  LayoutGrid,
  Loader2,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEFAULT_PAGE_SIZE,
  useMaintenanceProposalsQuery,
} from "@/hooks/useMaintenanceProposals";
import { useUserVehicle } from "@/hooks/useUserVehice";
import { cn } from "@/lib/utils";

// Extracted Components
import { VehicleInfoBanner } from "./components/VehicleInfoBanner";
import { ProposalCard } from "./components/ProposalCard";

const layoutSync = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

export function MaintenanceProposalsPageClient() {
  const params = useParams();
  const vehicleId =
    typeof params.vehicleId === "string" ? params.vehicleId : undefined;
  const [page, setPage] = useState(1);

  const { vehicle, isLoading: vehicleLoading } = useUserVehicle(vehicleId || "");
  const q = useMaintenanceProposalsQuery(vehicleId, page, DEFAULT_PAGE_SIZE);

  const meta = q.data?.metadata;
  const totalPages = meta?.totalPages ?? 0;
  const hasNext = meta?.hasNextPage ?? false;
  const hasPrev = meta?.hasPreviousPage ?? false;

  // Statistics for the sidebar
  const list = useMemo(() => q.data?.data ?? [], [q.data?.data]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F9F8F6] px-4 pb-6 pt-3 dark:bg-neutral-950 sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
        {/* Navigation & Header sync with home-panel */}
        <header className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-9 gap-1.5 rounded-xl border border-transparent text-neutral-500 hover:border-neutral-200 hover:bg-white dark:text-neutral-400 dark:hover:border-neutral-800 dark:hover:bg-neutral-900 transition-colors"
              asChild
            >
              <Link href={vehicleId ? `/vehicle/${vehicleId}` : "/"}>
                <ArrowLeft className="size-4" />
                <span className="text-[13px] font-semibold tracking-tight">Quay lại xe</span>
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
                Dịch vụ & Bảo dưỡng
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {vehicleId ? (
              <div className="flex-1 max-w-2xl">
                <VehicleInfoBanner vehicleId={vehicleId} />
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-neutral-200/70 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40">
                <div className="grid size-12 place-items-center rounded-xl bg-neutral-50 text-neutral-400 shadow-inner dark:bg-neutral-800">
                  <Wrench className="size-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-[16px] font-bold text-neutral-900 dark:text-neutral-100">Đề xuất bảo dưỡng</h1>
                  <p className="text-[13px] text-neutral-500 font-medium">Vui lòng chọn phương tiện để xem chi tiết.</p>
                </div>
              </div>
            )}

            {!q.isPending && !q.isError && list.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden lg:inline-flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60 transition-transform hover:scale-[1.02]"
              >
                <div className="grid size-6 place-items-center rounded-lg bg-neutral-100/50 dark:bg-neutral-800">
                  <ClipboardList className="size-3.5 text-neutral-500" strokeWidth={2.5} />
                </div>
                <span className="text-[13px] font-black tracking-tight text-neutral-900 dark:text-neutral-100">{list.length} đề xuất</span>
              </motion.div>
            )}
          </div>
        </header>

        {/* Main Content Area: 2-Column Layout */}
        <main className="flex min-h-0 flex-1 flex-col gap-8 lg:flex-row">

          {/* Left Column: Proposals List */}
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1 scrollbar-hide overscroll-contain">
            {!vehicleId ? (
              <div className="rounded-3xl border-2 border-dashed border-neutral-200 bg-white/50 px-4 py-20 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/20">
                Thiếu mã xe.
              </div>
            ) : q.isPending ? (
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-6 border border-neutral-200 bg-white p-6 rounded-3xl shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60 animate-pulse">
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
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-600 shadow-sm dark:border-red-900/30 dark:bg-red-950/20">
                {q.error instanceof Error ? q.error.message : "Đã xảy ra lỗi khi tải dữ liệu."}
              </div>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed border-neutral-200/70 bg-white/50 py-24 text-center dark:border-neutral-800 dark:bg-neutral-900/20">
                <div className="grid size-16 place-items-center rounded-3xl bg-neutral-100 text-neutral-300 shadow-inner dark:bg-neutral-800 dark:text-neutral-700">
                  <LayoutGrid className="size-8" strokeWidth={1} />
                </div>
                <div className="space-y-1.5 px-6">
                  <h3 className="text-[17px] font-bold text-neutral-900 dark:text-neutral-100">Chưa có đề xuất mới</h3>
                  <p className="text-[13px] leading-relaxed text-neutral-500 max-w-[280px]">Hiện tại phương tiện này chưa có đề xuất bảo dưỡng nào cần được xử lý.</p>
                </div>
                <Button variant="outline" className="mt-2 h-11 rounded-xl font-bold bg-white shadow-sm dark:bg-neutral-900" asChild>
                  <Link href={`/vehicle/${vehicleId}`}>Trở về chi tiết xe</Link>
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-8 pb-10">
                  {list.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ProposalCard vehicleId={vehicleId} p={p} />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>

          {/* Right Column: Statistics/Sidebar (Sticky) */}
          <aside className="shrink-0 space-y-6 lg:w-[30%] xl:w-[26%]">
            {!q.isPending && list.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={layoutSync}
                className="sticky top-0 space-y-6"
              >
                {/* Tip Card */}
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-6 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/30">
                  <p className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-[0.25em] mb-4">
                    <History className="size-3.5 opacity-60" />
                    Gợi ý bảo trì
                  </p>
                  <p className="text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400 italic font-medium">
                    Bảo dưỡng đúng hạn giúp đảm bảo sự an toàn tuyệt đối và duy trì giá trị xe bền vững theo thời gian.
                  </p>
                </div>
              </motion.div>
            )}
          </aside>
        </main>

        {/* Pagination Section fix padding */}
        {vehicleId && !q.isPending && !q.isError && list.length > 0 && totalPages > 1 ? (
          <footer className="mt-auto shrink-0 border-t border-neutral-200/60 bg-white/60 py-5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/60 -mx-4 px-4 sm:rounded-b-3xl sm:-mx-6 sm:px-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl font-bold bg-white text-neutral-600 shadow-xs transition-all active:scale-95 dark:bg-neutral-900 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
                disabled={!hasPrev || q.isFetching}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <ChevronLeft className="mr-1 size-4" />
                Trước
              </Button>

              <div className="h-10 flex px-6 items-center bg-neutral-100/80 rounded-xl dark:bg-neutral-800/80 border border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-[11px] font-black text-neutral-500 uppercase tracking-widest tabular-nums">
                  Trang {meta?.pageNumber ?? page} <span className="opacity-30 mx-2 text-[8px]">/</span> {totalPages}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 rounded-xl font-bold bg-white text-neutral-600 shadow-xs transition-all active:scale-95 dark:bg-neutral-900 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
                disabled={!hasNext || q.isFetching}
                onClick={() => {
                  setPage((p) => p + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Kế tiếp
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
            {q.isFetching && (
              <div className="absolute left-1/2 -top-1 -translate-x-1/2">
                <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-[9px] font-black text-neutral-400 uppercase tracking-[0.15em] shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <Loader2 className="size-3 animate-spin" />
                  Đang tải...
                </div>
              </div>
            )}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
