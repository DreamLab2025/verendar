"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarPlus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { bookingCartLineKey, useBookingCartStore } from "@/lib/stores/booking-cart-store";
import { cn } from "@/lib/utils";

function kindShortLabel(kind: string) {
  if (kind === "product") return "Phụ tùng";
  if (kind === "service") return "Dịch vụ";
  return "Combo";
}

export type BookingCartPanelProps = {
  variant?: "dropdown" | "page";
  /** Gọi sau khi bấm Tiếp tục đặt lịch (vd. đóng dropdown). */
  onAfterContinue?: () => void;
};

export function BookingCartPanel({ variant = "dropdown", onAfterContinue }: BookingCartPanelProps) {
  const router = useRouter();
  const lines = useBookingCartStore((s) => s.lines);
  const selectedLineKeys = useBookingCartStore((s) => s.selectedLineKeys);
  const toggleLineKey = useBookingCartStore((s) => s.toggleLineKey);
  const selectAllLineKeys = useBookingCartStore((s) => s.selectAllLineKeys);
  const deselectAllLineKeys = useBookingCartStore((s) => s.deselectAllLineKeys);
  const removeLine = useBookingCartStore((s) => s.removeLine);
  const clear = useBookingCartStore((s) => s.clear);
  const getSelectedLines = useBookingCartStore((s) => s.getSelectedLines);

  const selectedCount = selectedLineKeys.length;
  const allSelected = lines.length > 0 && selectedCount === lines.length;
  const someSelected = selectedCount > 0;

  const handleContinueCheckout = () => {
    const selected = getSelectedLines();
    if (!selected.length) {
      toast.error("Chọn ít nhất một mục để tiếp tục.");
      return;
    }
    const branches = new Set(selected.map((l) => l.branchId));
    if (branches.size > 1) {
      toast.error("Một lịch chỉ một chi nhánh.");
      return;
    }
    onAfterContinue?.();
    const bid = selected[0].branchId;
    router.push(`/user/garage/checkout?branchId=${encodeURIComponent(bid)}`);
  };

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-popover px-4 py-10 text-center">
        <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-muted/60 text-muted-foreground">
          <ShoppingBag className="size-6" aria-hidden />
        </div>
        <p className="text-sm font-medium text-foreground">Giỏ đặt lịch trống</p>
        <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
          Thêm dịch vụ hoặc phụ tùng từ trang chi nhánh garage.
        </p>
        <Button className="mt-4 rounded-xl" variant="secondary" size="sm" asChild>
          <Link href="/user/garage">Khám phá garage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl bg-popover",
        variant === "dropdown" && "max-h-[min(72vh,30rem)] w-[min(100vw-1.5rem,22rem)] sm:w-88",
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-2 bg-popover px-3 pb-2 pt-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-tight text-foreground">Giỏ đặt lịch</p>
          <p className="text-[11px] text-muted-foreground">
            {lines.length} mục
            {someSelected ? ` · ${selectedCount} chọn đặt` : " · chọn mục cần đặt"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px] font-medium"
            onClick={allSelected ? deselectAllLineKeys : selectAllLineKeys}
          >
            {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
          </Button>
        </div>
      </div>

      <Separator className="opacity-60" />

      <ul
        className={cn(
          "min-h-0 space-y-2 overflow-y-auto overscroll-contain p-2.5 [scrollbar-width:thin]",
          variant === "dropdown" && "flex-1",
          variant === "page" && "max-h-none",
        )}
      >
        {lines.map((line) => {
          const key = bookingCartLineKey(line);
          const checked = selectedLineKeys.includes(key);
          return (
            <li
              key={key}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border p-2.5 shadow-sm transition-colors",
                checked
                  ? "border-primary/40 bg-primary/10 dark:border-primary/50 dark:bg-primary/15"
                  : "border-border/60 bg-muted hover:border-border dark:bg-muted/80",
              )}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggleLineKey(key)}
                className="mt-0.5 border-primary/50"
                aria-label={`Chọn ${line.name}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-snug text-foreground">{line.name}</p>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {kindShortLabel(line.kind)}
                  </p>
                  {line.unitPriceVnd != null && !Number.isNaN(line.unitPriceVnd) ? (
                    <p className="text-[12px] font-semibold tabular-nums text-foreground">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      }).format(line.unitPriceVnd)}
                    </p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                aria-label={`Xóa ${line.name} khỏi giỏ`}
                onClick={() => removeLine(line.branchId, line.kind, line.catalogItemId)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          );
        })}
      </ul>

      <Separator className="opacity-60" />

      <div className="shrink-0 space-y-2 border-t border-border/60 bg-muted p-3 dark:bg-muted/50">
        <Button
          type="button"
          className="h-10 w-full rounded-xl text-sm font-semibold shadow-sm"
          disabled={!someSelected}
          onClick={handleContinueCheckout}
        >
          <CalendarPlus className="mr-2 size-4" aria-hidden />
          Tiếp tục đặt lịch
          {someSelected ? (
            <span className="ml-1.5 rounded-md bg-primary-foreground/20 px-1.5 py-0.5 text-xs tabular-nums">
              {selectedCount}
            </span>
          ) : null}
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {variant === "dropdown" ? (
            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-xs text-muted-foreground" asChild>
              <Link href="/user/garage/cart">Mở rộng giỏ</Link>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Chi nhánh: {lines[0]?.branchId.slice(0, 8)}…</span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => clear()}
          >
            Xóa toàn bộ giỏ
          </Button>
        </div>
      </div>
    </div>
  );
}
