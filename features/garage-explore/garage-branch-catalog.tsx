"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Clock, Layers, Loader2, Package, Sparkles, Wrench } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SafeImage from "@/components/ui/SafeImage";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type GarageCatalogInfiniteFilters,
  type GarageCatalogTypeFilter,
  useGarageBundleByIdQuery,
  useGarageCatalogInfinite,
  useGarageProductByIdQuery,
  useGarageServiceByIdQuery,
} from "@/hooks/useGarage";
import type {
  GarageBundleDetailDto,
  GarageBundleItemDto,
  GarageCatalogItemDto,
  GarageProductDetailDto,
  GarageServiceDetailDto,
} from "@/lib/api/services/fetchGarage";
import { useBookingCartStore } from "@/lib/stores/booking-cart-store";
import type { CatalogBookingLine, CatalogDetailKind } from "@/lib/types/garage-catalog-booking";
import { cn } from "@/lib/utils";

export type { CatalogBookingLine, CatalogDetailKind } from "@/lib/types/garage-catalog-booking";
export type { BookingCartLine } from "@/lib/stores/booking-cart-store";

const FILTER_TABS: {
  id: "all" | GarageCatalogTypeFilter;
  label: string;
  short: string;
  api?: GarageCatalogTypeFilter;
}[] = [
  { id: "all", label: "Tất cả", short: "Tất cả" },
  { id: "service", label: "Dịch vụ", short: "DV", api: "service" },
  { id: "product", label: "Phụ tùng", short: "PT", api: "product" },
  { id: "bundle", label: "Combo", short: "Combo", api: "bundle" },
];

function parseTypeParam(raw: string | null): (typeof FILTER_TABS)[number]["id"] {
  const t = raw?.trim().toLowerCase();
  if (t === "service" || t === "product" || t === "bundle") return t;
  return "all";
}

function formatVnd(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function catalogTypeMeta(type: string) {
  const t = type.toLowerCase();
  if (t === "service") {
    return {
      label: "Dịch vụ",
      Icon: Wrench,
      badgeClass: "border-sky-500/35 bg-sky-500/12 text-sky-800 dark:text-sky-200",
    };
  }
  if (t === "product") {
    return {
      label: "Phụ tùng",
      Icon: Package,
      badgeClass: "border-emerald-500/35 bg-emerald-500/12 text-emerald-900 dark:text-emerald-100",
    };
  }
  if (t === "bundle") {
    return {
      label: "Combo",
      Icon: Layers,
      badgeClass: "border-violet-500/35 bg-violet-500/12 text-violet-900 dark:text-violet-100",
    };
  }
  return {
    label: type,
    Icon: Sparkles,
    badgeClass: "border-border bg-muted text-muted-foreground",
  };
}

type ExpandedCatalogRow = { kind: CatalogDetailKind; id: string } | null;

function formatDateVi(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return null;
  }
}

/** Khối thu gọn trong panel chi tiết — nút luôn ghi «Xem thêm»; `contentLabel` cho aria. */
function CatalogDetailMoreSection({
  contentLabel,
  defaultOpen = false,
  children,
}: {
  /** Mô tả nội dung bên trong (aria-label, không hiển thị). */
  contentLabel: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-background/60 dark:bg-background/35">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/50 dark:hover:bg-muted/30"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-label={open ? `Thu gọn: ${contentLabel}` : `Xem thêm — ${contentLabel}`}
      >
        <span className="text-[13px] font-semibold text-foreground">Xem thêm</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          )}
          aria-hidden
        />
      </button>
      {open ? <div className="border-t border-border/50 px-3 py-3 text-sm">{children}</div> : null}
    </div>
  );
}

/** Mô tả trên card: 2 dòng + «Đọc tiếp» nếu dài — không trùng với nội dung trong «Xem thêm». */
function CatalogDetailTruncatedDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = description.length > 160;
  return (
    <div className="mt-2">
      <p className={cn("text-sm leading-relaxed text-muted-foreground", !expanded && long && "line-clamp-2")}>
        {description}
      </p>
      {long ? (
        <button
          type="button"
          className="mt-1 text-left text-xs font-medium text-primary hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? "Thu gọn" : "Đọc tiếp"}
        </button>
      ) : null}
    </div>
  );
}

