"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Gauge, Loader2, Trash2 } from "lucide-react";
import type { UserVehicle, UserVehiclePart } from "@/lib/api/services/fetchUserVehicle";
import type { MaintenanceRecordListItem } from "@/lib/api/services/fetchMaintenanceRecord";
import type { OdometerHistoryItem } from "@/lib/api/services/fetchOdometer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserVehicleReminders } from "@/hooks/useTrackingReminder";
import { DesktopCenterOverviewTab } from "@/components/shared/DesktopCenterOverviewTab";
import { DesktopCenterPartsTab } from "@/components/shared/DesktopCenterPartsTab";
import { DesktopCenterRemindersTab } from "@/components/shared/DesktopCenterRemindersTab";
import { CreateVehicleFlow } from "@/features/vehicle-create";
import { VehicleHistoryTabContent } from "@/components/shared/VehicleHistoryTabContent";
import { UpdateOdometerDialog } from "@/components/shared/UpdateOdometerDialog";
import { useDeleteUserVehicle } from "@/hooks/useUserVehice";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const labelMuted = "text-[12px] text-neutral-500 dark:text-neutral-400";

/** Nút dưới odometer: mobile đồng kích thước / cùng bo góc; desktop giữ nút gọn bên phải */
const odometerActionBtnClass =
  "h-12 min-h-12 touch-manipulation justify-center gap-2 rounded-xl px-3 text-[13px] font-semibold leading-none shadow-sm max-lg:w-full sm:h-auto sm:min-h-[50px] sm:w-auto sm:px-5 sm:py-3 sm:text-base";

export type CenterPanelProps = {
  vehicle: UserVehicle | null;
  isAddSlot: boolean;
  onCreateFlowSuccess?: () => void;
  /** Mobile: đóng luồng tạo xe, quay về danh sách (khi đã có xe) */
  onCreateFlowExit?: () => void;
  parts: UserVehiclePart[];
  isLoadingParts: boolean;
  declarationPercent: number;
  /** Trang `/vehicle/[id]`: full width / flex-1, không khóa `lg:w-[60%]` của home */
  surface?: "home" | "vehicleDetail";
  /** Trang `/vehicle/[id]`: tab “Lịch sử” — odo + bảo dưỡng dạng list */
  vehicleDetailHistory?: {
    odometerHistory: OdometerHistoryItem[];
    isLoadingOdometer: boolean;
    maintenanceRecords: MaintenanceRecordListItem[];
    isLoadingMaintenance: boolean;
  };
};

