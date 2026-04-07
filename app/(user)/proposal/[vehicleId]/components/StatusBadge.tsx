"use client";

import { cn } from "@/lib/utils";

export function proposalStatusLabel(status: string): string {
  const m: Record<string, string> = {
    Pending: "Chờ xác nhận",
    Accepted: "Đã chấp nhận",
    Rejected: "Đã từ chối",
    Applied: "Đã áp dụng",
    Expired: "Hết hạn",
  };
  return m[status] ?? status;
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<string, string> = {
    Pending:
      "border-amber-400/30 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
    Accepted:
      "border-emerald-400/30 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
    Rejected:
      "border-red-400/30 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400",
    Applied:
      "border-sky-400/30 bg-sky-50 text-sky-600 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400",
    Expired:
      "border-neutral-400/20 bg-neutral-50 text-neutral-400 dark:border-neutral-500/20 dark:bg-neutral-500/10 dark:text-neutral-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold tracking-tight shadow-xs",
        variants[status] ?? "border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      {proposalStatusLabel(status)}
    </span>
  );
}
