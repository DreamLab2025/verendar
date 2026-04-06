"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
} from "lucide-react";

import { BookingDetailSuccessLayout } from "@/components/booking/booking-detail-success-layout";
import { bookingStatusLabel } from "@/components/booking/booking-detail-body";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookingDetailEnrichedQuery, useUserBookingsCalendarQuery } from "@/hooks/useBookings";
import type { BookingListItemDto } from "@/lib/api/services/fetchBookings";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

const DOW_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const START_HOUR = 8;
const END_HOUR = 21;
const PX_PER_HOUR = 52;
const GRID_BODY_PX = (END_HOUR - START_HOUR) * PX_PER_HOUR;
const DEFAULT_DURATION_MIN = 60;

const STATUS_FILTER = [
  { value: "__all__", label: "Tất cả trạng thái" },
  { value: "Pending", label: bookingStatusLabel("Pending") },
  { value: "AwaitingConfirmation", label: bookingStatusLabel("AwaitingConfirmation") },
  { value: "Confirmed", label: bookingStatusLabel("Confirmed") },
  { value: "InProgress", label: bookingStatusLabel("InProgress") },
  { value: "Completed", label: bookingStatusLabel("Completed") },
  { value: "Cancelled", label: bookingStatusLabel("Cancelled") },
] as const;

function startOfWeekMonday(d: dayjs.Dayjs) {
  const dow = d.day();
  return d.add(dow === 0 ? -6 : 1 - dow, "day").startOf("day");
}

/** Một dòng: "Thứ Hai, 06/04/2026" */
function formatDayHeaderOneLine(d: dayjs.Dayjs): string {
  const wd = d.locale("vi").format("dddd");
  const titleCase = wd
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
  return `${titleCase}, ${d.format("DD/MM/YYYY")}`;
}

/** Một dòng: "Tuần làm việc · 06/04/2026 – 12/04/2026" */
function formatWeekHeaderOneLine(weekAnchor: dayjs.Dayjs): string {
  const a = weekAnchor;
  const b = weekAnchor.add(6, "day");
  return `Tuần làm việc · ${a.format("DD/MM/YYYY")} – ${b.format("DD/MM/YYYY")}`;
}

/** Một dòng: "Tháng 4 năm 2026" — không lặp năm ở dòng phụ */
function formatMonthHeaderOneLine(month: dayjs.Dayjs): string {
  return `Tháng ${month.month() + 1} năm ${month.year()}`;
}

type CalView = "day" | "week" | "month";

type StatusStyle = { strip: string; soft: string; dot: string };

function statusStyle(status: string): StatusStyle {
  switch (status) {
    case "Completed":
      return { strip: "border-l-emerald-500", soft: "bg-emerald-500/[0.08]", dot: "bg-emerald-500" };
    case "Confirmed":
      return { strip: "border-l-teal-500", soft: "bg-teal-500/[0.09]", dot: "bg-teal-500" };
    case "InProgress":
      return { strip: "border-l-sky-500", soft: "bg-sky-500/[0.09]", dot: "bg-sky-500" };
    case "Pending":
      return { strip: "border-l-rose-500", soft: "bg-rose-500/[0.08]", dot: "bg-rose-500" };
    case "AwaitingConfirmation":
      return { strip: "border-l-amber-500", soft: "bg-amber-500/[0.1]", dot: "bg-amber-500" };
    case "Cancelled":
      return { strip: "border-l-neutral-400", soft: "bg-neutral-500/[0.08]", dot: "bg-neutral-500" };
    default:
      return { strip: "border-l-primary", soft: "bg-primary/[0.06]", dot: "bg-primary" };
  }
}

function bookingTimeRange(b: BookingListItemDto): { startMin: number; endMin: number } {
  const t = dayjs(b.scheduledAt);
  const startMin = t.hour() * 60 + t.minute();
  return { startMin, endMin: startMin + DEFAULT_DURATION_MIN };
}

function intervalsOverlap(
  a: { startMin: number; endMin: number },
  b: { startMin: number; endMin: number },
): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