function CatalogDetailBookHeader({
  dotClassName,
  title,
  showBook,
  onBook,
}: {
  dotClassName: string;
  title: string;
  showBook: boolean;
  onBook?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <p className="flex min-w-0 flex-1 items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className={cn("size-1.5 shrink-0 rounded-full", dotClassName)} aria-hidden />
        {title}
      </p>
      {showBook ? (
        <Button
          type="button"
          size="sm"
          className="shrink-0 rounded-lg px-3 text-xs font-semibold shadow-sm"
          onClick={onBook}
        >
          Thêm vào đặt lịch
        </Button>
      ) : null}
    </div>
  );
}

function CatalogItemRow({
  item,
  onDetailToggle,
  detailExpanded,
  selectedForBooking,
}: {
  item: GarageCatalogItemDto;
  onDetailToggle?: () => void;
  detailExpanded?: boolean;
  /** Đã nằm trong danh sách đặt lịch (có thể nhiều mục). */
  selectedForBooking?: boolean;
}) {
  const meta = catalogTypeMeta(item.type);
  const Icon = meta.Icon;
  const isProduct = item.type.toLowerCase() === "product";
  const isService = item.type.toLowerCase() === "service";
  const isBundle = item.type.toLowerCase() === "bundle";
  const detailExpandable = isProduct || isService || isBundle;
  const displayPrice =
    item.type.toLowerCase() === "bundle" && item.finalPrice != null ? item.finalPrice : item.price?.amount;
  const showStrike =
    item.type.toLowerCase() === "bundle" &&
    item.subTotal != null &&
    item.finalPrice != null &&
    item.subTotal > item.finalPrice;

  const detailAriaLabel = isProduct
    ? `${detailExpanded ? "Thu gọn" : "Mở"} chi tiết phụ tùng ${item.name ?? ""}`
    : isService
      ? `${detailExpanded ? "Thu gọn" : "Mở"} chi tiết dịch vụ ${item.name ?? ""}`
      : isBundle
        ? `${detailExpanded ? "Thu gọn" : "Mở"} chi tiết combo ${item.name ?? ""}`
        : undefined;

  return (
    <article
      className={cn(
        "flex gap-3 bg-card p-3 transition-colors",
        detailExpandable ? "cursor-pointer hover:bg-muted/40" : "hover:bg-muted/30",
      )}
      role={detailExpandable ? "button" : undefined}
      tabIndex={detailExpandable ? 0 : undefined}
      onClick={detailExpandable ? () => onDetailToggle?.() : undefined}
      onKeyDown={
        detailExpandable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onDetailToggle?.();
              }
            }
          : undefined
      }
      aria-expanded={detailExpandable ? detailExpanded : undefined}
      aria-label={detailAriaLabel}
    >
      <div className="relative size-18 shrink-0 overflow-hidden rounded-lg bg-muted/80 sm:size-20">
        {item.imageUrl ? (
          <SafeImage
            src={item.imageUrl}
            alt={item.name ?? "Hình mục"}
            fill
            className="object-contain object-center p-2"
          />
        ) : (
          <div className="grid size-full place-items-center bg-linear-to-br from-muted to-muted/50">
            <Icon className="size-8 text-muted-foreground/45 sm:size-9" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 items-start gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-[14px] font-semibold leading-snug text-foreground sm:text-[15px]">
            {item.name}
          </h3>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 self-start pt-0.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                meta.badgeClass,
              )}
            >
              <Icon className="size-2.5 opacity-90" aria-hidden />
              {meta.label}
            </span>
            {item.type.toLowerCase() === "bundle" && item.discountPercent != null && item.discountPercent > 0 ? (
              <span className="rounded-md bg-amber-500/95 px-1.5 py-0.5 text-[10px] font-bold text-white">
                −{item.discountPercent}%
              </span>
            ) : null}
            {selectedForBooking ? (
              <span className="rounded-md border border-primary/35 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                Trong lịch
              </span>
            ) : null}
          </div>
        </div>
        {item.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            {showStrike ? (
              <p className="text-[11px] text-muted-foreground line-through">{formatVnd(item.subTotal)}</p>
            ) : null}
            <p className="text-base font-bold tabular-nums text-foreground">{formatVnd(displayPrice)}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            {detailExpandable ? (
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  detailExpanded ? "rotate-180" : "rotate-0",
                )}
                aria-hidden
              />
            ) : null}
            {item.estimatedDurationMinutes != null ? (
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <Clock className="size-3.5 shrink-0 opacity-80" aria-hidden />~{item.estimatedDurationMinutes} phút
              </span>
            ) : null}
            {item.type.toLowerCase() === "product" && item.hasInstallationOption ? (
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                Có lắp đặt
              </span>
            ) : null}
            {item.type.toLowerCase() === "bundle" && item.itemCount != null ? <span>{item.itemCount} mục</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function GarageProductDetailInline({
  data,
  isLoading,
  isError,
  error,
  onBook,
}: {
  data: GarageProductDetailDto | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onBook?: () => void;
}) {
  const showBook = Boolean(data) && !isLoading && !isError;

  return (
    <div className="space-y-3">
      <CatalogDetailBookHeader
        dotClassName="bg-primary/70"
        title="Chi tiết phụ tùng"
        showBook={showBook}
        onBook={onBook}
      />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-4/5 rounded-md" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">{error instanceof Error ? error.message : "Lỗi tải dữ liệu."}</p>
      ) : null}

      {data ? (
        <div className="min-w-0 space-y-3">
          <div>
            <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">{data.name}</h3>
            {data.description ? <CatalogDetailTruncatedDescription description={data.description} /> : null}
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="flex flex-wrap justify-between gap-2 border-b border-border/50 pb-2">
              <dt className="text-muted-foreground">Giá vật tư</dt>
              <dd className="font-semibold tabular-nums text-foreground">{formatVnd(data.materialPrice?.amount)}</dd>
            </div>
            {data.estimatedDurationMinutes != null ? (
              <div className="flex flex-wrap justify-between gap-2 border-b border-border/50 pb-2">
                <dt className="text-muted-foreground">Thời gian ước tính</dt>
                <dd className="tabular-nums">~{data.estimatedDurationMinutes} phút</dd>
              </div>
            ) : null}
          </dl>

          {(() => {
            const hasExtraFields =
              Boolean(data.compatibleVehicleTypes) ||
              data.manufacturerKmInterval != null ||
              data.manufacturerMonthInterval != null ||
              Boolean(data.partCategoryId) ||
              Boolean(data.status) ||
              formatDateVi(data.updatedAt) != null ||
              formatDateVi(data.createdAt) != null;
            const inst = data.installationService;
            if (!hasExtraFields && !inst) return null;
            return (
              <CatalogDetailMoreSection contentLabel="Thông số và dịch vụ lắp đặt">
                {hasExtraFields ? (
                  <dl className="grid gap-2.5 text-sm">
                    {data.compatibleVehicleTypes ? (
                      <div className="flex flex-wrap justify-between gap-2 border-b border-border/40 pb-2">
                        <dt className="text-muted-foreground">Loại xe phù hợp</dt>
                        <dd className="max-w-[70%] text-right text-foreground">{data.compatibleVehicleTypes}</dd>
                      </div>
                    ) : null}
                    {data.manufacturerKmInterval != null || data.manufacturerMonthInterval != null ? (
                      <div className="flex flex-wrap justify-between gap-2 border-b border-border/40 pb-2">
                        <dt className="text-muted-foreground">Khuyến nghị hãng</dt>
                        <dd className="text-right text-foreground">
                          {data.manufacturerKmInterval != null
                            ? `${new Intl.NumberFormat("vi-VN").format(data.manufacturerKmInterval)} km`
                            : ""}
                          {data.manufacturerKmInterval != null && data.manufacturerMonthInterval != null ? " · " : ""}
                          {data.manufacturerMonthInterval != null ? `${data.manufacturerMonthInterval} tháng` : ""}
                        </dd>
                      </div>
                    ) : null}

                    {data.status ? (
                      <div className="flex flex-wrap justify-between gap-2 border-b border-border/40 pb-2">
                        <dt className="text-muted-foreground">Trạng thái</dt>
                        <dd className="text-foreground">{data.status}</dd>
                      </div>
                    ) : null}
                    {formatDateVi(data.updatedAt) || formatDateVi(data.createdAt) ? (
                      <p className="text-[11px] text-muted-foreground">
                        Cập nhật: {formatDateVi(data.updatedAt) ?? formatDateVi(data.createdAt)}
                      </p>
                    ) : null}
                  </dl>
                ) : null}
                {inst ? (
                  <div className={cn(hasExtraFields && "mt-4 border-t border-border/50 pt-4")}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Dịch vụ lắp đặt kèm
                    </p>
                    <p className="mt-2 font-medium text-foreground">{inst.name}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">Nhân công lắp đặt</span>
                      <span className="font-semibold tabular-nums">{formatVnd(inst.laborPrice?.amount)}</span>
                    </div>
                    {inst.estimatedDurationMinutes != null ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Ước tính ~{inst.estimatedDurationMinutes} phút
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </CatalogDetailMoreSection>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}

function bundleItemKindLabel(row: GarageBundleItemDto): "Phụ tùng" | "Dịch vụ" {
  if (row.productId) return "Phụ tùng";
  if (row.serviceId) return "Dịch vụ";
  return "Dịch vụ";
}

function GarageBundleDetailInline({
  data,
  isLoading,
  isError,
  error,
  onBook,
}: {
  data: GarageBundleDetailDto | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onBook?: () => void;
}) {
  const sortedItems = data?.items ? [...data.items].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  const showBook = Boolean(data) && !isLoading && !isError;

  return (
    <div className="space-y-3">
      <CatalogDetailBookHeader
        dotClassName="bg-violet-500/80"
        title="Chi tiết combo"
        showBook={showBook}
        onBook={onBook}
      />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-4/5 rounded-md" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">{error instanceof Error ? error.message : "Lỗi tải dữ liệu."}</p>
      ) : null}

      {data ? (
        <div className="min-w-0 space-y-3">
          <div className="flex gap-3">
            {data.imageUrl ? (
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/50">
                <SafeImage src={data.imageUrl} alt={data.name} fill className="object-contain object-center p-1.5" />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">{data.name}</h3>
              {data.description ? <CatalogDetailTruncatedDescription description={data.description} /> : null}
            </div>
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="flex flex-wrap justify-between gap-2 border-b border-border/50 pb-2">
              <dt className="text-muted-foreground">Tạm tính</dt>
              <dd
                className={cn(
                  "font-medium tabular-nums text-muted-foreground",
                  data.finalPrice < data.subTotal && "line-through opacity-80",
                )}
              >
                {formatVnd(data.subTotal)}
              </dd>
            </div>
            {data.discountAmount != null && data.discountAmount > 0 ? (
              <div className="flex flex-wrap justify-between gap-2 border-b border-border/50 pb-2">
                <dt className="text-muted-foreground">Giảm giá</dt>
                <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  −{formatVnd(data.discountAmount)}
                </dd>
              </div>
            ) : null}
            {data.discountPercent != null && data.discountPercent > 0 ? (
              <div className="flex flex-wrap justify-between gap-2 border-b border-border/50 pb-2">
                <dt className="text-muted-foreground">Giảm giá</dt>
                <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  −{data.discountPercent}%
                </dd>
              </div>
            ) : null}
            <div className="flex flex-wrap justify-between gap-2 border-b border-border/50 pb-2">
              <dt className="text-muted-foreground">Giá combo</dt>
              <dd className="font-bold tabular-nums text-foreground">{formatVnd(data.finalPrice)}</dd>
            </div>
          </dl>

          {sortedItems.length > 0 ? (
            <CatalogDetailMoreSection contentLabel="Thành phần trong combo">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Thành phần ({sortedItems.length})
                </p>
                <ul className="space-y-2">
                  {sortedItems.map((row) => (
                    <li
                      key={row.id}
                      className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 dark:bg-background/40"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-snug text-foreground">{row.itemName}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-violet-900 dark:text-violet-200">
                              {bundleItemKindLabel(row)}
                            </span>
                            {row.includeInstallation ? (
                              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                Có lắp đặt
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <dl className="mt-2 grid gap-1.5 text-xs text-muted-foreground">
                        {row.productId ? (
                          <div className="flex justify-between gap-2 font-mono text-[10px]">
                            <dt>Liên kết phụ tùng</dt>
                            <dd className="truncate text-foreground">{row.productId}</dd>
                          </div>
                        ) : null}
                        {row.serviceId ? (
                          <div className="flex justify-between gap-2 font-mono text-[10px]">
                            <dt>Liên kết dịch vụ</dt>
                            <dd className="truncate text-foreground">{row.serviceId}</dd>
                          </div>
                        ) : null}
                        {row.materialPrice != null ? (
                          <div className="flex justify-between gap-2">
                            <dt>Vật tư</dt>
                            <dd className="tabular-nums font-medium text-foreground">
                              {formatVnd(row.materialPrice.amount)}
                            </dd>
                          </div>
                        ) : null}
                        {row.laborPrice != null ? (
                          <div className="flex justify-between gap-2">
                            <dt>Nhân công</dt>
                            <dd className="tabular-nums font-medium text-foreground">
                              {formatVnd(row.laborPrice.amount)}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </li>
                  ))}
                </ul>
              </div>
            </CatalogDetailMoreSection>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function GarageServiceDetailInline({
  data,
  isLoading,
  isError,
  error,
  onBook,
}: {
  data: GarageServiceDetailDto | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onBook?: () => void;
}) {
  const showBook = Boolean(data) && !isLoading && !isError;

  return (
    <div className="space-y-3">
      <CatalogDetailBookHeader
        dotClassName="bg-sky-500/80"
        title="Chi tiết dịch vụ"
        showBook={showBook}
        onBook={onBook}
      />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-4/5 rounded-md" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">{error instanceof Error ? error.message : "Lỗi tải dữ liệu."}</p>
      ) : null}

      {data ? (
        <div className="min-w-0 space-y-3">
          <div>
            <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">{data.name}</h3>
            {data.description ? <CatalogDetailTruncatedDescription description={data.description} /> : null}
          </div>

          <dl className="grid gap-3 text-sm">
            <div className="flex flex-wrap justify-between gap-2 border-b border-border/50 pb-2">
              <dt className="text-muted-foreground">Giá nhân công</dt>
              <dd className="font-semibold tabular-nums text-foreground">{formatVnd(data.laborPrice?.amount)}</dd>
            </div>
            {data.serviceCategoryName ? (
              <div className="flex flex-wrap justify-between gap-2 border-b border-border/50 pb-2">
                <dt className="text-muted-foreground">Danh mục</dt>
                <dd className="max-w-[65%] text-right text-foreground">{data.serviceCategoryName}</dd>
              </div>
            ) : null}
            {data.estimatedDurationMinutes != null ? (
              <div className="flex flex-wrap justify-between gap-2 border-b border-border/50 pb-2">
                <dt className="text-muted-foreground">Thời gian ước tính</dt>
                <dd className="tabular-nums">~{data.estimatedDurationMinutes} phút</dd>
              </div>
            ) : null}
          </dl>

          {(() => {
            const hasExtra =
              Boolean(data.serviceCategoryId) ||
              Boolean(data.status) ||
              formatDateVi(data.updatedAt) != null ||
              formatDateVi(data.createdAt) != null;
            if (!hasExtra) return null;
            return (
              <CatalogDetailMoreSection contentLabel="Mã và trạng thái">
                <dl className="grid gap-2.5 text-sm">
                  {data.status ? (
                    <div className="flex flex-wrap justify-between gap-2 border-b border-border/40 pb-2">
                      <dt className="text-muted-foreground">Trạng thái</dt>
                      <dd className="text-foreground">{data.status}</dd>
                    </div>
                  ) : null}
                  {formatDateVi(data.updatedAt) || formatDateVi(data.createdAt) ? (
                    <p className="text-[11px] text-muted-foreground">
                      Cập nhật: {formatDateVi(data.updatedAt) ?? formatDateVi(data.createdAt)}
                    </p>
                  ) : null}
                </dl>
              </CatalogDetailMoreSection>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}

function CatalogListSkeleton() {
  return (
    <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex gap-3 p-3">
          <Skeleton className="size-18 shrink-0 rounded-lg sm:size-20" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-full max-w-[85%]" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-1 h-5 w-28" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export interface GarageBranchCatalogProps {
  branchId: string;
  className?: string;
  /** Mỗi khi danh sách đặt lịch thay đổi (thêm / xóa / xóa hết). */
  onBookingSelectionChange?: (ctx: { branchId: string; items: CatalogBookingLine[] }) => void;
}

function GarageBranchCatalogInner({ branchId, className, onBookingSelectionChange }: GarageBranchCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedCatalog, setExpandedCatalog] = useState<ExpandedCatalogRow>(null);
  const expandedRowRef = useRef<HTMLLIElement | null>(null);

  const cartLines = useBookingCartStore((s) => s.lines);
  const addLineToCart = useBookingCartStore((s) => s.addLine);

  const bookingLines = useMemo(() => cartLines.filter((l) => l.branchId === branchId), [cartLines, branchId]);

  useLayoutEffect(() => {
    if (!expandedCatalog) return;
    expandedRowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }, [expandedCatalog]);

  const {
    data: productDetail,
    isLoading: productDetailLoading,
    isError: productDetailError,
    error: productDetailErr,
  } = useGarageProductByIdQuery(
    expandedCatalog?.kind === "product" ? expandedCatalog.id : undefined,
    expandedCatalog?.kind === "product",
  );

  const {
    data: serviceDetail,
    isLoading: serviceDetailLoading,
    isError: serviceDetailError,
    error: serviceDetailErr,
  } = useGarageServiceByIdQuery(
    expandedCatalog?.kind === "service" ? expandedCatalog.id : undefined,
    expandedCatalog?.kind === "service",
  );

  const {
    data: bundleDetail,
    isLoading: bundleDetailLoading,
    isError: bundleDetailError,
    error: bundleDetailErr,
  } = useGarageBundleByIdQuery(
    expandedCatalog?.kind === "bundle" ? expandedCatalog.id : undefined,
    expandedCatalog?.kind === "bundle",
  );

  const typeFromUrl = searchParams.get("type");
  const tab = useMemo(() => parseTypeParam(typeFromUrl), [typeFromUrl]);

  const setTab = useCallback(
    (next: (typeof FILTER_TABS)[number]["id"]) => {
      setExpandedCatalog(null);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "all") {
        params.delete("type");
      } else {
        params.set("type", next);
      }
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const filters: GarageCatalogInfiniteFilters = useMemo(() => {
    const row = FILTER_TABS.find((t) => t.id === tab);
    if (!row?.api) return {};
    return { Type: row.api };
  }, [tab]);

  const { items, isLoading, isError, error, hasNextPage, isFetchingNextPage, fetchNextPage, isFetching } =
    useGarageCatalogInfinite(branchId, filters, { pageSize: 12, enabled: Boolean(branchId) });

  useEffect(() => {
    if (!branchId) return;
    const items: CatalogBookingLine[] = bookingLines.map((l) => ({
      kind: l.kind,
      catalogItemId: l.catalogItemId,
      name: l.name,
      ...(l.includeInstallation !== undefined ? { includeInstallation: l.includeInstallation } : {}),
      ...(l.unitPriceVnd != null ? { unitPriceVnd: l.unitPriceVnd } : {}),
      ...(l.imageUrl != null && l.imageUrl !== "" ? { imageUrl: l.imageUrl } : {}),
    }));
    onBookingSelectionChange?.({ branchId, items });
  }, [branchId, bookingLines, onBookingSelectionChange]);

  const handleAddExpandedToBooking = useCallback(() => {
    if (!expandedCatalog || !branchId) return;

    let name: string | null = null;
    let includeInstallation: boolean | undefined;

    if (expandedCatalog.kind === "product") {
      if (!productDetail) return;
      name = productDetail.name;
      includeInstallation = false;
    } else if (expandedCatalog.kind === "service") {
      if (!serviceDetail) return;
      name = serviceDetail.name;
    } else {
      if (!bundleDetail) return;
      name = bundleDetail.name;
    }

    let unitPriceVnd: number | null | undefined;
    let imageUrl: string | null | undefined;
    if (expandedCatalog.kind === "product" && productDetail) {
      unitPriceVnd = productDetail.materialPrice.amount;
      imageUrl = productDetail.imageUrl;
    } else if (expandedCatalog.kind === "service" && serviceDetail) {
      unitPriceVnd = serviceDetail.laborPrice.amount;
      imageUrl = serviceDetail.imageUrl;
    } else if (expandedCatalog.kind === "bundle" && bundleDetail) {
      unitPriceVnd = bundleDetail.finalPrice;
      imageUrl = bundleDetail.imageUrl;
    }

    const base: CatalogBookingLine = {
      kind: expandedCatalog.kind,
      catalogItemId: expandedCatalog.id,
      name,
      ...(includeInstallation !== undefined ? { includeInstallation } : {}),
      ...(unitPriceVnd != null ? { unitPriceVnd } : {}),
      ...(imageUrl != null && imageUrl !== "" ? { imageUrl } : {}),
    };

    const result = addLineToCart({ ...base, branchId });
    if (result === "duplicate") {
      toast.message("Mục này đã có trong danh sách đặt lịch.");
    } else if (result === "replaced-branch") {
      toast.warning("Giỏ đặt lịch đã chuyển sang chi nhánh này (một lịch chỉ một chi nhánh).");
    } else {
      toast.success("Đã thêm vào giỏ đặt lịch.");
    }
  }, [branchId, bundleDetail, expandedCatalog, addLineToCart, productDetail, serviceDetail]);

  const empty = !isLoading && !isError && items.length === 0;

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Danh mục tại chi nhánh</h2>
          <Badge variant="secondary" className="rounded-lg text-[10px] font-semibold uppercase">
            Đặt lịch
          </Badge>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Thêm nhiều mục: mở chi tiết → «Thêm vào đặt lịch». Xem giỏ, chọn mục cần đặt rồi «Tiếp tục đặt lịch» trên icon
          giỏ ở góc header.
        </p>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] sm:mx-0 sm:flex-wrap sm:overflow-visible">
        {FILTER_TABS.map((t) => {
          const active = tab === t.id;
          return (
            <Button
              key={t.id}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              className={cn(
                "shrink-0 rounded-xl px-3 text-xs font-semibold shadow-none sm:text-sm",
                active ? "shadow-sm" : "border-border/80 bg-background/80",
              )}
              onClick={() => setTab(t.id)}
            >
              <span className="sm:hidden">{t.short}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </Button>
          );
        })}
      </div>

      {isLoading && !items.length ? <CatalogListSkeleton /> : null}

      {isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : "Không tải được danh mục."}
        </div>
      ) : null}

      {empty ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
          <p className="text-sm font-medium text-foreground">Chưa có mục nào</p>
          <p className="mt-1 text-xs text-muted-foreground">Thử chọn nhóm khác hoặc quay lại sau.</p>
        </div>
      ) : null}

      {!isLoading && items.length > 0 ? (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          {items.map((item) => {
            const t = item.type.toLowerCase();
            const isProduct = t === "product";
            const isService = t === "service";
            const isBundle = t === "bundle";
            const kind: CatalogDetailKind | null = isProduct
              ? "product"
              : isService
                ? "service"
                : isBundle
                  ? "bundle"
                  : null;
            const expanded =
              kind != null &&
              expandedCatalog != null &&
              expandedCatalog.id === item.id &&
              expandedCatalog.kind === kind;
            const selectedForBooking =
              kind != null && bookingLines.some((l) => l.catalogItemId === item.id && l.kind === kind);
            return (
              <li
                key={`${item.type}-${item.id}`}
                ref={expanded ? expandedRowRef : undefined}
                className={cn("flex flex-col", expanded && "scroll-mt-4")}
              >
                <CatalogItemRow
                  item={item}
                  detailExpanded={expanded}
                  selectedForBooking={selectedForBooking}
                  onDetailToggle={
                    kind
                      ? () =>
                          setExpandedCatalog((prev) =>
                            prev?.id === item.id && prev.kind === kind ? null : { id: item.id, kind },
                          )
                      : undefined
                  }
                />
                {expanded && kind === "product" ? (
                  <div className="mx-1 mb-1.5 mt-0 rounded-lg border border-border/60 border-l-[3px] border-l-primary/50 bg-muted/30 p-3 shadow-sm ring-1 ring-black/4 sm:mx-2 sm:p-4 dark:bg-muted/20 dark:ring-white/6">
                    <GarageProductDetailInline
                      data={productDetail}
                      isLoading={productDetailLoading}
                      isError={productDetailError}
                      error={productDetailErr instanceof Error ? productDetailErr : null}
                      onBook={handleAddExpandedToBooking}
                    />
                  </div>
                ) : null}
                {expanded && kind === "service" ? (
                  <div className="mx-1 mb-1.5 mt-0 rounded-lg border border-border/60 border-l-[3px] border-l-sky-500/55 bg-muted/30 p-3 shadow-sm ring-1 ring-black/4 sm:mx-2 sm:p-4 dark:bg-muted/20 dark:ring-white/6">
                    <GarageServiceDetailInline
                      data={serviceDetail}
                      isLoading={serviceDetailLoading}
                      isError={serviceDetailError}
                      error={serviceDetailErr instanceof Error ? serviceDetailErr : null}
                      onBook={handleAddExpandedToBooking}
                    />
                  </div>
                ) : null}
                {expanded && kind === "bundle" ? (
                  <div className="mx-1 mb-1.5 mt-0 rounded-lg border border-border/60 border-l-[3px] border-l-violet-500/55 bg-muted/30 p-3 shadow-sm ring-1 ring-black/4 sm:mx-2 sm:p-4 dark:bg-muted/20 dark:ring-white/6">
                    <GarageBundleDetailInline
                      data={bundleDetail}
                      isLoading={bundleDetailLoading}
                      isError={bundleDetailError}
                      error={bundleDetailErr instanceof Error ? bundleDetailErr : null}
                      onBook={handleAddExpandedToBooking}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {hasNextPage ? (
        <div className="flex justify-center pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Đang tải…
              </>
            ) : (
              "Xem thêm"
            )}
          </Button>
        </div>
      ) : null}

      {isFetching && !isLoading && items.length > 0 ? (
        <p className="text-center text-[11px] text-muted-foreground">Đang cập nhật…</p>
      ) : null}
    </section>
  );
}

export function GarageBranchCatalog(props: GarageBranchCatalogProps) {
  return (
    <Suspense fallback={<CatalogListSkeleton />}>
      <GarageBranchCatalogInner
        key={props.branchId}
        branchId={props.branchId}
        className={props.className}
        onBookingSelectionChange={props.onBookingSelectionChange}
      />
    </Suspense>
  );
}
