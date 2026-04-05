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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGarageBundleByIdQuery } from "@/hooks/useGarage";

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

export type GarageBundleDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundleId: string | null;
};

export function GarageBundleDetailDialog({ open, onOpenChange, bundleId }: GarageBundleDetailDialogProps) {
  const enabled = open && Boolean(bundleId);
  const { data, isPending, isError, error, refetch } = useGarageBundleByIdQuery(bundleId ?? undefined, enabled);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border/60 px-4 pb-3 pt-4 sm:px-6">
          <DialogTitle className="text-left text-lg leading-snug">Chi tiết combo</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-4/5 max-w-xs" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-32 w-full" />
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
                  <dt className="text-muted-foreground">Tạm tính</dt>
                  <dd className="tabular-nums font-medium">{formatVnd(data.subTotal)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Giá sau giảm</dt>
                  <dd className="tabular-nums font-medium">{formatVnd(data.finalPrice)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Giảm (số tiền)</dt>
                  <dd className="tabular-nums font-medium">{formatVnd(data.discountAmount)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Giảm (%)</dt>
                  <dd className="tabular-nums font-medium">
                    {data.discountPercent != null ? `${data.discountPercent}%` : "—"}
                  </dd>
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

              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Mục trong combo</h3>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead className="text-right">Vật tư</TableHead>
                        <TableHead className="text-right">Nhân công</TableHead>
                        <TableHead className="text-center">Lắp đặt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...data.items]
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((it) => (
                          <TableRow key={it.id}>
                            <TableCell className="tabular-nums text-muted-foreground">{it.sortOrder}</TableCell>
                            <TableCell className="font-medium">{it.itemName}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {it.productId ? <span>Phụ tùng</span> : it.serviceId ? <span>Dịch vụ</span> : "—"}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatVnd(it.materialPrice?.amount)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatVnd(it.laborPrice?.amount)}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {it.includeInstallation ? "Có" : "Không"}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
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
