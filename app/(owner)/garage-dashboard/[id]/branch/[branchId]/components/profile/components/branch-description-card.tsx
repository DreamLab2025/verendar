"use client";

import { CheckCircle2, Home } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type BranchDescriptionCardProps = {
  description: string;
  isMobile: boolean;
};

export function BranchDescriptionCard({ description, isMobile }: BranchDescriptionCardProps) {
  const trimmed = description.trim();
  const lines = trimmed
    ? trimmed
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  const pad = isMobile ? "p-4" : "p-5 sm:p-7";
  const bodyPad = isMobile ? "px-4 pb-5 pt-4" : "px-5 pb-6 pt-5 sm:px-7 sm:pb-7";

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <div className={cn("border-b border-border/60", pad)}>
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <Home className="mt-0.5 size-5 shrink-0 text-muted-foreground sm:size-6" aria-hidden />
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">Mô tả</h3>
          </div>
        </div>
      </div>
      <div className={bodyPad}>
        {lines.length > 0 ? (
          <ul className="space-y-4 text-base leading-relaxed text-foreground">
            {lines.map((line, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-600 dark:text-emerald-500" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-muted-foreground">Chưa có mô tả.</p>
        )}
      </div>
    </Card>
  );
}
