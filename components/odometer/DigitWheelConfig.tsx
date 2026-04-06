"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

export function DigitWheel({ value, onValue }: { value: number; onValue: (d: number) => void }) {
  /** Cao hơn mặc định để vuốt/drag dễ trên mobile (touch target ~44px+) */
  const digitH = 62;
  const itemH = 43;

  const items = useMemo(() => {
    const base = Array.from({ length: 10 }, (_, i) => i);
    return [...base, ...base, ...base];
  }, []);

  const midStart = 10;
  const maxIndex = items.length - 1;

  const y = useMotionValue(-(midStart + value) * itemH);
  const [localDigit, setLocalDigit] = useState<number>(value);
  /** Tắt transition khi kéo — tránh “đè số” do animate font-size/opacity lệch với transform */
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const draggingRef = useRef(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const pointerDragging = useRef(false);
  const dragStartClientY = useRef(0);
  const dragStartTranslateY = useRef(0);

  function digitFromY(curY: number) {
    const idx = Math.round(Math.abs(curY) / itemH);
    const safe = Math.max(0, Math.min(maxIndex, idx));
    return items[safe] ?? 0;
  }

  useMotionValueEvent(y, "change", (latest) => {
    if (!pointerDragging.current) return;
    setLocalDigit(digitFromY(latest));
  });

  const recenterIfNeeded = (curY: number) => {
    const idx = Math.round(Math.abs(curY) / itemH);
    if (idx < 6 || idx > 23) {
      const digit = items[Math.max(0, Math.min(maxIndex, idx))] ?? 0;
      const midIdx = midStart + digit;
      const nextY = -midIdx * itemH;
      y.set(nextY);
      return nextY;
    }
    return curY;
  };

  const snapToDigit = (digit: number) => {
    const midIdx = midStart + digit;
    const targetY = -midIdx * itemH;
    animate(y, targetY, { type: "spring", stiffness: 460, damping: 40 });
  };

  useEffect(() => {
    if (draggingRef.current) return;
    setLocalDigit(value);
    y.stop();
    y.set(-(midStart + value) * itemH);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync wheel to external value
  }, [value]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    y.stop();
    const dir = e.deltaY > 0 ? 1 : -1;
    const cur = digitFromY(y.get());
    const next = (cur + dir + 10) % 10;
    setLocalDigit(next);
    onValue(next);
    snapToDigit(next);
  };

  const endPointerDrag = (e: React.PointerEvent) => {
    if (!pointerDragging.current) return;
    pointerDragging.current = false;
    draggingRef.current = false;
    const el = shellRef.current;
    if (el?.hasPointerCapture(e.pointerId)) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    const cur = recenterIfNeeded(y.get());
    const d = digitFromY(cur);
    setLocalDigit(d);
    onValue(d);
    snapToDigit(d);
    setIsPointerDragging(false);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    y.stop();
    pointerDragging.current = true;
    draggingRef.current = true;
    setIsPointerDragging(true);
    setLocalDigit(digitFromY(y.get()));
    dragStartClientY.current = e.clientY;
    dragStartTranslateY.current = y.get();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointerDragging.current) return;
    e.preventDefault();
    const dy = e.clientY - dragStartClientY.current;
    const raw = dragStartTranslateY.current + dy;
    const adjusted = recenterIfNeeded(raw);
    y.set(adjusted);
    if (Math.abs(adjusted - raw) > 0.5) {
      dragStartTranslateY.current = adjusted;
      dragStartClientY.current = e.clientY;
    }
  };

  return (
    <div className="w-[46px] shrink-0 select-none min-[480px]:w-[50px] sm:w-[54px]">
      <div
        ref={shellRef}
        draggable={false}
        className={cn(
          "relative mx-auto cursor-grab select-none overflow-hidden rounded-lg border-2 border-neutral-400 touch-none active:cursor-grabbing",
          "bg-linear-to-b from-neutral-100 via-neutral-50 to-neutral-200",
          "shadow-[inset_0_3px_6px_rgba(0,0,0,0.12),inset_0_-2px_4px_rgba(255,255,255,0.65)]",
          "dark:border-neutral-500 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-950 dark:shadow-[inset_0_4px_8px_rgba(0,0,0,0.45)]",
        )}
        style={{
          height: digitH,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onDragStart={onDragStart}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
        onLostPointerCapture={() => {
          if (!pointerDragging.current) return;
          pointerDragging.current = false;
          draggingRef.current = false;
          setIsPointerDragging(false);
          const cur = recenterIfNeeded(y.get());
          const d = digitFromY(cur);
          setLocalDigit(d);
          onValue(d);
          snapToDigit(d);
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-2.5 bg-linear-to-b from-neutral-200/95 to-transparent dark:from-neutral-950"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-2.5 bg-linear-to-t from-neutral-200/95 to-transparent dark:from-neutral-950"
          aria-hidden
        />

        <motion.div
          draggable={false}
          style={{
            y,
            paddingTop: (digitH - itemH) / 2,
            paddingBottom: (digitH - itemH) / 2,
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          className="pointer-events-none relative z-20 w-full select-none"
        >
          {items.map((n, i) => (
            <div
              key={`${n}-${i}`}
              className="flex select-none items-center justify-center"
              style={{ height: itemH, userSelect: "none", WebkitUserSelect: "none" }}
            >
              <span
                draggable={false}
                className={cn(
                  "pointer-events-none select-none tabular-nums tracking-tight",
                  !isPointerDragging && "transition-[color,font-size,opacity] duration-150",
                  isPointerDragging && "transition-none",
                  n === localDigit
                    ? "font-bold text-neutral-950 dark:text-white"
                    : "font-semibold text-neutral-600 dark:text-neutral-400",
                )}
                style={{
                  fontSize: n === localDigit ? 26 : 20,
                  lineHeight: 1,
                }}
              >
                {n}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
