"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";

import { BookingCartPanel } from "@/components/shell/booking-cart-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBookingCartStore } from "@/lib/stores/booking-cart-store";
import { cn } from "@/lib/utils";

export function BookingCartHeaderButton() {
  const [open, setOpen] = useState(false);
  const count = useBookingCartStore((s) => s.lines.length);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("relative size-10 rounded-full md:size-9")}
          aria-label={count ? `Giỏ đặt lịch, ${count} mục` : "Giỏ đặt lịch"}
        >
          <ShoppingCart className="size-[1.35rem] md:size-5" aria-hidden />
          {count > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums shadow-sm"
            >
              {count > 99 ? "99+" : count}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="border-border bg-popover p-0 text-popover-foreground shadow-xl dark:border-border"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <BookingCartPanel variant="dropdown" onAfterContinue={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
