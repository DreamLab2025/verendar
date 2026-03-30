"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { ChevronDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/api/services/fetchNotification";
import {
  mapApiNotificationToNotification,
  NOTIFICATION_INBOX_POPOVER_PAGE_SIZE,
  useMarkAsRead,
  useNotificationInboxInfinite,
} from "@/hooks/useNotification";

dayjs.extend(relativeTime);
dayjs.locale("vi");

export function formatNotifTime(iso: string) {
  try {
    const d = dayjs(iso);
    const now = dayjs();
    if (now.diff(d, "hour") < 48) {
      return d.fromNow();
    }
    return d.format("DD/MM/YYYY · HH:mm");
  } catch {
    return iso;
  }
}

/** `filterRead`: tab Đã đọc = `true`, Chưa đọc = `false` — khớp field `isRead` từng bản ghi. */
export function NotificationInboxList({
  filterRead,
  enabled,
  pageSize = NOTIFICATION_INBOX_POPOVER_PAGE_SIZE,
  onRequestOdometerDialog,
  onRequestNotificationDetail,
}: {
  filterRead: boolean;
  enabled: boolean;
  pageSize?: number;
  onRequestOdometerDialog: (userVehicleId: string) => void;
  onRequestNotificationDetail: (notificationId: string) => void;
}) {
  const router = useRouter();
  const { mutateAsync: markAsReadAsync } = useMarkAsRead();
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useNotificationInboxInfinite(filterRead, enabled, pageSize);

  const items = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    const rows = pages.flatMap((p) => p.data ?? []);
    return rows
      .map(mapApiNotificationToNotification)
      .filter((n) => n.isRead === filterRead);
  }, [data, filterRead]);

  const onRowClick = useCallback(
    async (n: Notification) => {
      if (!n.isRead) {
        try {
          const res = await markAsReadAsync(n.id);
          if (!res.isSuccess) {
            console.warn("markAsRead:", res.message);
          }
        } catch {
          /* vẫn cho phép mở link nếu có */
        }
      }
      const et = n.entityType;
      if (et === "OdometerReminder" || (!et && n.type === "odometer_update")) {
        const vid = n.entityId ?? n.userVehicleId;
        if (vid) {
          onRequestOdometerDialog(vid);
          return;
        }
      }
      if (et === "UserVehicle") {
        onRequestNotificationDetail(n.id);
        return;
      }
      if (n.actionUrl?.trim()) {
        const url = n.actionUrl.trim();
        if (url.startsWith("http://") || url.startsWith("https://")) {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          router.push(url.startsWith("/") ? url : `/${url}`);
        }
      }
    },
    [markAsReadAsync, onRequestNotificationDetail, onRequestOdometerDialog, router],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16" aria-busy="true">
        <Loader2 className="size-6 animate-spin text-neutral-300 dark:text-neutral-600" aria-hidden />
        <p className="text-[12px] font-medium tracking-wide text-neutral-400">Đang tải…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 px-5 py-12 text-center">
        <p className="text-[13px] leading-relaxed text-neutral-500">
          {error instanceof Error ? error.message : "Không tải được thông báo."}
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 rounded-lg border-neutral-200 bg-white text-[12px] font-medium text-neutral-700 shadow-none hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:bg-neutral-900"
          onClick={() => void refetch()}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-5 py-14 text-center">
        <p className="text-[13px] leading-relaxed text-neutral-400">
          {filterRead ? "Chưa có thông báo đã đọc." : "Không có thông báo chưa đọc."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ul className="m-0 list-none p-0" role="list">
        {items.map((n) => (
          <li key={n.id} className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800/80">
            <button
              type="button"
              onClick={() => {
                void onRowClick(n);
              }}
              className={cn(
                "group relative flex w-full gap-3 px-4 py-3.5 text-left transition-[background-color] duration-200",
                "hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
                !n.isRead &&
                  "bg-[linear-gradient(90deg,rgba(0,0,0,0.03)_0%,transparent_12px)] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_0%,transparent_12px)]",
              )}
            >
              {!n.isRead ? (
                <span
                  className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-full bg-neutral-900 dark:bg-neutral-100"
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  "mt-1 size-1.5 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-white transition-transform duration-200 group-hover:scale-110 dark:ring-offset-neutral-950",
                  n.isRead ? "bg-neutral-300 ring-neutral-100 dark:bg-neutral-600 dark:ring-neutral-800" : "bg-neutral-900 ring-neutral-200 dark:bg-neutral-100 dark:ring-neutral-700",
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1 pr-0.5">
                <p
                  className={cn(
                    "text-[13px] leading-snug tracking-tight text-neutral-900 dark:text-neutral-100",
                    !n.isRead && "font-semibold",
                    n.isRead && "font-medium text-neutral-700 dark:text-neutral-300",
                  )}
                >
                  {n.title}
                </p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-normal text-neutral-500 dark:text-neutral-400">
                  {n.message}
                </p>
                <p className="mt-1.5 text-[11px] font-medium tabular-nums tracking-wide text-neutral-400">
                  {formatNotifTime(n.createdAt)}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
      {hasNextPage ? (
        <div className="border-t border-neutral-100 bg-neutral-50/50 px-2 py-1.5 dark:border-neutral-800 dark:bg-neutral-900/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-full gap-2 rounded-lg text-[12px] font-semibold tracking-wide text-neutral-500 transition-colors hover:bg-white hover:text-neutral-900 dark:hover:bg-neutral-950 dark:hover:text-neutral-100"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="size-3.5 animate-spin opacity-70" aria-hidden />
                Đang tải…
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5 opacity-50" strokeWidth={2.25} aria-hidden />
                Xem thêm
              </>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
