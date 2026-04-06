"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogSheetHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useGarageProductByIdQuery } from "@/hooks/useGarage";
import { requestCloseBottomSheet } from "@/lib/ui/bottom-sheet-motion";

function formatVnd(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export type GarageProductDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
};

export function GarageProductDetailDialog({ open, onOpenChange, productId }: GarageProductDetailDialogProps) {
  const enabled = open && Boolean(productId);
  const { data, isPending, isError, error, refetch } = useGarageProductByIdQuery(productId ?? undefined, enabled);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="bottomSheet"
        open={open}
        onOpenChange={onOpenChange}
        className="flex max-h-[min(90vh,800px)] w-full flex-col gap-0 overflow-hidden p-0 md:max-w-4xl"
      >
        <DialogSheetHeader className="shrink-0">
          <DialogTitle className="text-left text-lg leading-snug">Chi tiết phụ tùng</DialogTitle>
        </DialogSheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-4/5 max-w-xs" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error?.message ?? "Không tải được chi tiết."}
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
                Thử lại
              </Button>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {data.imageUrl ? (
                <div className="overflow-hidden rounded-xl bg-muted/30 md:border md:border-border/60">
                  {/* eslint-disable-next-line @next/next/no-img-element -- ảnh từ CDN / URL ngoài */}
                  <img src={data.imageUrl} alt="" className="mx-auto max-h-64 w-full object-contain p-2" />
                </div>
              ) : null}

              <dl className="grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Tên</dt>
                  <dd className="font-semibold text-foreground">{data.name}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Mô tả</dt>
                  <dd className="whitespace-pre-wrap wrap-break-word text-foreground">{data.description ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Giá phụ tùng</dt>
                  <dd className="tabular-nums font-medium">{formatVnd(data.materialPrice?.amount)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Thời lượng ước tính</dt>
                  <dd>{data.estimatedDurationMinutes != null ? `${data.estimatedDurationMinutes} phút` : "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Loại xe tương thích</dt>
                  <dd className="text-foreground">{data.compatibleVehicleTypes ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Hạn km (NSX)</dt>
                  <dd className="tabular-nums">
                    {data.manufacturerKmInterval != null
                      ? `${data.manufacturerKmInterval.toLocaleString("vi-VN")} km`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Hạn tháng (NSX)</dt>
                  <dd className="tabular-nums">
                    {data.manufacturerMonthInterval != null ? `${data.manufacturerMonthInterval} tháng` : "—"}
                  </dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Trạng thái</dt>
                  <dd>
                    <Badge variant={data.status === "Active" ? "secondary" : "outline"}>{data.status}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tạo lúc</dt>
                  <dd className="text-xs text-muted-foreground">{formatDate(data.createdAt)}</dd>
                </div>
              </dl>

              {data.installationService ? (
                <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Dịch vụ lắp đặt đi kèm</h3>
                  <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Tên dịch vụ</dt>
                      <dd className="font-medium text-foreground">{data.installationService.name}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Giá nhân công</dt>
                      <dd className="tabular-nums">{formatVnd(data.installationService.laborPrice?.amount)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Thời lượng</dt>
                      <dd>
                        {data.installationService.estimatedDurationMinutes != null
                          ? `${data.installationService.estimatedDurationMinutes} phút`
                          : "—"}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">ID dịch vụ</dt>
                      <dd className="font-mono text-xs text-muted-foreground">{data.installationService.id}</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Không có dịch vụ lắp đặt đi kèm.</p>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-border/60 bg-background px-4 py-3 sm:px-6 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button type="button" variant="outline" onClick={() => requestCloseBottomSheet()}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
