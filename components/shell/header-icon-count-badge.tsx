import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const badgeBase =
  "pointer-events-none absolute -right-0.5 -top-0.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full p-0 px-1 text-[10px] font-bold tabular-nums leading-none shadow-sm ring-2 ring-background";

type HeaderIconCountBadgeProps = {
  count: number;
  /** Giỏ: đỏ (destructive). Thông báo: nền tối / sáng (dark mode). */
  tone: "cart" | "notifications";
};

export function HeaderIconCountBadge({ count, tone }: HeaderIconCountBadgeProps) {
  if (count < 1) return null;
  const label = count > 99 ? "99+" : String(count);

  if (tone === "cart") {
    return (
      <Badge variant="destructive" className={cn(badgeBase, "border-0")} aria-hidden>
        {label}
      </Badge>
    );
  }

  return (
    <span
      className={cn(
        badgeBase,
        "border border-transparent bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
