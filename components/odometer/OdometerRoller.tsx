"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DigitWheel } from "./DigitWheelConfig";

export function OdometerRoller({
  digits = 6,
  value,
  onChange,
  minValue = 0,
  mode = "create",
}: {
  digits?: number;
  value: number;
  onChange: (next: number) => void;
  minValue?: number;
  mode?: "create" | "update";
}) {
  const max = Number("9".repeat(digits));
  const clamp = (n: number) => Math.max(0, Math.min(n, max));
  const normalized = clamp(Number.isFinite(value) ? value : 0);

  const valueStr = String(normalized).padStart(digits, "0");
  const [digitsArr, setDigitsArr] = useState<number[]>(() => valueStr.split("").map((c) => Number(c)));

  useEffect(() => {
    const clampedValue = clamp(value);
    const s = String(clampedValue).padStart(digits, "0");
    const newDigits = s.split("").map((c) => Number(c));
    setDigitsArr(newDigits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, digits, minValue, mode]);

  const commit = (nextDigits: number[]) => {
    setDigitsArr(nextDigits);
    const num = Number(nextDigits.join(""));
    const clamped = clamp(num);
    onChange(clamped);
  };

  return (
    <div
      className={cn(
        "w-full select-none rounded-xl border-2 border-neutral-400 bg-linear-to-b from-neutral-200/90 to-neutral-300/80 px-2 py-3",
        "shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]",
        "dark:border-neutral-600 dark:from-neutral-800 dark:to-neutral-900 dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]",
        "max-lg:py-4",
        "sm:px-4 sm:py-4",
      )}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="flex select-none items-center justify-center gap-1 max-lg:gap-2 sm:gap-1.5">
        {Array.from({ length: digits }).map((_, idx) => (
          <DigitWheel
            key={idx}
            value={digitsArr[idx] ?? 0}
            onValue={(d) => {
              const next = [...digitsArr];
              next[idx] = d;
              commit(next);
            }}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-sm leading-snug text-neutral-700 max-lg:mt-4 lg:text-xs dark:text-neutral-300">
        <span className="max-lg:hidden">Lăn chuột hoặc kéo từng ô số.</span>
        <span className="hidden max-lg:inline">Chạm và vuốt lên hoặc xuống từng cột để đổi số.</span>
      </p>
    </div>
  );
}
