"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_PAGE_SIZE,
  useApplyMaintenanceProposalMutation,
  useMaintenanceProposalsQuery,
  usePatchMaintenanceProposalMutation,
} from "@/hooks/useMaintenanceProposals";
import type { MaintenanceProposalDto } from "@/lib/api/services/fetchMaintenanceProposals";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

function proposalStatusLabel(status: string): string {
  const m: Record<string, string> = {
    Pending: "Chờ xác nhận",
    Accepted: "Đã chấp nhận",
    Rejected: "Đã từ chối",
    Applied: "Đã áp dụng",
    Expired: "Hết hạn",
  };
  return m[status] ?? status;
}

function ProposalCard({
  vehicleId,
  p,
}: {
  vehicleId: string;
  p: MaintenanceProposalDto;
}) {
  const patchMutation = usePatchMaintenanceProposalMutation(vehicleId);
  const applyMutation = useApplyMaintenanceProposalMutation(vehicleId);

  const [odometerInput, setOdometerInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [trackingByItemId, setTrackingByItemId] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOdometerInput(p.odometerAtService != null ? String(p.odometerAtService) : "");
    setNotesInput(p.notes?.trim() ? p.notes : "");
    setTrackingByItemId(Object.fromEntries(p.items.map((it) => [it.id, it.updatesTracking])));
  }, [p]);

  const parseOdometer = (): number | null => {
    const t = odometerInput.trim().replace(/\s/g, "").replace(/\./g, "");
    if (t === "") return null;
    const n = Number(t);
    if (Number.isNaN(n) || n < 0) return Number.NaN;
    return Math.floor(n);
  };

  const buildPayload = () => {
    const odo = parseOdometer();
    if (Number.isNaN(odo)) {
      toast.error("Số km ODO không hợp lệ.");
      return null;
    }
    const notes = notesInput.trim() || null;
    const items = p.items.map((it) => ({
      id: it.id,
      updatesTracking: trackingByItemId[it.id] ?? it.updatesTracking,
    }));
    return {
      odometerAtService: odo,
      notes,
      items,
    };
  };

  const patching = patchMutation.isPending && patchMutation.variables?.proposalId === p.id;
  const applying = applyMutation.isPending && applyMutation.variables === p.id;

  const onPatch = () => {
    const payload = buildPayload();
    if (!payload) return;
    patchMutation.mutate(
      { proposalId: p.id, payload },
      {
        onSuccess: (body) => {
          if (body?.isSuccess) {
            toast.success(body.message?.trim() || "Đã cập nhật đề xuất.");
          } else {
            toast.error(body?.message?.trim() || "Không cập nhật được.");
          }
        },
        onError: (err: Error) => {
          toast.error(err.message || "Cập nhật thất bại.");
        },
      },
    );
  };

  const onApply = () => {
    applyMutation.mutate(p.id, {
      onSuccess: (body) => {
        if (body?.isSuccess) {
          const extra = body.data?.trackingUpdated?.length
            ? ` (${body.data.trackingUpdated.join(", ")})`
            : "";
          toast.success((body.message?.trim() || "Đã xác nhận áp dụng.") + extra);
        } else {
          toast.error(body?.message?.trim() || "Không xác nhận được.");
        }
      },
      onError: (err: Error) => {
        toast.error(err.message || "Xác nhận thất bại.");
      },
    });
  };

  const pending = p.status === "Pending";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card/90 shadow-sm",
        "dark:border-border/50 dark:bg-card/80",
      )}
    >
      <div className="border-b border-border/50 bg-muted/25 px-4 py-3 sm:px-5 sm:py-4 dark:bg-muted/15">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Chi nhánh</p>
            <p className="mt-1 text-base font-semibold leading-snug text-foreground sm:text-lg">{p.branchName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ngày dự kiến:{" "}
              <span className="font-medium text-foreground">
                {dayjs(p.serviceDate).isValid() ? dayjs(p.serviceDate).format("dddd, D/M/YYYY") : p.serviceDate}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-950 dark:text-amber-50">
              {proposalStatusLabel(p.status)}
            </span>
            <p className="text-lg font-bold tabular-nums text-foreground sm:text-xl">{formatVnd(p.totalAmount)}</p>
          </div>
        </div>
        <p className="mt-2 font-mono text-[10px] text-muted-foreground sm:text-[11px]">Đề xuất: {p.id}</p>
      </div>

      <div className="space-y-6 px-4 py-4 sm:px-5 sm:py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Hạng mục và định kỳ</p>
          <ul className="mt-3 space-y-4">
            {p.items.map((it) => (
              <li
                key={it.id}
                className="rounded-xl border border-border/50 bg-muted/10 p-3 sm:p-4 dark:bg-muted/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{it.itemName}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{it.partCategoryName}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">{formatVnd(it.price)}</p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3">
                  <div className="rounded-lg border border-sky-500/25 bg-sky-500/8 px-3 py-2.5 dark:bg-sky-500/10">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-900/80 dark:text-sky-100/90">
                      Định kỳ (tháng)
                    </p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                      {it.recommendedMonthsInterval != null ? `${it.recommendedMonthsInterval} tháng` : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-violet-500/25 bg-violet-500/8 px-3 py-2.5 dark:bg-violet-500/10">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-900/80 dark:text-violet-100/90">
                      Định kỳ (km)
                    </p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                      {it.recommendedKmInterval != null
                        ? `${it.recommendedKmInterval.toLocaleString("vi-VN")} km`
                        : "—"}
                    </p>
                  </div>
                </div>

                {pending ? (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/50 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Cập nhật theo dõi phụ tùng</p>
                      <p className="text-[11px] text-muted-foreground">Gửi kèm trong PATCH (id dòng: {it.id.slice(0, 8)}…)</p>
                    </div>
                    <Switch
                      checked={trackingByItemId[it.id] ?? it.updatesTracking}
                      onCheckedChange={(v) =>
                        setTrackingByItemId((prev) => ({
                          ...prev,
                          [it.id]: v,
                        }))
                      }
                      disabled={patching || applying}
                      aria-label={`Theo dõi ${it.itemName}`}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        {pending ? (
          <div className="space-y-4 rounded-xl border border-dashed border-border/60 bg-muted/5 p-4 dark:bg-muted/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Chỉnh sửa trước khi xác nhận (PATCH)
            </p>
            <div className="space-y-2">
              <Label htmlFor={`odo-${p.id}`} className="text-sm">
                ODO tại dịch vụ (km)
              </Label>
              <Input
                id={`odo-${p.id}`}
                inputMode="numeric"
                placeholder="Ví dụ: 400000"
                value={odometerInput}
                onChange={(e) => setOdometerInput(e.target.value)}
                className="h-11 rounded-xl font-mono tabular-nums"
                disabled={patching || applying}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`notes-${p.id}`} className="text-sm">
                Ghi chú
              </Label>
              <Textarea
                id={`notes-${p.id}`}
                placeholder="Ghi chú cho garage…"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                rows={3}
                className="min-h-[88px] rounded-xl resize-y"
                disabled={patching || applying}
              />
            </div>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button
                type="button"
                variant="secondary"
                className="h-11 w-full rounded-xl font-semibold sm:w-auto sm:min-w-[180px]"
                disabled={patching || applying}
                onClick={onPatch}
              >
                {patching ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    Đang lưu…
                  </>
                ) : (
                  "Cập nhật đề xuất"
                )}
              </Button>
              <Button
                type="button"
                className="h-11 w-full rounded-xl font-semibold sm:w-auto sm:min-w-[180px]"
                disabled={patching || applying}
                onClick={onApply}
              >
                {applying ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    Đang xác nhận…
                  </>
                ) : (
                  "Xác nhận áp dụng"
                )}
              </Button>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              “Cập nhật đề xuất” gửi PATCH kèm ODO, ghi chú và từng dòng{" "}
              <span className="font-mono text-[10px]">items[].id</span> + <span className="font-mono">updatesTracking</span>.
              “Xác nhận áp dụng” gọi POST apply (không body).
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 bg-muted/10 px-3 py-3 text-sm text-muted-foreground">
            {p.odometerAtService != null ? (
              <p>
                ODO đã lưu:{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {p.odometerAtService.toLocaleString("vi-VN")} km
                </span>
              </p>
            ) : null}
            {p.notes?.trim() ? <p className="mt-1 text-foreground">{p.notes.trim()}</p> : null}
          </div>
        )}

        <p className="font-mono text-[10px] text-muted-foreground sm:text-[11px]">bookingId: {p.bookingId}</p>
      </div>
    </article>
  );
}

export function MaintenanceProposalsPageClient() {
  const params = useParams();
  const vehicleId = typeof params.vehicleId === "string" ? params.vehicleId : undefined;
  const [page, setPage] = useState(1);

  const q = useMaintenanceProposalsQuery(vehicleId, page, DEFAULT_PAGE_SIZE);

  const meta = q.data?.metadata;
  const totalPages = meta?.totalPages ?? 0;
  const hasNext = meta?.hasNextPage ?? false;
  const hasPrev = meta?.hasPreviousPage ?? false;

  const list = useMemo(() => q.data?.data ?? [], [q.data?.data]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pb-3 pt-1 sm:px-3 sm:pb-4 sm:pt-2 lg:px-4">
      <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col gap-4">
        <div className="shrink-0">
          <Button variant="ghost" size="lg" className="-ml-2 mb-1 h-11 gap-2 px-3 text-muted-foreground" asChild>
            <Link href={vehicleId ? `/vehicle/${vehicleId}` : "/"}>
              <ArrowLeft className="size-5" aria-hidden />
              Xe của tôi
            </Link>
          </Button>
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary sm:size-12">
              <Wrench className="size-5 sm:size-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Đề xuất bảo dưỡng</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Xe: <span className="font-mono text-xs text-foreground/90">{vehicleId ?? "—"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {!vehicleId ? (
            <p className="text-sm text-muted-foreground">Thiếu mã xe.</p>
          ) : q.isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-36 w-full rounded-2xl" />
              <Skeleton className="h-36 w-full rounded-2xl" />
            </div>
          ) : q.isError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {q.error instanceof Error ? q.error.message : "Lỗi tải dữ liệu."}
            </div>
          ) : list.length === 0 ? (
            <p className="rounded-2xl border border-border/60 bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
              Không có đề xuất bảo dưỡng chờ xác nhận.
            </p>
          ) : (
            <ul className="space-y-6">
              {list.map((p) => (
                <li key={p.id}>
                  <ProposalCard vehicleId={vehicleId} p={p} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {vehicleId && !q.isPending && !q.isError && totalPages > 1 ? (
          <div className="flex shrink-0 items-center justify-center gap-2 pb-1 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!hasPrev || q.isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" aria-hidden />
              Trước
            </Button>
            <span className="min-w-[8rem] text-center text-sm text-muted-foreground">
              Trang {meta?.pageNumber ?? page}
              {totalPages ? ` / ${totalPages}` : ""}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={!hasNext || q.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
