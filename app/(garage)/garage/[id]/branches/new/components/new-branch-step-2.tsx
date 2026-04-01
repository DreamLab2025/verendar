"use client";

import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type NewBranchInfoDraft = {
  name: string;
  phoneNumber: string;
  taxCode: string;
  description: string;
};

export function createEmptyBranchInfoDraft(): NewBranchInfoDraft {
  return {
    name: "",
    phoneNumber: "",
    taxCode: "",
    description: "",
  };
}

/** Cho phép sang bước tiếp: tên + SĐT bắt buộc; MST và mô tả có thể để trống. */
export function isStep2InfoComplete(info: NewBranchInfoDraft): boolean {
  return Boolean(info.name.trim() && info.phoneNumber.trim());
}

function FormRow({
  label,
  labelId,
  htmlFor,
  children,
  largeLabel,
}: {
  label: string;
  labelId?: string;
  htmlFor?: string;
  children: ReactNode;
  largeLabel?: boolean;
}) {
  return (
    <div className="border-b border-border/50 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
        <label
          id={labelId}
          htmlFor={htmlFor}
          className={cn(
            "shrink-0 font-semibold text-foreground",
            largeLabel ? "text-base sm:text-lg" : "text-sm font-medium",
          )}
        >
          {label}
        </label>
        <div className="min-w-0 w-full sm:max-w-xs sm:flex-none md:max-w-sm">{children}</div>
      </div>
    </div>
  );
}

export interface NewBranchStep2Props {
  info: NewBranchInfoDraft;
  onInfoChange: (next: Partial<NewBranchInfoDraft>) => void;
}

export function NewBranchStep2({ info, onInfoChange }: NewBranchStep2Props) {
  return (
    <section className="text-foreground" aria-labelledby="new-branch-step2-title">
      <header className="pb-6">
        <h2 id="new-branch-step2-title" className="mt-1 text-3xl font-semibold tracking-tight">
          Thông tin chi nhánh
        </h2>
        <span className="text-sm text-muted-foreground">
          Tên hiển thị, liên hệ và mã số thuế (nếu có) cho chi nhánh này.
        </span>
      </header>

      <div className="border-t border-border/50">
        <FormRow label="Mã số thuế" labelId="branch-tax-label" htmlFor="branch-tax" largeLabel>
          <Input
            id="branch-tax"
            value={info.taxCode}
            onChange={(e) => onInfoChange({ taxCode: e.target.value })}
            placeholder="Nhập MST (nếu có)"
            autoComplete="off"
            className="h-11 rounded-lg border-border/70 bg-background"
          />
        </FormRow>

        <FormRow label="Tên chi nhánh" labelId="branch-name-label" htmlFor="branch-name" largeLabel>
          <Input
            id="branch-name"
            value={info.name}
            onChange={(e) => onInfoChange({ name: e.target.value })}
            placeholder="Ví dụ: Chi nhánh Quận 1"
            autoComplete="organization"
            className="h-11 rounded-lg border-border/70 bg-background"
          />
        </FormRow>

        <FormRow label="Số điện thoại" labelId="branch-phone-label" htmlFor="branch-phone" largeLabel>
          <Input
            id="branch-phone"
            type="tel"
            inputMode="tel"
            value={info.phoneNumber}
            onChange={(e) => onInfoChange({ phoneNumber: e.target.value })}
            placeholder="Ví dụ: 0901234567"
            autoComplete="tel"
            className="h-11 rounded-lg border-border/70 bg-background"
          />
        </FormRow>

        <div className="border-b border-border/50 py-5 last:border-b-0">
          <div className="flex flex-col gap-3">
            <label htmlFor="branch-description" className="text-base font-semibold text-foreground sm:text-lg">
              Mô tả
            </label>
            <Textarea
              id="branch-description"
              value={info.description}
              onChange={(e) => onInfoChange({ description: e.target.value })}
              placeholder="Giới thiệu ngắn về chi nhánh, dịch vụ nổi bật…"
              rows={4}
              className="min-h-30 rounded-lg border-border/70 bg-background text-base md:text-sm"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