/** Các nhóm chồng lấn (liên thông theo cạnh overlap). */
function clusterOverlappingBookings(bookings: BookingListItemDto[]): BookingListItemDto[][] {
  if (bookings.length === 0) return [];
  const ranges = bookings.map((b) => ({ b, r: bookingTimeRange(b) }));
  const n = ranges.length;
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (intervalsOverlap(ranges[i].r, ranges[j].r)) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }
  const visited = new Set<number>();
  const clusters: BookingListItemDto[][] = [];
  function dfs(i: number, acc: BookingListItemDto[]) {
    visited.add(i);
    acc.push(ranges[i].b);
    for (const j of adj[i]) {
      if (!visited.has(j)) dfs(j, acc);
    }
  }
  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) {
      const acc: BookingListItemDto[] = [];
      dfs(i, acc);
      clusters.push(acc);
    }
  }
  return clusters;
}

/**
 * Trong một cụm chồng lấn: gán cột (greedy) để số cột tối thiểu.
 * Mỗi lịch: col + totalCols → chia ngang trong cùng một track thời gian.
 */
function assignColumnsInCluster(cluster: BookingListItemDto[]): Map<string, { col: number; totalCols: number }> {
  const items = cluster.map((b) => ({ b, r: bookingTimeRange(b) }));
  items.sort((a, b) => a.r.startMin - b.r.startMin || b.r.endMin - a.r.endMin);
  const columnEnds: number[] = [];
  const map = new Map<string, { col: number; totalCols: number }>();

  for (const { b, r } of items) {
    let col = -1;
    for (let c = 0; c < columnEnds.length; c++) {
      if (columnEnds[c] <= r.startMin) {
        col = c;
        break;
      }
    }
    if (col === -1) {
      col = columnEnds.length;
      columnEnds.push(r.endMin);
    } else {
      columnEnds[col] = r.endMin;
    }
    map.set(b.id, { col, totalCols: 0 });
  }
  const totalCols = Math.max(1, columnEnds.length);
  for (const id of map.keys()) {
    const v = map.get(id)!;
    map.set(id, { col: v.col, totalCols });
  }
  return map;
}

function overlapColumnLayout(bookings: BookingListItemDto[]): Map<string, { col: number; totalCols: number }> {
  const merged = new Map<string, { col: number; totalCols: number }>();
  for (const cluster of clusterOverlappingBookings(bookings)) {
    const m = assignColumnsInCluster(cluster);
    for (const [id, v] of m) merged.set(id, v);
  }
  return merged;
}

