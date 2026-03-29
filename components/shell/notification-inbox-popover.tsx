"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { Bell, ChevronDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/api/services/fetchNotification";
import {
  mapApiNotificationToNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useNotificationInboxInfinite,
  useNotificationStatus,
} from "@/hooks/useNotification";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const listScrollStyle = { maxHeight: "min(360px,48vh)" } as const;

function formatNotifTime(iso: string) {
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
function NotificationInboxList({ filterRead, enabled }: { filterRead: boolean; enabled: boolean }) {
  const router = useRouter();
  const { mutateAsync: markAsReadAsync } = useMarkAsRead();
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useNotificationInboxInfinite(filterRead, enabled);

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
      if (n.actionUrl?.trim()) {
        const url = n.actionUrl.trim();
        if (url.startsWith("http://") || url.startsWith("https://")) {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          router.push(url.startsWith("/") ? url : `/${url}`);
        }
      }
    },
    [markAsReadAsync, router],
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

export function NotificationInboxPopover() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"unread" | "read">("unread");
  const { unReadCount, refetch: refetchStatus } = useNotificationStatus(true);
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();

  useEffect(() => {
    if (open) {
      void refetchStatus();
    }
  }, [open, refetchStatus]);

  const showBadge = unReadCount > 0;
  const badgeLabel = unReadCount > 99 ? "99+" : String(unReadCount);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-10 shrink-0 rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:size-9 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          aria-label="Thông báo"
          aria-haspopup="dialog"
        >
          <Bell className="size-[1.35rem] stroke-[1.75] md:size-5" aria-hidden />
          {showBadge ? (
            <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white bg-neutral-900 px-1 text-[10px] font-bold tabular-nums leading-none text-white shadow-sm dark:border-neutral-950 dark:bg-neutral-100 dark:text-neutral-900">
              {badgeLabel}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className={cn(
          "w-[min(100vw-1.25rem,392px)] overflow-hidden p-0",
          "rounded-2xl border border-neutral-200/90 bg-white",
          "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.07),0_16px_56px_-16px_rgba(0,0,0,0.11)]",
          "dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/35",
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3.5 dark:border-neutral-800">
          <h2 className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Thông báo</h2>
          <div className="flex items-center gap-0.5">
            {tab === "unread" && unReadCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg px-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
                disabled={markingAll}
                onClick={() => markAllAsRead()}
              >
                {markingAll ? "…" : "Đọc hết"}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg px-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
              asChild
            >
              <Link href="/notifications" onClick={() => setOpen(false)}>
                Tất cả
              </Link>
            </Button>
          </div>
        </header>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "unread" | "read")} className="flex w-full min-w-0 flex-col">
          <TabsList
            variant="line"
            className="flex h-auto w-full shrink-0 justify-stretch gap-0 rounded-none bg-transparent px-0"
          >
            <TabsTrigger
              variant="line"
              value="unread"
              className="min-h-[44px] flex-1 basis-0 rounded-none border-b-2 border-transparent px-3 py-2.5 text-[13px] font-medium data-[state=active]:border-neutral-900 data-[state=active]:text-neutral-900 dark:data-[state=active]:border-neutral-100 dark:data-[state=active]:text-neutral-50"
            >
              Chưa đọc
            </TabsTrigger>
            <TabsTrigger
              variant="line"
              value="read"
              className="min-h-[44px] flex-1 basis-0 rounded-none border-b-2 border-transparent px-3 py-2.5 text-[13px] font-medium data-[state=active]:border-neutral-900 data-[state=active]:text-neutral-900 dark:data-[state=active]:border-neutral-100 dark:data-[state=active]:text-neutral-50"
            >
              Đã đọc
            </TabsTrigger>
          </TabsList>
          <TabsContent value="unread" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="scrollbar-hide overflow-y-auto overscroll-contain" style={listScrollStyle}>
              <NotificationInboxList filterRead={false} enabled={open && tab === "unread"} />
            </div>
          </TabsContent>
          <TabsContent value="read" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="scrollbar-hide overflow-y-auto overscroll-contain" style={listScrollStyle}>
              <NotificationInboxList filterRead={true} enabled={open && tab === "read"} />
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
