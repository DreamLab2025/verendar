"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BookingCartPanel } from "@/components/shell/booking-cart-panel";
import { Button } from "@/components/ui/button";

export default function UserBookingCartPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Button variant="ghost" size="sm" className="w-fit shrink-0 gap-1 px-2" asChild>
        <Link href="/user/garage">
          <ArrowLeft className="size-4" aria-hidden />
          Garage
        </Link>
      </Button>

      <div className="overflow-hidden rounded-2xl border z-50 border-border/70 bg-white shadow-sm">
        <BookingCartPanel variant="page" />
      </div>
    </div>
  );
}
