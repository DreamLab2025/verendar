"use client";

import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const TOTAL_SEGMENTS = 3;

export interface NewBranchWizardFooterProps {
  /** Bước hiện tại, bắt đầu từ 1 */
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isNextLoading?: boolean;
  className?: string;
}

export function NewBranchWizardFooter({
  currentStep,
  onBack,
  onNext,
  nextLabel = "Tiếp theo",
  nextDisabled = false,
  isNextLoading = false,
  className,
}: NewBranchWizardFooterProps) {
  const safeStep = Math.min(Math.max(currentStep, 1), TOTAL_SEGMENTS);
  const progressValue = (safeStep / TOTAL_SEGMENTS) * 100;

  return (
    <footer
      className={cn(
        "sticky bottom-0 z-10 shrink-0 border-t border-border/60 bg-background",
        className,
      )}
    >
      <Progress
        value={progressValue}
        max={100}
        className="h-1.5 rounded-none"
        aria-label={`Bước ${safeStep} trên ${TOTAL_SEGMENTS}`}
      />

      <div className="flex w-full items-center justify-between gap-4 px-4 py-3.5 md:px-6">
        <Button
          type="button"
          variant="link"
          className="gap-2 px-2 text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Quay lại
        </Button>

        <Button
          type="button"
          variant="default"
          className="min-w-[7.5rem] px-6 shadow-sm"
          disabled={nextDisabled || isNextLoading}
          onClick={onNext}
        >
          {isNextLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Đang xử lý…
            </span>
          ) : (
            nextLabel
          )}
        </Button>
      </div>
    </footer>
  );
}
