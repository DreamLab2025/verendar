"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useGarageServiceByIdQuery } from "@/hooks/useGarage";

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

export type GarageServiceDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string | null;
};

export function GarageServiceDetailDialog({ open, onOpenChange, serviceId }: GarageServiceDetailDialogProps) {
  const enabled = open && Boolean(serviceId);
  const { data, isPending, isError, error, refetch } = useGarageServiceByIdQuery(serviceId ?? undefined, enabled);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border/60 px-4 pb-3 pt-4 sm:px-6">
          <DialogTitle className="text-left text-lg leading-snug">Chi tiết dịch vụ</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
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
                <dt className="text-muted-foreground">Giá nhân công</dt>
                <dd className="tabular-nums font-medium">{formatVnd(data.laborPrice?.amount)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Thời lượng</dt>
                <dd>{data.estimatedDurationMinutes != null ? `${data.estimatedDurationMinutes} phút` : "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Danh mục</dt>
                <dd>{data.serviceCategoryName ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">URL ảnh</dt>
                <dd className="break-all text-xs text-muted-foreground">{data.imageUrl ?? "—"}</dd>
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
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t border-border/60 px-4 py-3 sm:px-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
