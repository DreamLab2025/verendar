import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import React from "react";

import { cn } from "@/lib/utils";

export interface PickerItem {
  key: string;
  label: string;
  [k: string]: unknown;
}

export interface ScrollPickerPanelProps {
  items: PickerItem[];
  renderDetail?: (item: PickerItem) => React.ReactNode;
  /** Tham số thứ hai: ô đang ở giữa (nền accent), gồm cả lúc đang animate */
  renderItem?: (item: PickerItem, isHighlighted: boolean) => React.ReactNode;
  visibleCount?: number;
  className?: string;
  defaultSelectedKey?: string;
  onSelect?: (item: PickerItem) => void;
  itemClassName?: string;
  activeItemClassName?: string;
  detailClassName?: string;
  panelHeight?: number;
  /** Khoảng cách dọc giữa các ô (px) — tăng để icon không bị dẹp khi panel cao */
  slotGap?: number;
  /** Màu nền ô đang chọn (giữa picker); ô khác nền trắng / chữ tối */
  accentColor?: string;
}

const SIZES = [0.48, 0.58, 0.76, 1, 0.76, 0.58, 0.48];
const OPACS = [0.5, 0.6, 0.8, 1, 0.8, 0.6, 0.5];

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const ScrollPickerPanel = ({
  items,
  renderDetail,
  renderItem,
  visibleCount = 7,
  className = "",
  defaultSelectedKey,
  onSelect,
  itemClassName = "",
  activeItemClassName = "",
  detailClassName = "",
  panelHeight = 560,
  slotGap = 8,
  accentColor = "#E22028",
}: ScrollPickerPanelProps) => {
  const len = items.length;
  const half = Math.floor(visibleCount / 2);
  const slotH = Math.floor((panelHeight - (visibleCount - 1) * slotGap) / visibleCount);

  const [activeIdx, setActiveIdx] = useState(() => {
    if (defaultSelectedKey) {
      const i = items.findIndex((it) => it.key === defaultSelectedKey);
      if (i >= 0) return i;
    }
    return 0;
  });

  // Animated offset for smooth sliding: 0 = resting, animates toward 0
  const [offset, setOffset] = useState(0);
  const animRef = useRef<number>(0);
  const pendingDir = useRef(0);

  const wrap = useCallback((i: number) => ((i % len) + len) % len, [len]);

  // Build 9 slots (7 visible + 1 each side for animation)
  const slots = useMemo(() => {
    if (len === 0) return [];
    const result: { item: PickerItem; pos: number }[] = [];
    for (let p = -1; p <= visibleCount; p++) {
      const rawIdx = activeIdx + (p - half);
      const item = items[wrap(rawIdx)];
      if (item) result.push({ item, pos: p });
    }
    return result;
  }, [items, len, activeIdx, visibleCount, half, wrap]);

  const doNavigate = useCallback(
    (dir: number) => {
      if (pendingDir.current !== 0) return;
      pendingDir.current = dir;

      // Start from offset = dir (items shift by 1 slot in direction)
      // then animate offset back to 0
      const startTime = performance.now();
      const duration = 350;
      const startOffset = dir;

      cancelAnimationFrame(animRef.current);

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        // ease out cubic
        const ease = 1 - Math.pow(1 - t, 3);
        const current = startOffset * (1 - ease);
        setOffset(current);

        if (t < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          setOffset(0);
          pendingDir.current = 0;
        }
      };

      // Update active index immediately (do not call onSelect inside setState updater — it updates parent during child's update)
      let nextIdx = 0;
      setActiveIdx((prev) => {
        nextIdx = wrap(prev + dir);
        return nextIdx;
      });
      queueMicrotask(() => onSelect?.(items[nextIdx]));

      animRef.current = requestAnimationFrame(tick);
    },
    [wrap, items, onSelect],
  );

  /** Đường ngắn nhất trên vòng tròn index (signed steps) */
  const shortestDelta = useCallback(
    (from: number, to: number) => {
      if (len === 0) return 0;
      let d = to - from;
      d = ((d % len) + len) % len;
      if (d > len / 2) d -= len;
      return d;
    },
    [len],
  );

  /** Click: cuộn mượt tới mục (offset steps → 0), không nhảy tức thì */
  const scrollToIndex = useCallback(
    (targetIdx: number) => {
      if (len === 0) return;
      const next = wrap(targetIdx);
      const steps = shortestDelta(activeIdx, next);
      if (steps === 0) return;

      cancelAnimationFrame(animRef.current);
      pendingDir.current = steps > 0 ? 1 : -1;

      setActiveIdx(next);
      queueMicrotask(() => onSelect?.(items[next]));

      const startOffset = steps;
      const startTime = performance.now();
      const duration = Math.min(280 + Math.abs(steps) * 100, 900);

      setOffset(startOffset);

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const current = startOffset * (1 - ease);
        setOffset(current);

        if (t < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          setOffset(0);
          pendingDir.current = 0;
        }
      };

      animRef.current = requestAnimationFrame(tick);
    },
    [len, wrap, items, onSelect, activeIdx, shortestDelta],
  );

  useEffect(() => {
    const item = items[activeIdx];
    if (item) queueMicrotask(() => onSelect?.(item));
    // Chỉ đồng bộ lần mount; navigate đã gọi onSelect trong doNavigate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wheel
  const wheelLock = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (wheelLock.current || pendingDir.current !== 0) return;
      wheelLock.current = true;
      // Lăn xuống (deltaY > 0) → item tiếp theo phía dưới list (giống gesture “kéo list lên”)
      doNavigate(e.deltaY > 0 ? -1 : 1);
      setTimeout(() => {
        wheelLock.current = false;
      }, 300);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [doNavigate]);

  // Touch
  const touchY = useRef(0);

  const selectedItem = items[activeIdx] || null;

  const detailBorderTint =
    accentColor.startsWith("#") && accentColor.length === 7 ? `${accentColor}33` : accentColor;

  /** Cuộn chip đang chọn trong rail (mobile) — không dùng scrollIntoView để tránh kéo cả trang lệch ngang */
  const mobileChipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileRailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = mobileRailRef.current;
    const btn = mobileChipRefs.current[activeIdx];
    if (!rail || !btn) return;
    const run = () => {
      const r = rail.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      const nextLeft = rail.scrollLeft + (b.left - r.left) + b.width / 2 - r.width / 2;
      const maxLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
      rail.scrollTo({ left: Math.max(0, Math.min(nextLeft, maxLeft)), behavior: "smooth" });
    };
    requestAnimationFrame(run);
  }, [activeIdx]);

  const jumpToIndex = useCallback(
    (targetIdx: number) => {
      if (len === 0) return;
      const next = wrap(targetIdx);
      if (next === activeIdx && Math.abs(offset) < 0.001) return;
      cancelAnimationFrame(animRef.current);
      setOffset(0);
      pendingDir.current = 0;
      setActiveIdx(next);
      queueMicrotask(() => onSelect?.(items[next]));
    },
    [len, wrap, activeIdx, offset, items, onSelect],
  );

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-3 overflow-x-hidden lg:h-(--sp-ph) lg:flex-row lg:gap-4",
        className,
      )}
      style={
        {
          "--sp-ph": `${panelHeight}px`,
          "--detail-accent-border": detailBorderTint,
          fontFamily: "system-ui, -apple-system, sans-serif",
        } as React.CSSProperties
      }
    >
      {/* Mobile: hàng icon nằm ngang (cuộn trong rail), chi tiết full width bên dưới — scrollTo(left) thay scrollIntoView */}
      {len > 0 ? (
        <div className="w-full shrink-0 lg:hidden">
          <div className="rounded-xl border border-border/60 bg-muted/40 py-2 pl-2 pr-1 dark:bg-muted/25">
            <div
              ref={mobileRailRef}
              className={cn(
                "scrollbar-hide flex overflow-x-auto overscroll-x-contain px-0.5 pb-0.5 touch-pan-x",
                "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                "snap-x snap-mandatory scroll-pl-2 scroll-pr-2",
              )}
              role="tablist"
              aria-label="Chọn phụ tùng"
            >
              <div className="flex w-max flex-row items-center gap-2.5 py-1 pr-2">
                {items.map((item, i) => {
                  const highlighted = i === activeIdx;
                  return (
                    <button
                      key={item.key}
                      ref={(el) => {
                        mobileChipRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      aria-selected={highlighted}
                      aria-label={item.label}
                      onClick={() => jumpToIndex(i)}
                      className={cn(
                        "flex size-[52px] shrink-0 snap-center items-center justify-center rounded-2xl border-2 transition-all touch-manipulation active:scale-95",
                        itemClassName,
                        highlighted
                          ? cn("text-white shadow-md", activeItemClassName)
                          : "border-border/50 bg-background text-foreground shadow-sm dark:bg-card",
                      )}
                      style={
                        highlighted
                          ? {
                              borderColor: accentColor,
                              background: accentColor,
                              boxShadow: `0 2px 12px -2px ${accentColor}66`,
                            }
                          : undefined
                      }
                    >
                      <span className="flex size-11 items-center justify-center overflow-hidden rounded-[10px]">
                        {renderItem ? (
                          renderItem(item, highlighted)
                        ) : (
                          <span className="max-w-12 truncate px-1 text-center text-[11px] font-medium">{item.label}</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Desktop: picker dọc */}
      <div className="hidden w-full shrink-0 justify-center overflow-hidden lg:flex lg:h-full lg:w-auto lg:justify-start">
        <div
          ref={wrapperRef}
          onTouchStart={(e) => {
            touchY.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            const dy = touchY.current - e.changedTouches[0].clientY;
            if (dy > 25) doNavigate(-1);
            else if (dy < -25) doNavigate(1);
          }}
          style={{
            position: "relative",
            width: slotH + 8,
            minWidth: slotH + 8,
            height: panelHeight,
            overflow: "hidden",
            cursor: "ns-resize",
            userSelect: "none",
          }}
        >
        {/* Fade edges */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-2 h-10 bg-linear-to-b from-white to-transparent dark:from-neutral-950"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-2 h-10 bg-linear-to-t from-white to-transparent dark:from-neutral-950"
          aria-hidden
        />

        {slots.map(({ item, pos }) => {
          // Apply animated offset
          const visualPos = pos - offset;
          // Y position: center the visibleCount slots
          const centerY = panelHeight / 2;
          const y = centerY + (visualPos - half) * (slotH + slotGap) - slotH / 2;

          // Interpolate scale/opacity based on continuous position
          const distFromCenter = Math.abs(visualPos - half);
          const floorIdx = Math.max(0, Math.min(half, Math.floor(distFromCenter)));
          const ceilIdx = Math.min(half, floorIdx + 1);
          const frac = distFromCenter - floorIdx;

          const sFloor = SIZES[half - floorIdx] ?? SIZES[0];
          const sCeil = SIZES[half - ceilIdx] ?? SIZES[0];
          const scale = lerp(sFloor, sCeil, frac);

          const oFloor = OPACS[half - floorIdx] ?? OPACS[0];
          const oCeil = OPACS[half - ceilIdx] ?? OPACS[0];
          const opacity = lerp(oFloor, oCeil, frac);

          const isActive = pos === half && offset === 0;
          const isHighlighted = distFromCenter < 0.5;
          const size = Math.round(slotH * Math.max(scale, 0.44));

          // Hide if out of view
          if (y < -slotH || y > panelHeight + slotH) return null;

          return (
            <div
              key={`slot-${pos}`}
              style={{
                position: "absolute",
                top: y,
                left: 0,
                width: "100%",
                height: slotH,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const targetIdx = items.findIndex((i) => i.key === item.key);
                  if (targetIdx < 0) return;
                  if (targetIdx === activeIdx && Math.abs(offset) < 0.001) return;
                  scrollToIndex(targetIdx);
                }}
                className={cn(
                  itemClassName,
                  isActive && activeItemClassName,
                  !isHighlighted &&
                    "border border-neutral-200 bg-white text-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100",
                )}
                style={{
                  width: size,
                  height: size,
                  borderRadius: 12,
                  border: isHighlighted ? `2px solid ${accentColor}` : undefined,
                  background: isHighlighted ? accentColor : undefined,
                  color: isHighlighted ? "#ffffff" : undefined,
                  opacity,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: Math.max(12, Math.round(15 * scale)),
                  fontWeight: isHighlighted ? 600 : 500,
                  padding: 0,
                  outline: "none",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {renderItem ? (
                  renderItem(item, isHighlighted)
                ) : (
                  <span
                    style={{
                      padding: "0 8px",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            </div>
          );
        })}
        </div>
      </div>

      {/* Detail: mobile phẳng (chỉ gạch ngăn); desktop chiếm hết phần ngang còn lại — tránh w-full trong flex-row làm co cụm */}
      <div
        className={cn(
          "box-border flex min-h-[min(240px,45dvh)] min-w-0 flex-1 flex-col overflow-hidden p-0 text-neutral-900 dark:text-neutral-100",
          "w-full max-lg:border-t max-lg:border-neutral-200/90 max-lg:pt-4 max-lg:dark:border-neutral-800",
          "lg:h-full lg:min-h-0 lg:w-auto lg:min-w-0 lg:flex-1 lg:rounded-2xl lg:border lg:border-(--detail-accent-border) lg:bg-neutral-50/95 lg:p-6 lg:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(226,32,40,0.08)] dark:lg:border-neutral-700/80 dark:lg:bg-neutral-900/90 dark:lg:shadow-none xl:p-7",
          detailClassName,
        )}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {selectedItem ? (
            renderDetail ? (
              renderDetail(selectedItem)
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <p
                  style={{
                    fontSize: 11,
                    color: "#888",
                    margin: "0 0 4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 500,
                  }}
                >
                  Selected
                </p>
                <h3 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 12px" }}>{selectedItem.label}</h3>
                <p style={{ fontSize: 13, color: "#666" }}>
                  Key:{" "}
                  <code style={{ background: "#e8e8e8", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>
                    {selectedItem.key}
                  </code>
                </p>
              </div>
            )
          ) : (
            <p className="text-[14px] text-neutral-500 dark:text-neutral-400">No item selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrollPickerPanel;
