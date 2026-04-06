"use client";

import { CarFront, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NewBranchHeaderProps {
  garageId: string;
  exitHref: string;
  className?: string;
}

export function NewBranchHeader({ garageId, exitHref, className }: NewBranchHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 shrink-0 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md md:px-6",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <Link
          href={`/garage/${garageId}`}
          className="flex min-w-0 items-center gap-3 rounded-xl outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary shadow-sm">
            <CarFront className="size-5" aria-hidden />
          </div>
          <span className="truncate text-base font-semibold tracking-tight text-foreground">Verendar</span>
        </Link>

        <Button variant="outline" className="shrink-0 gap-2 rounded-xl px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50" asChild>
          <Link href={exitHref}>
            <X className="size-5 shrink-0" aria-hidden />
            <span>Thoát</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
