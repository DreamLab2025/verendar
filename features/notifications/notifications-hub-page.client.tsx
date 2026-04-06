"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { UpdateOdometerDialog } from "@/components/shared/UpdateOdometerDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { NOTIFICATION_HUB_PAGE_SIZE, useMarkAllAsRead, useNotificationStatus } from "@/hooks/useNotification";
import { useUserVehicle } from "@/hooks/useUserVehice";

import { NotificationInboxList } from "./notification-inbox-list";

const hubListScrollStyle = { maxHeight: "min(70vh, 640px)" } as const;

export function NotificationsHubPageClient() {
  const router = useRouter();
  const [tab, setTab] = useState<"unread" | "read">("unread");
  const [odoVehicleId, setOdoVehicleId] = useState<string | null>(null);
  const { unReadCount } = useNotificationStatus(true);
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();
  const {
    vehicle: odoVehicle,
    isError: odoVehicleError,
    error: odoVehicleErr,
  } = useUserVehicle(odoVehicleId ?? "", !!odoVehicleId);

  useEffect(() => {
    if (!odoVehicleId || !odoVehicleError) return;
    const msg = odoVehicleErr instanceof Error ? odoVehicleErr.message : "Không tải được thông tin xe";
    toast.error(msg);
    queueMicrotask(() => {
      setOdoVehicleId(null);
    });
  }, [odoVehicleId, odoVehicleError, odoVehicleErr]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-6 pb-28 md:pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Thông báo</h1>
        <p className="text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          Danh sách từ thông báo cụ thể của người dùng.
        </p>
      </header>

      <section
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border",
          "border-neutral-200/90 bg-white dark:border-neutral-800 dark:bg-neutral-950",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-[14px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">Hộp thư</h2>
          <div className="flex items-center gap-1">
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
          </div>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "unread" | "read")}
          className="flex min-h-0 flex-1 flex-col"
        >
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
          <TabsContent value="unread" className="mt-0 min-h-0 flex-1 focus-visible:outline-none focus-visible:ring-0">
            <div className="scrollbar-hide overflow-y-auto overscroll-contain" style={hubListScrollStyle}>
              <NotificationInboxList
                filterRead={false}
                enabled={tab === "unread"}
                pageSize={NOTIFICATION_HUB_PAGE_SIZE}
                onRequestOdometerDialog={(id) => setOdoVehicleId(id)}
                onRequestNotificationDetail={(id) => router.push(`/notifications/${id}`)}
              />
            </div>
          </TabsContent>
          <TabsContent value="read" className="mt-0 min-h-0 flex-1 focus-visible:outline-none focus-visible:ring-0">
            <div className="scrollbar-hide overflow-y-auto overscroll-contain" style={hubListScrollStyle}>
              <NotificationInboxList
                filterRead={true}
                enabled={tab === "read"}
                pageSize={NOTIFICATION_HUB_PAGE_SIZE}
                onRequestOdometerDialog={(id) => setOdoVehicleId(id)}
                onRequestNotificationDetail={(id) => router.push(`/notifications/${id}`)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <UpdateOdometerDialog
        open={!!odoVehicleId && !!odoVehicle}
        onOpenChange={(o) => {
          if (!o) setOdoVehicleId(null);
        }}
        userVehicleId={odoVehicle?.id ?? odoVehicleId ?? ""}
        currentOdometer={odoVehicle?.currentOdometer ?? 0}
        licensePlate={odoVehicle?.licensePlate}
      />
    </main>
  );
}
