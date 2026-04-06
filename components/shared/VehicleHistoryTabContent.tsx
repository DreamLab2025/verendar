"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown, ClipboardList, Gauge } from "lucide-react";
import type { MaintenanceRecordListItem } from "@/lib/api/services/fetchMaintenanceRecord";
import type { OdometerHistoryItem } from "@/lib/api/services/fetchOdometer";
import { cn } from "@/lib/utils";

const BRAND = "#E22028";

function formatShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

function odometerSourceLabel(row: OdometerHistoryItem) {
  if (row.source === "ManualInput") return "Thủ công";
  if (row.source === "Scan") return "Quét";
  return "Tự động";
}

function ListRow({
  dotClassName,
  dotStyle,
  title,
  subtitle,
  meta,
}: {
  dotClassName?: string;
  dotStyle?: CSSProperties;
  title: string;
  subtitle: string;
  meta?: string | null;
}) {
  return (
    <div className="flex gap-3 border-b border-border/35 py-3 last:border-b-0 dark:border-border/25">
      <span
        className={cn("mt-1.5 size-2 shrink-0 rounded-full", dotClassName)}
        style={dotStyle}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-snug text-foreground">{title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{subtitle}</p>
        {meta ? <p className="mt-0.5 text-[11px] text-muted-foreground">{meta}</p> : null}
      </div>
    </div>
  );
}

function CollapsibleHistoryBlock({
  sectionId,
  title,
  icon: Icon,
  open,
  onToggle,
  countLabel,
  children,
}: {
  sectionId: string;
  title: string;
  icon: typeof Gauge;
  open: boolean;
  onToggle: () => void;
  countLabel?: string;
  children: ReactNode;
}) {
  const headingId = `${sectionId}-heading`;
  const panelId = `${sectionId}-panel`;

  return (
    <section className="min-h-0 shrink-0 border-b border-border/40 pb-1 dark:border-border/30">
      <button
        type="button"
        id={headingId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 py-2 text-left touch-manipulation transition-colors hover:text-foreground active:opacity-80"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold tracking-tight text-foreground">{title}</span>
            {countLabel ? (
              <span className="mt-0.5 block text-[11px] text-muted-foreground">{countLabel}</span>
            ) : null}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={panelId} role="region" aria-labelledby={headingId} className="mt-1">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export type VehicleHistoryTabContentProps = {
  odometerHistory: OdometerHistoryItem[];
  isLoadingOdometer: boolean;
  maintenanceRecords: MaintenanceRecordListItem[];
  isLoadingMaintenance: boolean;
  className?: string;
};

export function VehicleHistoryTabContent({
  odometerHistory,
  isLoadingOdometer,
  maintenanceRecords,
  isLoadingMaintenance,
  className,
}: VehicleHistoryTabContentProps) {
  const [odoOpen, setOdoOpen] = useState(true);
  const [maintOpen, setMaintOpen] = useState(true);

  const sortedOdo = useMemo(() => {
    return [...odometerHistory].sort((a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime());
  }, [odometerHistory]);

  const sortedMaintenance = useMemo(() => {
    return [...maintenanceRecords].sort(
      (a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime(),
    );
  }, [maintenanceRecords]);

  const odoCountLabel = isLoadingOdometer
    ? "Đang tải…"
    : sortedOdo.length === 0
      ? "Chưa có bản ghi"
      : `${sortedOdo.length} bản ghi`;

  const maintCountLabel = isLoadingMaintenance
    ? "Đang tải…"
    : sortedMaintenance.length === 0
      ? "Chưa có phiếu"
      : `${sortedMaintenance.length} phiếu`;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-5", className)}>
      <CollapsibleHistoryBlock
        sectionId="vehicle-history-odo"
        title="Cập nhật odo"
        icon={Gauge}
        open={odoOpen}
        onToggle={() => setOdoOpen((v) => !v)}
        countLabel={odoCountLabel}
      >
        {isLoadingOdometer ? (
          <div className="space-y-3 py-1" aria-busy="true" aria-label="Đang tải lịch sử odo">
            {[0, 1, 2].map((k) => (
              <div key={k} className="h-3 animate-pulse rounded-sm bg-muted/40" />
            ))}
          </div>
        ) : sortedOdo.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">Chưa có bản ghi cập nhật odo.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {sortedOdo.map((row) => {
              const manual = row.source === "ManualInput";
              return (
                <li key={row.id}>
                  <ListRow
                    dotClassName={manual ? "" : row.source === "Scan" ? "bg-violet-500" : "bg-foreground"}
                    dotStyle={manual ? { backgroundColor: BRAND } : undefined}
                    title={`${row.odometerValue.toLocaleString("vi-VN")} km`}
                    subtitle={`${formatShort(row.recordedDate)} · ${odometerSourceLabel(row)}`}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </CollapsibleHistoryBlock>

      <CollapsibleHistoryBlock
        sectionId="vehicle-history-maintenance"
        title="Bảo dưỡng"
        icon={ClipboardList}
        open={maintOpen}
        onToggle={() => setMaintOpen((v) => !v)}
        countLabel={maintCountLabel}
      >
        {isLoadingMaintenance ? (
          <div className="space-y-3 py-1" aria-busy="true" aria-label="Đang tải lịch sử bảo dưỡng">
            {[0, 1, 2].map((k) => (
              <div key={k} className="h-3 animate-pulse rounded-sm bg-muted/40" />
            ))}
          </div>
        ) : sortedMaintenance.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">Chưa có lịch sử bảo dưỡng.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {sortedMaintenance.map((rec) => (
              <li key={rec.id}>
                <ListRow
                  dotClassName="bg-primary"
                  title={`Phiếu bảo dưỡng · ${rec.itemCount} mục`}
                  subtitle={`${formatShort(rec.serviceDate)} · ${rec.odometerAtService.toLocaleString("vi-VN")} km`}
                  meta={rec.garageName ?? null}
                />
              </li>
            ))}
          </ul>
        )}
      </CollapsibleHistoryBlock>
    </div>
  );
}
