"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogSheetHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGarageBundleByIdQuery } from "@/hooks/useGarage";
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

function itemTypeLabel(it: { productId?: string | null; serviceId?: string | null }): string {
  if (it.productId) return "Phụ tùng";
  if (it.serviceId) return "Dịch vụ";
  return "—";
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
      <DialogContent
        variant="bottomSheet"
        open={open}
        onOpenChange={onOpenChange}
        className="flex max-h-[min(90vh,800px)] w-full flex-col gap-0 overflow-hidden p-0 md:max-w-4xl"
      >
        <DialogSheetHeader className="shrink-0">
          <DialogTitle className="text-left text-lg leading-snug">Chi tiết combo</DialogTitle>
        </DialogSheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-4/5 max-w-xs" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="aspect-[4/3] w-full max-h-48 rounded-xl" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
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
                  <dt className="text-muted-foreground">Tạm tính</dt>
                  <dd className="tabular-nums font-medium">{formatVnd(data.subTotal)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Giá sau giảm</dt>
                  <dd className="tabular-nums font-semibold text-foreground">{formatVnd(data.finalPrice)}</dd>
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
                <h3 className="mb-3 text-sm font-semibold text-foreground">Mục trong combo</h3>

                {/* Mobile: thẻ từng dòng — không dùng bảng ngang */}
                <ul className="space-y-3 md:hidden">
                  {[...data.items]
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((it) => (
                      <li
                        key={it.id}
                        className="rounded-xl border border-border/60 bg-muted/20 p-3 shadow-none"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-xs tabular-nums text-muted-foreground">#{it.sortOrder}</span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                            {itemTypeLabel(it)}
                          </span>
                        </div>
                        <p className="mb-3 font-medium leading-snug text-foreground">{it.itemName}</p>
                        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                          <div>
                            <dt className="text-muted-foreground">Vật tư</dt>
                            <dd className="tabular-nums font-medium text-foreground">
                              {formatVnd(it.materialPrice?.amount)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Nhân công</dt>
                            <dd className="tabular-nums font-medium text-foreground">
                              {formatVnd(it.laborPrice?.amount)}
                            </dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="text-muted-foreground">Lắp đặt</dt>
                            <dd className="text-foreground">{it.includeInstallation ? "Có" : "Không"}</dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                </ul>

                {/* Desktop: bảng */}
                <div className="hidden overflow-x-auto rounded-lg border border-border/60 md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
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
                            <TableCell className="text-xs text-muted-foreground">{itemTypeLabel(it)}</TableCell>
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

        <DialogFooter className="shrink-0 border-t border-border/60 bg-background px-4 py-3 sm:px-6 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button type="button" variant="outline" onClick={() => requestCloseBottomSheet()}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
