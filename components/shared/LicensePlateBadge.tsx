"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type LicensePlateBadgeSize = "sm" | "md";

type LicensePlateBadgeProps = {
  licensePlate: string;
  size?: LicensePlateBadgeSize;
  className?: string;
};

/** Biển số kiểu mobile (VIE + nền trắng) — dùng lại ở desktop sidebar / carousel / maintenance. */
export function LicensePlateBadge({ licensePlate, size = "md", className }: LicensePlateBadgeProps) {
  const isSm = size === "sm";
  return (
    <div
      className={cn(
        "inline-flex max-w-full shrink-0 items-stretch overflow-hidden rounded-lg border-2 border-black bg-black shadow-sm",
        isSm ? "h-10" : "h-11",
        className,
      )}
    >
      <div className="flex h-full flex-shrink-0 items-center bg-black">
        <Image
          src="/images/VIE_rm_bg.png"
          alt=""
          width={isSm ? 46 : 52}
          height={isSm ? 40 : 48}
          className="h-full w-auto object-contain contrast-[1.05] saturate-[1.08]"
          unoptimized
        />
      </div>
      <div
        className={cn(
          "flex items-center rounded-l-md border-l-2 border-black bg-white",
          isSm ? "px-2.5" : "px-3 py-2",
        )}
      >
        <span
          className={cn(
            "truncate font-bold leading-none text-black",
            isSm ? "max-w-[11rem] text-[15px] tracking-tight" : "max-w-[18rem] text-[18px] tracking-tight md:text-[20px]",
          )}
        >
          {licensePlate}
        </span>
      </div>
    </div>
  );
}
