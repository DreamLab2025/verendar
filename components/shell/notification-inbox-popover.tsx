"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { toast } from "sonner";

import { UpdateOdometerDialog } from "@/components/shared/UpdateOdometerDialog";
import { NotificationInboxList } from "@/features/notifications/notification-inbox-list";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useMarkAllAsRead, useNotificationStatus } from "@/hooks/useNotification";
import { useUserVehicle } from "@/hooks/useUserVehice";

const listScrollStyle = { maxHeight: "min(360px,48vh)" } as const;

export function NotificationInboxPopover() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"unread" | "read">("unread");
  const [odoVehicleId, setOdoVehicleId] = useState<string | null>(null);
  const { unReadCount, refetch: refetchStatus } = useNotificationStatus(true);
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();
  const { vehicle: odoVehicle, isError: odoVehicleError, error: odoVehicleErr } = useUserVehicle(
    odoVehicleId ?? "",
    !!odoVehicleId,
  );

  useEffect(() => {
    if (open) {
      void refetchStatus();
    }
  }, [open, refetchStatus]);

  useEffect(() => {
    if (!odoVehicleId) return;
    if (odoVehicleError) {
      toast.error(odoVehicleErr instanceof Error ? odoVehicleErr.message : "Không tải được thông tin xe");
      setOdoVehicleId(null);
    }
  }, [odoVehicleId, odoVehicleError, odoVehicleErr]);

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
              <NotificationInboxList
                filterRead={false}
                enabled={open && tab === "unread"}
                onRequestOdometerDialog={(id) => {
                  setOpen(false);
                  setOdoVehicleId(id);
                }}
                onRequestNotificationDetail={(id) => {
                  setOpen(false);
                  router.push(`/notifications/${id}`);
                }}
              />
            </div>
          </TabsContent>
          <TabsContent value="read" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="scrollbar-hide overflow-y-auto overscroll-contain" style={listScrollStyle}>
              <NotificationInboxList
                filterRead={true}
                enabled={open && tab === "read"}
                onRequestOdometerDialog={(id) => {
                  setOpen(false);
                  setOdoVehicleId(id);
                }}
                onRequestNotificationDetail={(id) => {
                  setOpen(false);
                  router.push(`/notifications/${id}`);
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>

      <UpdateOdometerDialog
        open={!!odoVehicleId && !!odoVehicle}
        onOpenChange={(o) => {
          if (!o) setOdoVehicleId(null);
        }}
        userVehicleId={odoVehicle?.id ?? odoVehicleId ?? ""}
        currentOdometer={odoVehicle?.currentOdometer ?? 0}
        licensePlate={odoVehicle?.licensePlate}
      />
    </Popover>
  );
}
