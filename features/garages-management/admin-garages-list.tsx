"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Building2, Loader2, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGaragesQuery, usePatchGarageStatus } from "@/hooks/useGarage";
import {
  GarageStatus,
  getGarageStatusLabelVi,
  isGarageStatusActive,
} from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: GarageStatus.Pending, label: "Chờ duyệt" },
  { value: GarageStatus.Active, label: "Đang hoạt động" },
  { value: GarageStatus.Suspended, label: "Tạm ngưng" },
  { value: GarageStatus.Rejected, label: "Từ chối" },
];

export function AdminGaragesList() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const params = useMemo(
    () => ({
      pageNumber: page,
      pageSize: PAGE_SIZE,
      isDescending: true,
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    }),
    [page, statusFilter],
  );

  const { data: res, isPending, isError, refetch, isFetching } = useGaragesQuery(params);
  const patchStatus = usePatchGarageStatus();

  const rows = res?.data ?? [];
  const metadata = res?.metadata;

  const rowBusy = (id: string) =>
    patchStatus.isPending && patchStatus.variables?.id === id;

  const rowApproveBusy = (id: string) =>
    rowBusy(id) && patchStatus.variables?.payload.status === GarageStatus.Active;

  const rowRejectBusy = (id: string) =>
    rowBusy(id) && patchStatus.variables?.payload.status === GarageStatus.Rejected;

  /** Duyệt: `usePatchGarageStatus` với `status: Active`. */
  const approve = (id: string) => {
    patchStatus.mutate({
      id,
      payload: {
        status: GarageStatus.Active,
        reason: "Phê duyệt đăng ký garage.",
      },
    });
  };

  /** Từ chối: `usePatchGarageStatus` với `status: Rejected`. */
  const reject = (id: string) => {
    patchStatus.mutate({
      id,
      payload: {
        status: GarageStatus.Rejected,
        reason: "Từ chối đăng ký garage.",
      },
    });
  };

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Không thể tải danh sách garage.</p>
        <Button type="button" onClick={() => void refetch()} variant="outline" className="rounded-xl">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Quản lý garage</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/40 bg-muted/30 p-3 shadow-sm">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-[200px] rounded-xl border-border/50 bg-background">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="ml-auto h-9 gap-2 rounded-xl border-border/60 shadow-sm"
        >
          <RefreshCcw className={cn("size-4", isFetching && "animate-spin")} aria-hidden />
          <span className="hidden sm:inline">Làm mới</span>
        </Button>
      </div>

      {isPending ? (
        <GaragesSkeleton />
      ) : rows.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-card/40 p-8 text-center shadow-sm">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted/50 transition-transform hover:scale-110">
            <Building2 className="size-7 text-muted-foreground/60" />
          </div>
          <div className="max-w-[280px] space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">Không có garage</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {statusFilter !== "all"
                ? "Không có garage khớp bộ lọc trạng thái."
                : "Chưa có dữ liệu garage trong hệ thống."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
                  <TableHead className="min-w-[200px]">Doanh nghiệp</TableHead>
                  <TableHead>Tên ngắn</TableHead>
                  <TableHead>Mã số thuế</TableHead>
                  <TableHead className="w-[120px]">Ngày tạo</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[200px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((g) => (
                  <TableRow key={g.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{g.businessName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{g.shortName ?? "—"}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{g.taxCode ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {g.createdAt ? dayjs(g.createdAt).format("DD/MM/YYYY") : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isGarageStatusActive(g.status) ? "default" : "secondary"}>
                        {getGarageStatusLabelVi(g.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {g.status === GarageStatus.Pending ? (
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg"
                            disabled={rowBusy(g.id)}
                            onClick={() => approve(g.id)}
                          >
                            {rowApproveBusy(g.id) ? (
                              <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
                            ) : null}
                            Duyệt
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10"
                            disabled={rowBusy(g.id)}
                            onClick={() => reject(g.id)}
                          >
                            {rowRejectBusy(g.id) ? (
                              <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
                            ) : null}
                            Từ chối
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 md:hidden">
            {rows.map((g) => (
              <Card key={g.id} className="overflow-hidden border-border/60 shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary shadow-inner">
                        <Building2 className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base font-bold leading-snug">{g.businessName ?? "—"}</CardTitle>
                        <p className="text-xs text-muted-foreground">{g.shortName ?? "—"}</p>
                      </div>
                    </div>
                    <Badge variant={isGarageStatusActive(g.status) ? "default" : "secondary"} className="shrink-0">
                      {getGarageStatusLabelVi(g.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0 text-sm">
                  <p>
                    <span className="font-medium text-foreground">MST: </span>
                    <span className="tabular-nums text-muted-foreground">{g.taxCode ?? "—"}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tạo: {g.createdAt ? dayjs(g.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                  </p>
                  {g.status === GarageStatus.Pending ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        type="button"
                        size="sm"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg sm:flex-none"
                        disabled={rowBusy(g.id)}
                        onClick={() => approve(g.id)}
                      >
                        {rowApproveBusy(g.id) ? (
                          <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
                        ) : null}
                        Duyệt
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 sm:flex-none"
                        disabled={rowBusy(g.id)}
                        onClick={() => reject(g.id)}
                      >
                        {rowRejectBusy(g.id) ? (
                          <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
                        ) : null}
                        Từ chối
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          {metadata && metadata.totalPages > 1 ? (
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-xl border-border/60"
              >
                Trước
              </Button>
              <div className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/50 px-3 py-1">
                <span className="text-sm font-bold text-foreground">{metadata.pageNumber}</span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-sm font-medium text-muted-foreground">{metadata.totalPages}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(metadata.totalPages, p + 1))}
                disabled={page >= metadata.totalPages}
                className="rounded-xl border-border/60"
              >
                Sau
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function GaragesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((row) => (
              <TableRow key={row}>
                {[1, 2, 3, 4, 5, 6].map((cell) => (
                  <TableCell key={cell}>
                    <Skeleton className={cn("h-8", cell === 1 ? "w-40" : "w-24")} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-4 md:hidden">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
