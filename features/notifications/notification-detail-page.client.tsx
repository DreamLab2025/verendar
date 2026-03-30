"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarClock, ExternalLink, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useNotificationById } from "@/hooks/useNotification";
import { cn } from "@/lib/utils";

const BRAND = "#cd2626";
const easeUi = [0.22, 1, 0.36, 1] as const;

function formatDt(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return dayjs(iso).format("DD/MM/YYYY · HH:mm");
  } catch {
    return iso;
  }
}

function formatDtShort(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return dayjs(iso).format("DD/MM/YYYY");
  } catch {
    return iso;
  }
}

function bookingHrefForPart(partName: string) {
  const q = new URLSearchParams({ intent: "replace", part: partName });
  return `/garage?${q.toString()}`;
}

function levelBadgeClass(level: string) {
  if (level === "High" || level === "Critical") {
    return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200";
  }
  if (level === "Medium") {
    return "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
  }
  return "bg-neutral-200/90 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200";
}

export function NotificationDetailPageClient() {
  const params = useParams();
  const notificationId = typeof params.notificationId === "string" ? params.notificationId : "";

  const { notification, maintenanceItems, isLoading, isError, error, refetch } = useNotificationById(
    notificationId || undefined,
    !!notificationId,
  );

  if (!notificationId) {
    return (
      <main className="mx-auto w-full max-w-xl px-3 py-6 sm:px-4">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Thiếu mã thông báo.</p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-xl px-3 py-4 sm:px-4">
        <div className="h-7 w-28 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="h-6 w-2/3 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-2 h-3 w-32 animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
          <div className="mt-3 space-y-1.5">
            <div className="h-3 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
            <div className="h-3 w-[88%] animate-pulse rounded bg-neutral-100 dark:bg-neutral-900" />
          </div>
          <div className="mt-4 h-20 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
        </div>
      </main>
    );
  }

  if (isError || !notification) {
    return (
      <main className="mx-auto w-full max-w-xl px-3 py-6 sm:px-4">
        <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {error instanceof Error ? error.message : "Không tải được chi tiết thông báo."}
        </p>
        <Button type="button" variant="outline" size="sm" className="mt-3 h-8 text-xs" onClick={() => void refetch()}>
          Thử lại
        </Button>
        <div className="mt-4">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" asChild>
            <Link href="/notifications">
              <ArrowLeft className="size-3.5" />
              Quay lại
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const items = maintenanceItems ?? [];

  return (
    <main className="relative mx-auto w-full max-w-xl px-3 pb-8 pt-4 sm:px-4 sm:pb-10 sm:pt-5">
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: easeUi }}>
        <Button variant="ghost" size="sm" className="group -ml-1 mb-3 h-8 gap-1.5 px-2 text-xs text-neutral-600 dark:text-neutral-400" asChild>
          <Link href="/notifications">
            <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Thông báo
          </Link>
        </Button>
      </motion.div>

      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeUi, delay: 0.04 }}
        className="overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="border-b border-neutral-100 px-4 py-4 dark:border-neutral-800 sm:px-5 sm:py-4">
          <div className="flex items-start gap-2.5">
            <span
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/15"
              aria-hidden
            >
              <Wrench className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold leading-snug tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-[17px]">
                {notification.title}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                <CalendarClock className="size-3 shrink-0 opacity-70" aria-hidden />
                {formatDt(notification.createdAt)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-snug text-neutral-700 dark:text-neutral-300">{notification.message}</p>

          {notification.actionUrl ? (
            <div className="mt-3">
              {notification.actionUrl.startsWith("http://") || notification.actionUrl.startsWith("https://") ? (
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg px-3 text-xs" asChild>
                  <a href={notification.actionUrl} target="_blank" rel="noopener noreferrer">
                    Trang liên quan
                    <ExternalLink className="size-3 opacity-70" />
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg px-3 text-xs" asChild>
                  <Link href={notification.actionUrl}>
                    Trang liên quan
                    <ExternalLink className="size-3 opacity-70" />
                  </Link>
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {items.length > 0 ? (
          <section className="px-4 py-3 sm:px-5">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Hạng mục bảo dưỡng</h2>

            <ul className="flex flex-col gap-2">
              {items.map((row, i) => (
                <motion.li
                  key={`${row.partCategoryName}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: easeUi, delay: 0.05 + i * 0.04 }}
                  className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3 dark:border-neutral-800 dark:bg-neutral-900/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{row.partCategoryName}</p>
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", levelBadgeClass(row.level))}>
                          {row.level}
                        </span>
                      </div>
                      {row.description ? (
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-neutral-500 dark:text-neutral-400">{row.description}</p>
                      ) : null}
                    </div>
                    <Button
                      size="sm"
                      className="h-8 shrink-0 rounded-lg px-2.5 text-[11px] font-semibold text-white"
                      style={{ backgroundColor: BRAND }}
                      asChild
                    >
                      <Link href={bookingHrefForPart(row.partCategoryName)}>Thay thế</Link>
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="shrink-0 text-[10px] text-neutral-500">Còn lại</span>
                    <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: BRAND }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, row.percentageRemaining))}%` }}
                        transition={{ duration: 0.45, ease: easeUi, delay: 0.08 + i * 0.04 }}
                      />
                    </div>
                    <span className="shrink-0 text-[10px] font-medium tabular-nums text-neutral-700 dark:text-neutral-300">
                      {row.percentageRemaining}%
                    </span>
                  </div>

                  <p className="mt-2 border-t border-neutral-100 pt-2 text-[11px] leading-relaxed text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                    <span className="text-neutral-400 dark:text-neutral-500">Km</span>{" "}
                    <span className="font-medium tabular-nums text-neutral-800 dark:text-neutral-200">
                      {row.currentOdometer.toLocaleString("vi-VN")}
                    </span>
                    <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">·</span>
                    <span className="text-neutral-400 dark:text-neutral-500">Mục tiêu</span>{" "}
                    <span className="font-medium tabular-nums text-neutral-800 dark:text-neutral-200">
                      {row.targetOdometer.toLocaleString("vi-VN")}
                    </span>
                    <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">·</span>
                    <span className="text-neutral-400 dark:text-neutral-500">Dự kiến</span>{" "}
                    {formatDtShort(row.estimatedNextReplacementDate)}
                  </p>
                </motion.li>
              ))}
            </ul>
          </section>
        ) : null}
      </motion.article>
    </main>
  );
}