export function CenterPanel({
  vehicle,
  isAddSlot,
  onCreateFlowSuccess,
  onCreateFlowExit,
  parts,
  isLoadingParts,
  declarationPercent,
  surface = "home",
  vehicleDetailHistory,
}: CenterPanelProps) {
  const router = useRouter();
  const isVehicleDetail = surface === "vehicleDetail";
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [odometerDialogOpen, setOdometerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { deleteVehicle, isDeleting } = useDeleteUserVehicle();

  const { reminders, isLoading: isLoadingReminders } = useUserVehicleReminders(vehicle?.id ?? "");

  const topReminders = useMemo(() => {
    return [...reminders].sort((a, b) => (b.percentageRemaining ?? 0) - (a.percentageRemaining ?? 0)).slice(0, 3);
  }, [reminders]);

  if (isAddSlot || !vehicle) {
    return (
      <section className="flex min-h-0 min-w-0 flex-1 touch-pan-y flex-col overflow-x-hidden overflow-y-auto overscroll-y-auto bg-transparent px-0 py-2 dark:bg-transparent max-lg:border-0 max-lg:shadow-none max-lg:backdrop-blur-none dark:max-lg:bg-transparent lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:bg-[#F9F8F6] lg:px-6 lg:py-4 dark:lg:bg-neutral-950">
        <CreateVehicleFlow onSuccess={onCreateFlowSuccess} onRequestExit={onCreateFlowExit} />
      </section>
    );
  }

  const odoStr = vehicle.currentOdometer.toLocaleString("vi-VN").padStart(6, "0");
  const avg = vehicle.averageKmPerDay ?? 0;

  const tabPanelClass =
    "mt-4 flex min-h-0 flex-1 flex-col overflow-hidden outline-none ring-0 focus-visible:ring-0 data-[state=inactive]:hidden md:mt-5";

  /** Ẩn thanh scroll (Tailwind arbitrary — không phụ thuộc @layer utilities) */
  const tabScrollAreaClass =
    "scrollbar-hide flex min-h-0 min-w-0 flex-1 touch-pan-y flex-col overflow-x-hidden overflow-y-auto overscroll-y-auto pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0";

  /** Mobile trang chi tiết: 4 tab cùng cỡ chữ, cùng weight, chia đều chiều ngang */
  const vehicleDetailLineTabTrigger =
    "flex-1 min-w-0 basis-0 justify-center text-center max-lg:min-h-[48px] max-lg:px-1 max-lg:py-2 max-lg:text-xs max-lg:font-medium max-lg:leading-snug max-lg:tracking-tight max-lg:text-balance max-lg:whitespace-normal max-lg:data-[state=active]:font-semibold lg:basis-auto lg:flex-none lg:min-h-0 lg:whitespace-nowrap lg:px-4 lg:py-2.5 lg:text-[13px] lg:font-medium lg:leading-normal lg:tracking-normal lg:data-[state=active]:font-semibold";

  return (
    <section
      className={cn(
        "flex w-full min-w-0 flex-col overflow-hidden bg-[#F9F8F6] py-3 dark:bg-neutral-950 sm:px-4 sm:py-4 max-lg:rounded-2xl max-lg:border max-lg:border-border/70 max-lg:bg-background/90 max-lg:px-3 max-lg:py-4 max-lg:shadow-xl max-lg:backdrop-blur-sm dark:max-lg:bg-background/80 lg:rounded-md lg:border-0 lg:py-5 lg:pl-5 lg:pr-5 lg:shadow-none lg:backdrop-blur-none",
        isVehicleDetail
          ? "min-h-0 flex-1 lg:min-h-0 lg:flex-1"
          : "max-lg:flex-none lg:h-full lg:min-h-0 lg:w-[60%] lg:flex-none",
      )}
    >
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa xe?</AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Xe{" "}
              <span className="font-semibold text-foreground">{vehicle.licensePlate}</span> sẽ bị xóa vĩnh viễn. Bạn
              không thể hoàn tác thao tác này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              className="gap-2"
              onClick={() => {
                deleteVehicle(vehicle.id, {
                  onSuccess: () => {
                    setDeleteDialogOpen(false);
                    if (isVehicleDetail) {
                      router.push("/");
                    }
                  },
                });
              }}
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {isDeleting ? "Đang xóa…" : "Xóa xe"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isVehicleDetail ? (
        <UpdateOdometerDialog
          open={odometerDialogOpen}
          onOpenChange={setOdometerDialogOpen}
          userVehicleId={vehicle.id}
          currentOdometer={vehicle.currentOdometer}
          licensePlate={vehicle.licensePlate}
        />
      ) : null}
      <div className="shrink-0 space-y-1 max-lg:rounded-2xl max-lg:border max-lg:border-primary/15 max-lg:bg-primary/10 max-lg:px-3 max-lg:py-4 dark:max-lg:border-primary/20 dark:max-lg:bg-primary/15">
        <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:gap-2">
          <div className="hidden min-w-0 sm:flex sm:flex-1 sm:justify-end sm:pr-2" aria-hidden />
          <div className="flex shrink-0 flex-wrap items-end justify-center gap-x-2 gap-y-1">
            <p
              className={cn(
                "font-odo-seven-segment text-center text-[2.75rem] font-normal leading-none tabular-nums tracking-widest text-neutral-900 dark:text-neutral-100",
                "sm:text-[3.25rem] md:text-[3.75rem] lg:text-[4.25rem] xl:text-[4.75rem]",
              )}
            >
              {odoStr}
            </p>
            <span className="inline-block shrink-0 pb-1 font-sans text-lg font-semibold tracking-normal text-neutral-500 sm:text-xl md:pb-1.5 md:text-2xl">
              Km
            </span>
          </div>
          <div
            className={cn(
              "flex min-w-0 flex-1 items-stretch gap-2 sm:items-end sm:justify-end sm:gap-2.5 sm:pl-2",
              isVehicleDetail
                ? "max-lg:grid max-lg:w-full max-lg:grid-cols-2 max-lg:gap-2.5"
                : "max-lg:flex max-lg:w-full max-lg:justify-center",
            )}
          >
            {isVehicleDetail ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setOdometerDialogOpen(true)}
                className={cn(
                  odometerActionBtnClass,
                  "shrink-0 border-primary/40 bg-background/90 text-primary hover:bg-background dark:border-primary/45 dark:bg-neutral-900/70 dark:hover:bg-neutral-900",
                )}
                aria-label="Cập nhật số km"
              >
                <Gauge className="size-4 shrink-0 sm:size-4.5" aria-hidden />
                <span className="max-lg:hidden">Cập nhật odo</span>
                <span className="lg:hidden">Cập nhật</span>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
              className={cn(
                odometerActionBtnClass,
                "shrink-0 border-destructive/45 bg-background/90 text-destructive hover:bg-destructive/10 dark:border-destructive/55 dark:bg-neutral-900/70 dark:hover:bg-destructive/15",
                !isVehicleDetail && "max-lg:w-auto! max-lg:min-w-42 max-lg:px-5",
              )}
              aria-label="Xóa xe"
            >
              <Trash2 className="size-4 shrink-0 sm:size-5" aria-hidden />
              Xóa Xe
            </Button>
          </div>
        </div>
        <p className={`text-center ${labelMuted}`}>
          TRUNG BÌNH: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{avg} km/ngày</span>
        </p>
      </div>

      <Tabs key={vehicle.id} defaultValue="overview" className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TabsList
          variant="line"
          className="flex w-full shrink-0 justify-stretch gap-0 max-lg:items-stretch lg:inline-flex lg:justify-start"
        >
          <TabsTrigger value="overview" className={vehicleDetailLineTabTrigger}>
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="parts" className={vehicleDetailLineTabTrigger}>
            Tình Trạng
          </TabsTrigger>
          <TabsTrigger value="reminders" className={vehicleDetailLineTabTrigger}>
            Nhắc Nhở
          </TabsTrigger>
          {vehicleDetailHistory ? (
            <TabsTrigger value="history" className={vehicleDetailLineTabTrigger}>
              Lịch sử
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="overview" className={tabPanelClass}>
          <div className={tabScrollAreaClass}>
            <DesktopCenterOverviewTab
              vehicle={vehicle}
              declarationPercent={declarationPercent}
              topReminders={topReminders}
              isLoadingReminders={isLoadingReminders}
            />
          </div>
        </TabsContent>

        <TabsContent value="parts" className={tabPanelClass}>
          <div className={tabScrollAreaClass}>
            <DesktopCenterPartsTab
              userVehicleId={vehicle.id}
              parts={parts}
              isLoadingParts={isLoadingParts}
              selectedPartId={selectedPartId}
              onTogglePart={(id) => setSelectedPartId(id)}
            />
          </div>
        </TabsContent>

        <TabsContent value="reminders" className={tabPanelClass}>
          <div className={tabScrollAreaClass}>
            <DesktopCenterRemindersTab reminders={reminders} isLoadingReminders={isLoadingReminders} />
          </div>
        </TabsContent>

        {vehicleDetailHistory ? (
          <TabsContent value="history" className={tabPanelClass}>
            <div className={tabScrollAreaClass}>
              <VehicleHistoryTabContent
                odometerHistory={vehicleDetailHistory.odometerHistory}
                isLoadingOdometer={vehicleDetailHistory.isLoadingOdometer}
                maintenanceRecords={vehicleDetailHistory.maintenanceRecords}
                isLoadingMaintenance={vehicleDetailHistory.isLoadingMaintenance}
                className="px-0.5 pb-2 pt-1"
              />
            </div>
          </TabsContent>
        ) : null}
      </Tabs>
    </section>
  );
}