function eventLayout(scheduledAt: string): { top: number; height: number; clipped: boolean } {
  const t = dayjs(scheduledAt);
  const startMin = t.hour() * 60 + t.minute();
  const endMin = startMin + DEFAULT_DURATION_MIN;
  const win0 = START_HOUR * 60;
  const win1 = END_HOUR * 60;
  if (endMin <= win0) return { top: 0, height: 32, clipped: true };
  if (startMin >= win1) return { top: GRID_BODY_PX - 32, height: 32, clipped: true };
  const a = Math.max(startMin, win0);
  const b = Math.min(endMin, win1);
  const top = ((a - win0) / 60) * PX_PER_HOUR;
  const height = Math.max(((b - a) / 60) * PX_PER_HOUR, 36);
  return { top, height, clipped: false };
}

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function useMinuteClock() {
  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    const id = window.setInterval(() => setNow(dayjs()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function BookingHistoryList() {
  const [mounted, setMounted] = useState(false);
  const [statusKey, setStatusKey] = useState<string>("__all__");
  const [search, setSearch] = useState("");
  const [calView, setCalView] = useState<CalView>("day");
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeekMonday(dayjs()));
  const [focusDay, setFocusDay] = useState(() => dayjs().startOf("day"));
  const [calendarMonth, setCalendarMonth] = useState(() => dayjs().startOf("month"));
  const [detailId, setDetailId] = useState<string | null>(null);

  const now = useMinuteClock();

  const status = statusKey === "__all__" ? undefined : statusKey;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const q = useUserBookingsCalendarQuery({ status });

  const filteredBookings = useMemo(() => {
    const list = q.data ?? [];
    const qStr = search.trim().toLowerCase();
    if (!qStr) return list;
    return list.filter(
      (b) =>
        b.itemsSummary.toLowerCase().includes(qStr) ||
        b.branchName.toLowerCase().includes(qStr) ||
        bookingStatusLabel(b.status).toLowerCase().includes(qStr),
    );
  }, [q.data, search]);

  const byDay = useMemo(() => {
    const m: Record<string, BookingListItemDto[]> = {};
    for (const b of filteredBookings) {
      const key = dayjs(b.scheduledAt).format("YYYY-MM-DD");
      if (!m[key]) m[key] = [];
      m[key].push(b);
    }
    for (const k of Object.keys(m)) {
      m[k].sort((a, b) => dayjs(a.scheduledAt).valueOf() - dayjs(b.scheduledAt).valueOf());
    }
    return m;
  }, [filteredBookings]);

  /** Ngày có ít nhất một booking (theo bộ lọc) — dùng chấm đỏ trên mini lịch. */
  const datesWithBookings = useMemo(() => {
    const s = new Set<string>();
    for (const [iso, arr] of Object.entries(byDay)) {
      if (arr.length > 0) s.add(iso);
    }
    return s;
  }, [byDay]);

  const todayIso = dayjs().format("YYYY-MM-DD");

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekAnchor.add(i, "day")),
    [weekAnchor],
  );

  const weekRangeLabel = useMemo(() => formatWeekHeaderOneLine(weekAnchor), [weekAnchor]);

  const monthLabel = useMemo(() => formatMonthHeaderOneLine(calendarMonth), [calendarMonth]);
  const calMinMonth = dayjs().subtract(3, "year").startOf("month");
  const calMaxMonth = dayjs().add(2, "year").startOf("month");
  const canPrevMonth = calendarMonth.isAfter(calMinMonth, "month");
  const canNextMonth = calendarMonth.isBefore(calMaxMonth, "month");

  const gridCells = useMemo(() => {
    const first = calendarMonth.startOf("month");
    const start = first.subtract(first.day(), "day");
    const cells: dayjs.Dayjs[] = [];
    for (let i = 0; i < 42; i++) cells.push(start.add(i, "day"));
    return cells;
  }, [calendarMonth]);

  const legendBookings = useMemo(() => {
    if (calView === "day") {
      const iso = focusDay.format("YYYY-MM-DD");
      return filteredBookings.filter((b) => dayjs(b.scheduledAt).format("YYYY-MM-DD") === iso);
    }
    if (calView === "week") {
      const startIso = weekAnchor.format("YYYY-MM-DD");
      const endIso = weekAnchor.add(6, "day").format("YYYY-MM-DD");
      return filteredBookings.filter((row) => {
        const d = dayjs(row.scheduledAt).format("YYYY-MM-DD");
        return d >= startIso && d <= endIso;
      });
    }
    const y = calendarMonth.year();
    const m = calendarMonth.month();
    return filteredBookings.filter((b) => {
      const t = dayjs(b.scheduledAt);
      return t.year() === y && t.month() === m;
    });
  }, [calView, focusDay, weekAnchor, calendarMonth, filteredBookings]);

  const statusCounts = useMemo(() => {
    const keys = [
      "Pending",
      "AwaitingConfirmation",
      "Confirmed",
      "InProgress",
      "Completed",
      "Cancelled",
    ] as const;
    const counts: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));
    for (const b of legendBookings) {
      if (counts[b.status] !== undefined) counts[b.status]++;
    }
    return keys.map((k) => ({ key: k, label: bookingStatusLabel(k), count: counts[k], style: statusStyle(k) }));
  }, [legendBookings]);

  const completionPct = useMemo(() => {
    const active = legendBookings.filter((b) => b.status !== "Cancelled");
    if (active.length === 0) return 0;
    const done = active.filter((b) => b.status === "Completed").length;
    return Math.round((done / active.length) * 100);
  }, [legendBookings]);

  const hasActiveFilters = statusKey !== "__all__" || search.trim() !== "";

  function clearFilters() {
    setStatusKey("__all__");
    setSearch("");
  }

  function goToday() {
    const t = dayjs();
    if (calView === "week") setWeekAnchor(startOfWeekMonday(t));
    else if (calView === "day") setFocusDay(t.startOf("day"));
    else setCalendarMonth(t.startOf("month"));
  }

  const openDetail = useCallback((id: string) => setDetailId(id), []);

  const headerTitle =
    calView === "day"
      ? formatDayHeaderOneLine(focusDay)
      : calView === "week"
        ? weekRangeLabel
        : monthLabel;

  if (q.isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">{(q.error as Error)?.message ?? "Không tải được lịch hẹn."}</p>
        <Button onClick={() => void q.refetch()} variant="outline" className="rounded-xl">
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden sm:gap-3">
      {/* Thanh công cụ gọn */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Select value={statusKey} onValueChange={setStatusKey}>
            <SelectTrigger className="h-9 w-[min(100%,220px)] rounded-lg border-border/50 bg-background text-sm">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 sm:max-w-xs">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm nhanh…"
              className="w-full min-w-0 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {hasActiveFilters ? (
            <Button type="button" variant="ghost" size="sm" className="h-9 rounded-lg text-primary" onClick={clearFilters}>
              Xóa lọc
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="h-9 gap-1.5 rounded-lg px-3">
            <Link href="/user/garage">
              <Plus className="h-4 w-4" />
              Đặt lịch
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg"
            onClick={() => void q.refetch()}
            disabled={mounted && q.isFetching}
          >
            <RefreshCcw className={cn("h-4 w-4", mounted && q.isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {q.isPending ? (
        <SheetSkeleton />
      ) : (q.data ?? []).length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/30 p-6 text-center">
          <CalendarDays className="mb-3 size-10 text-muted-foreground/50" />
          <h3 className="text-base font-semibold">Chưa có lịch hẹn</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Đặt lịch qua garage để xem ở đây.</p>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* Cột chính — calendar sheet */}
          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-muted/20 px-3 py-2.5 sm:px-4">
              <div className="flex min-w-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 rounded-full"
                  onClick={() => {
                    if (calView === "week") setWeekAnchor((w) => w.subtract(7, "day"));
                    else if (calView === "day") setFocusDay((d) => d.subtract(1, "day"));
                    else setCalendarMonth((m) => m.clone().subtract(1, "month"));
                  }}
                  disabled={calView === "month" && !canPrevMonth}
                  aria-label="Trước"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <button
                  type="button"
                  onClick={goToday}
                  className="min-w-0 px-1 text-left"
                >
                  <span className="block truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
                    {headerTitle}
                  </span>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 rounded-full"
                  onClick={() => {
                    if (calView === "week") setWeekAnchor((w) => w.add(7, "day"));
                    else if (calView === "day") setFocusDay((d) => d.add(1, "day"));
                    else setCalendarMonth((m) => m.clone().add(1, "month"));
                  }}
                  disabled={calView === "month" && !canNextMonth}
                  aria-label="Sau"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" size="sm" className="h-8 rounded-md px-3 text-xs" onClick={goToday}>
                  Hôm nay
                </Button>
                <div className="flex rounded-lg border border-border/60 bg-muted/40 p-0.5">
                  {(
                    [
                      ["day", "Ngày"],
                      ["week", "Tuần"],
                      ["month", "Tháng"],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setCalView(v);
                        if (v === "week") setWeekAnchor(startOfWeekMonday(focusDay));
                        if (v === "month") setCalendarMonth(focusDay.startOf("month"));
                      }}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors sm:px-3 sm:text-xs",
                        calView === v
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              {calView === "month" ? (
                <div className="h-full overflow-auto p-2 sm:p-3">
                  <div className="grid grid-cols-7 gap-px bg-border/50">
                    {DOW_VI.map((d) => (
                      <div
                        key={d}
                        className="bg-muted/30 py-2 text-center text-[10px] font-semibold uppercase text-muted-foreground sm:text-xs"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-px bg-border/50">
                    {gridCells.map((d) => {
                      const iso = d.format("YYYY-MM-DD");
                      const inMonth = d.month() === calendarMonth.month() && d.year() === calendarMonth.year();
                      const dayBookings = byDay[iso] ?? [];
                      const isToday = iso === todayIso;
                      return (
                        <div
                          key={iso}
                          className={cn(
                            "min-h-20 border-r border-b border-border/30 bg-background p-1 sm:min-h-24",
                            !inMonth && "bg-muted/20 opacity-70",
                            isToday && "ring-1 ring-inset ring-primary/35",
                          )}
                        >
                          <div
                            className={cn(
                              "mb-0.5 text-[11px] font-semibold tabular-nums sm:text-xs",
                              inMonth ? "text-foreground" : "text-muted-foreground",
                              isToday && "text-primary",
                            )}
                          >
                            {d.date()}
                          </div>
                          <div className="flex max-h-16 flex-col gap-0.5 overflow-y-auto">
                            {dayBookings.map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => openDetail(b.id)}
                                className={cn(
                                  "w-full truncate rounded border-l-[3px] px-1 py-px text-left text-[9px] leading-tight",
                                  statusStyle(b.status).strip,
                                  statusStyle(b.status).soft,
                                )}
                              >
                                <span className="font-semibold tabular-nums">{dayjs(b.scheduledAt).format("HH:mm")}</span>{" "}
                                {b.itemsSummary}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : calView === "day" ? (
                <DaySheetGrid
                  day={focusDay}
                  now={now}
                  bookings={byDay[focusDay.format("YYYY-MM-DD")] ?? []}
                  onOpen={openDetail}
                />
              ) : (
                <WeekSheetGrid weekDays={weekDays} now={now} byDay={byDay} onOpen={openDetail} todayIso={todayIso} />
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="flex min-h-0 w-full flex-col gap-3 overflow-y-auto lg:max-h-none">
            <MiniMonthCalendar
              month={calendarMonth}
              focusDay={focusDay}
              todayIso={todayIso}
              datesWithBookings={datesWithBookings}
              onPrev={() => setCalendarMonth((m) => m.clone().subtract(1, "month"))}
              onNext={() => setCalendarMonth((m) => m.clone().add(1, "month"))}
              onPickDay={(d) => {
                setFocusDay(d.startOf("day"));
                setCalView("day");
              }}
              canPrev={canPrevMonth}
              canNext={canNextMonth}
            />
            <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trạng thái</p>
              <ul className="mt-2 space-y-2">
                {statusCounts.map(({ key, label, count, style }) => (
                  <li key={key} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={cn("size-2.5 shrink-0 rounded-sm", style.dot)} />
                      <span className="truncate text-muted-foreground">{label}</span>
                    </span>
                    <span className="tabular-nums font-medium text-foreground">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
              <p className="text-center text-xs font-medium text-muted-foreground">Tiến độ (phạm vi đang xem)</p>
              <SemiGauge value={completionPct} />
            </div>
          </aside>
        </div>
      )}

      {filteredBookings.length === 0 && (q.data ?? []).length > 0 ? (
        <p className="text-center text-xs text-muted-foreground">
          Không có lịch khớp bộ lọc.{" "}
          <button type="button" className="font-medium text-primary underline" onClick={clearFilters}>
            Xóa lọc
          </button>
        </p>
      ) : null}

      <BookingHistoryDetailDialog bookingId={detailId} open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)} />
    </div>
  );
}

function SemiGauge({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  const circumference = 52;
  const dash = (v / 100) * circumference;
  return (
    <div className="relative mx-auto mt-3 flex h-24 w-full max-w-[200px] flex-col items-center justify-end">
      <svg viewBox="0 0 120 64" className="w-full" aria-hidden>
        <path
          d="M 12 52 A 48 48 0 0 1 108 52"
          fill="none"
          className="stroke-muted"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 12 52 A 48 48 0 0 1 108 52"
          fill="none"
          className="stroke-primary"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          pathLength={circumference}
        />
      </svg>
      <span className="absolute bottom-1 text-2xl font-bold tabular-nums text-foreground">{v}%</span>
    </div>
  );
}

function MiniMonthCalendar({
  month,
  focusDay,
  todayIso,
  datesWithBookings,
  onPrev,
  onNext,
  onPickDay,
  canPrev,
  canNext,
}: {
  month: dayjs.Dayjs;
  focusDay: dayjs.Dayjs;
  todayIso: string;
  /** Các ngày YYYY-MM-DD có ít nhất một lịch (đã lọc). */
  datesWithBookings: Set<string>;
  onPrev: () => void;
  onNext: () => void;
  onPickDay: (d: dayjs.Dayjs) => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const cells = useMemo(() => {
    const first = month.startOf("month");
    const start = first.subtract(first.day(), "day");
    const out: dayjs.Dayjs[] = [];
    for (let i = 0; i < 42; i++) out.push(start.add(i, "day"));
    return out;
  }, [month]);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="icon" className="size-8 rounded-full" disabled={!canPrev} onClick={onPrev}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold capitalize">{month.locale("vi").format("MMMM YYYY")}</span>
        <Button type="button" variant="ghost" size="icon" className="size-8 rounded-full" disabled={!canNext} onClick={onNext}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-muted-foreground">
        {DOW_VI.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-0.5">
        {cells.map((d) => {
          const iso = d.format("YYYY-MM-DD");
          const inMonth = d.month() === month.month() && d.year() === month.year();
          const isToday = iso === todayIso;
          const isSel = iso === focusDay.format("YYYY-MM-DD");
          const hasBooking = datesWithBookings.has(iso);
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onPickDay(d)}
              title={hasBooking ? "Có lịch hẹn" : undefined}
              className={cn(
                "relative aspect-square max-h-9 rounded-md text-xs font-medium tabular-nums transition-colors",
                !inMonth && "text-muted-foreground/50",
                inMonth && "text-foreground",
                isToday && "ring-1 ring-primary/40",
                isSel && "bg-foreground text-background hover:bg-foreground/90",
                !isSel && "hover:bg-muted",
              )}
            >
              {hasBooking ? (
                <span
                  className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-red-500 shadow-sm ring-1 ring-background"
                  aria-hidden
                />
              ) : null}
              <span className="relative z-[1]">{d.date()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DaySheetGrid({
  day,
  now,
  bookings,
  onOpen,
}: {
  day: dayjs.Dayjs;
  now: dayjs.Dayjs;
  bookings: BookingListItemDto[];
  onOpen: (id: string) => void;
}) {
  const isToday = day.isSame(now, "day");
  const nowMin = now.hour() * 60 + now.minute();
  const win0 = START_HOUR * 60;
  const win1 = END_HOUR * 60;
  const showNow = isToday && nowMin >= win0 && nowMin < win1;
  const nowTop = ((nowMin - win0) / 60) * PX_PER_HOUR;

  const colLayout = useMemo(() => overlapColumnLayout(bookings), [bookings]);

  return (
    <div className="flex min-h-0 flex-1 overflow-auto">
      <div className="sticky left-0 z-10 flex w-14 shrink-0 flex-col border-r border-border/50 bg-card/95 py-2 backdrop-blur-sm sm:w-16">
        {HOURS.map((h) => (
          <div
            key={h}
            className="shrink-0 pr-2 text-right text-[11px] tabular-nums text-muted-foreground"
            style={{ height: PX_PER_HOUR }}
          >
            {dayjs().hour(h).minute(0).format("HH:mm")}
          </div>
        ))}
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="relative border-l border-border/30 px-0.5" style={{ height: GRID_BODY_PX }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="pointer-events-none absolute left-0 right-0 border-t border-border/25"
              style={{ top: (h - START_HOUR) * PX_PER_HOUR }}
            />
          ))}
          {showNow ? (
            <div
              className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
              style={{ top: nowTop }}
            >
              <span className="absolute -left-14 w-12 text-right text-[10px] font-semibold text-teal-600 sm:-left-16">
                {now.format("HH:mm")}
              </span>
              <div className="h-0.5 w-full bg-teal-500 shadow-[0_0_0_1px_rgba(20,184,166,0.35)]" />
            </div>
          ) : null}
          {bookings.map((b) => {
            const layout = eventLayout(b.scheduledAt);
            const st = statusStyle(b.status);
            const start = dayjs(b.scheduledAt);
            const end = start.add(DEFAULT_DURATION_MIN, "minute");
            const { col, totalCols } = colLayout.get(b.id) ?? { col: 0, totalCols: 1 };
            const colW = 100 / totalCols;
            const leftPct = (col / totalCols) * 100;
            return (
              <div
                key={b.id}
                className={cn(
                  "absolute z-10 box-border overflow-hidden rounded-lg border border-border/40 bg-background/90 shadow-sm backdrop-blur-sm",
                  st.strip,
                  "border-l-4",
                  st.soft,
                  layout.clipped && "opacity-75 ring-1 ring-dashed ring-amber-400/50",
                )}
                style={{
                  top: layout.top,
                  height: layout.height,
                  left: `${leftPct}%`,
                  width: `${colW}%`,
                  paddingLeft: 3,
                  paddingRight: 3,
                }}
              >
                <div className="flex h-full min-h-[36px] flex-col p-2 pr-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight text-foreground">{b.itemsSummary}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                      {start.format("HH:mm")} – {end.format("HH:mm")}
                    </p>
                  </div>
                  <div className="mt-1 flex shrink-0 items-center gap-1 sm:mt-0">
                    <div className="flex -space-x-1.5">
                      <Avatar className="size-6 border-2 border-background text-[10px]">
                        <AvatarFallback className="bg-muted text-[10px] font-medium">
                          {(b.branchName || "?").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Avatar className="size-6 border-2 border-background text-[10px]">
                        <AvatarFallback className="bg-primary/15 text-[10px] text-primary">+</AvatarFallback>
                      </Avatar>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0 rounded-full">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onOpen(b.id)}>Chi tiết</DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/user/booking-history/${b.id}`}>Mở trang đầy đủ</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekSheetGrid({
  weekDays,
  now,
  byDay,
  onOpen,
  todayIso,
}: {
  weekDays: dayjs.Dayjs[];
  now: dayjs.Dayjs;
  byDay: Record<string, BookingListItemDto[]>;
  onOpen: (id: string) => void;
  todayIso: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 overflow-auto">
      <div className="sticky left-0 z-20 flex w-12 shrink-0 flex-col border-r border-border/50 bg-card/95 py-2 backdrop-blur-sm sm:w-14">
        {HOURS.map((h) => (
          <div
            key={h}
            className="shrink-0 pr-1 text-right text-[10px] tabular-nums text-muted-foreground"
            style={{ height: PX_PER_HOUR }}
          >
            {dayjs().hour(h).minute(0).format("HH:mm")}
          </div>
        ))}
      </div>
      <div className="flex min-w-[700px] flex-1 divide-x divide-border/40">
        {weekDays.map((day) => {
          const iso = day.format("YYYY-MM-DD");
          const bookings = byDay[iso] ?? [];
          const isToday = iso === todayIso;
          const showNow = isToday && now.format("YYYY-MM-DD") === iso;
          const nowMin = now.hour() * 60 + now.minute();
          const win0 = START_HOUR * 60;
          const win1 = END_HOUR * 60;
          const line =
            showNow && nowMin >= win0 && nowMin < win1 ? ((nowMin - win0) / 60) * PX_PER_HOUR : null;

          return (
            <div key={iso} className="relative min-w-[92px] flex-1 bg-background/50">
              <div
                className={cn(
                  "sticky top-0 z-10 border-b border-border/50 bg-muted/25 px-1 py-1.5 text-center text-[10px] font-semibold backdrop-blur-sm",
                  isToday && "bg-primary/10",
                )}
              >
                <span className="text-muted-foreground">{DOW_VI[day.day()]}</span>{" "}
                <span className={cn("tabular-nums", isToday && "text-primary")}>{day.date()}</span>
              </div>
              <div className="relative px-0.5" style={{ height: GRID_BODY_PX }}>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="pointer-events-none absolute left-0 right-0 border-t border-border/20"
                    style={{ top: (h - START_HOUR) * PX_PER_HOUR }}
                  />
                ))}
                {line != null ? (
                  <div className="pointer-events-none absolute left-0 right-0 z-5" style={{ top: line }}>
                    <div className="h-0.5 w-full bg-teal-500/90" />
                  </div>
                ) : null}
                {(() => {
                  const colLayout = overlapColumnLayout(bookings);
                  return bookings.map((b) => {
                  const layout = eventLayout(b.scheduledAt);
                  const st = statusStyle(b.status);
                  const start = dayjs(b.scheduledAt);
                  const end = start.add(DEFAULT_DURATION_MIN, "minute");
                  const { col, totalCols } = colLayout.get(b.id) ?? { col: 0, totalCols: 1 };
                  const colW = 100 / totalCols;
                  const leftPct = (col / totalCols) * 100;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onOpen(b.id)}
                      className={cn(
                        "absolute z-6 box-border overflow-hidden rounded-md border border-border/35 text-left shadow-sm",
                        st.strip,
                        "border-l-[3px]",
                        st.soft,
                        layout.clipped && "opacity-70",
                      )}
                      style={{
                        top: layout.top,
                        height: layout.height,
                        left: `${leftPct}%`,
                        width: `${colW}%`,
                        paddingLeft: 2,
                        paddingRight: 2,
                      }}
                    >
                      <span className="block truncate px-1.5 pt-1 text-[10px] font-semibold leading-tight">
                        {b.itemsSummary}
                      </span>
                      <span className="block px-1.5 pb-1 text-[9px] tabular-nums text-muted-foreground">
                        {start.format("HH:mm")}–{end.format("HH:mm")}
                      </span>
                    </button>
                  );
                  });
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingHistoryDetailDialog({
  bookingId,
  open,
  onOpenChange,
}: {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const q = useBookingDetailEnrichedQuery(bookingId ?? undefined, open && !!bookingId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(90dvh,100svh)] w-[calc(100vw-1rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border p-0 sm:max-h-[min(92vh,900px)]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Chi tiết lịch hẹn</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-0">
          {q.isPending ? (
            <div className="space-y-3 px-4 py-3 sm:px-6 sm:py-4">
              <Skeleton className="h-8 w-2/3 max-w-sm" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : q.isError ? (
            <p className="px-4 py-3 text-sm text-destructive sm:px-6 sm:py-4">{q.error?.message ?? "Không tải được chi tiết."}</p>
          ) : q.data ? (
            <BookingDetailSuccessLayout
              data={q.data}
              variant="detail"
              showHeader={false}
              stepperLayoutId="booking-history-dialog-progress-pill"
              className="rounded-none border-0 shadow-none sm:rounded-none dark:sm:shadow-none"
            />
          ) : null}
        </div>
        {q.isFetching && !q.isPending ? (
          <div className="flex items-center gap-2 border-t border-border/50 px-4 py-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Đang làm mới…
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SheetSkeleton() {
  return (
    <div className="grid min-h-[420px] grid-cols-1 gap-3 lg:grid-cols-[1fr_280px]">
      <div className="rounded-xl border border-border/60 bg-card p-3">
        <Skeleton className="mb-3 h-10 w-full" />
        <Skeleton className="h-[360px] w-full rounded-lg" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}
