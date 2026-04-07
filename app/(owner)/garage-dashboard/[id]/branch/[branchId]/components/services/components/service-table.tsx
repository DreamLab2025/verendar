"use client";

import { useMemo, useState } from "react";

import SafeImage from "@/components/ui/SafeImage";
import type { GarageServiceListItemDto } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

import { CatalogStatusBadge, formatDurationMinutes, formatVnd, ServiceRowActions } from "../page";
import { CATALOG_PAGE_SIZE, CatalogGridPagination } from "./catalog-grid-shared";

export { CatalogGridSkeleton as ServicesGridSkeleton } from "./catalog-grid-shared";

function ServiceCard({
  row,
  onViewService,
  onEditService,
  onDeleteService,
}: {
  row: GarageServiceListItemDto;
  onViewService: (id: string) => void;
  onEditService: (id: string) => void;
  onDeleteService: (id: string, name: string) => void;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-colors",
        "hover:border-border hover:shadow-md",
      )}
    >
      <div className="relative aspect-4/3 w-full shrink-0 bg-muted/30">
        {row.imageUrl ? (
          <SafeImage src={row.imageUrl} alt="" fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/40 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Chưa có ảnh
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3 sm:p-3.5">
        <div className="min-w-0 space-y-1">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {row.name}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{row.description ?? "—"}</p>
        </div>

        {row.serviceCategoryName ? (
          <p className="truncate text-[11px] text-muted-foreground">
            <span className="text-muted-foreground/80">Danh mục:</span> {row.serviceCategoryName}
          </p>
        ) : null}

        <div className="mt-auto space-y-2.5 border-t border-border/40 pt-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Giá NC</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">{formatVnd(row.laborPrice?.amount)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">Thời lượng</span>
            <span className="tabular-nums text-foreground">{formatDurationMinutes(row.estimatedDurationMinutes)}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CatalogStatusBadge status={row.status} className="h-6 border-0 bg-primary/10 px-2 text-[10px] font-medium text-primary" />
            <ServiceRowActions
              serviceId={row.id}
              serviceName={row.name}
              onView={onViewService}
              onEdit={onEditService}
              onDelete={onDeleteService}
              compact
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ServicesTable({
  rows,
  onViewService,
  onEditService,
  onDeleteService,
}: {
  rows: GarageServiceListItemDto[];
  onViewService: (id: string) => void;
  onEditService: (id: string) => void;
  onDeleteService: (id: string, name: string) => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const maxIndex = pageCount - 1;
  const currentIndex = Math.min(pageIndex, maxIndex);

  const pageRows = useMemo(() => {
    const start = currentIndex * CATALOG_PAGE_SIZE;
    return rows.slice(start, start + CATALOG_PAGE_SIZE);
  }, [rows, currentIndex]);

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Chưa có dịch vụ nào phù hợp bộ lọc.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pageRows.map((row) => (
          <ServiceCard
            key={row.id}
            row={row}
            onViewService={onViewService}
            onEditService={onEditService}
            onDeleteService={onDeleteService}
          />
        ))}
      </div>

      <CatalogGridPagination
        pageIndex={currentIndex}
        pageCount={pageCount}
        total={total}
        onPrev={() => setPageIndex((i) => Math.max(0, i - 1))}
        onNext={() => setPageIndex((i) => Math.min(maxIndex, i + 1))}
      />
    </div>
  );
}
