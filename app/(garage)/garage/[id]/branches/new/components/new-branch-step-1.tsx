"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, type ReactNode } from "react";

import { SearchCombobox, type SearchComboboxItem } from "@/components/ui/search-combobox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { LocationProvince, LocationWard } from "@/lib/api/services/fetchLocation";
import { useProvinces, useWards } from "@/hooks/useLocation";

export type NewBranchAddressDraft = {
  provinceCode: string;
  wardCode: string;
  streetDetail: string;
};

const COMBO_TRIGGER =
  "h-11 rounded-lg border-border/70 bg-background text-base font-normal text-foreground hover:bg-muted/50! hover:text-foreground!";

function provinceValue(p: LocationProvince): string {
  const c = p.code?.trim();
  if (c) return c;
  return `__region_${p.administrativeRegionId}`;
}

function provinceLabel(p: LocationProvince): string {
  return (
    p.name?.trim() ||
    p.administrativeRegionName?.trim() ||
    p.code?.trim() ||
    `Khu vực ${p.administrativeRegionId}`
  );
}

function wardValue(w: LocationWard): string {
  const c = w.code?.trim();
  if (c) return c;
  return `__unit_${w.administrativeUnitId}`;
}

function wardLabel(w: LocationWard): string {
  return w.name?.trim() || w.code?.trim() || `Đơn vị ${w.administrativeUnitId}`;
}

function provinceApiCode(p: LocationProvince): string {
  return p.code?.trim() || String(p.administrativeRegionId);
}

function wardApiCode(w: LocationWard): string {
  return w.code?.trim() || String(w.administrativeUnitId);
}

export interface NewBranchStep1Props {
  address: NewBranchAddressDraft;
  onAddressChange: (next: Partial<NewBranchAddressDraft>) => void;
}

function FormRow({
  label,
  labelId,
  children,
  largeLabel,
}: {
  label: string;
  labelId?: string;
  children: ReactNode;
  /** Tỉnh/TP, Phường/Xã — chữ lớn hơn */
  largeLabel?: boolean;
}) {
  return (
    <div className="border-b border-border/50 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <span
          id={labelId}
          className={cn(
            "shrink-0 font-semibold text-foreground",
            largeLabel ? "text-base sm:text-lg" : "text-sm font-medium",
          )}
        >
          {label}
        </span>
        <div className="min-w-0 w-full sm:max-w-xs sm:flex-none md:max-w-sm">{children}</div>
      </div>
    </div>
  );
}

const motionFade = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const },
};

export function NewBranchStep1({ address, onAddressChange }: NewBranchStep1Props) {
  const { provinces, isLoading: provincesLoading } = useProvinces();
  const { wards, isLoading: wardsLoading } = useWards(
    address.provinceCode || undefined,
    Boolean(address.provinceCode),
  );

  const provinceItems: SearchComboboxItem[] = useMemo(() => {
    return provinces.map((p) => ({
      value: provinceValue(p),
      label: provinceLabel(p),
    }));
  }, [provinces]);

  const wardItems: SearchComboboxItem[] = useMemo(() => {
    return wards.map((w) => ({
      value: wardValue(w),
      label: wardLabel(w),
    }));
  }, [wards]);

  const selectedProvinceComboValue = useMemo(() => {
    const p = provinces.find((x) => provinceApiCode(x) === address.provinceCode);
    return p ? provinceValue(p) : "";
  }, [provinces, address.provinceCode]);

  const selectedWardComboValue = useMemo(() => {
    const w = wards.find((x) => wardApiCode(x) === address.wardCode);
    return w ? wardValue(w) : "";
  }, [wards, address.wardCode]);

  const showWard = Boolean(address.provinceCode);
  const showStreet = Boolean(address.provinceCode && address.wardCode);

  return (
    <section className="text-foreground" aria-labelledby="new-branch-step1-title">
      <header className="pb-6">
        <h2 id="new-branch-step1-title" className="mt-1 text-3xl font-semibold tracking-tight">
          Thông tin địa chỉ
        </h2>
        <span className="text-sm text-muted-foreground">Nhập địa chỉ chi nhánh của bạn để được hỗ trợ tốt nhất.</span>
      </header>

      <div className="border-t border-border/50">
        <FormRow label="Tỉnh/Thành phố" labelId="branch-province-label" largeLabel>
          <SearchCombobox
            id="branch-province"
            items={provinceItems}
            value={selectedProvinceComboValue}
            onValueChange={(v) => {
              const p = provinces.find((x) => provinceValue(x) === v);
              const api = p ? provinceApiCode(p) : v;
              onAddressChange({
                provinceCode: api,
                wardCode: "",
                streetDetail: "",
              });
            }}
            placeholder="Chọn tỉnh / thành phố"
            searchPlaceholder="Tìm tỉnh, thành phố…"
            emptyText="Không tìm thấy tỉnh thành"
            isLoading={provincesLoading}
            triggerClassName={COMBO_TRIGGER}
          />
        </FormRow>

        <AnimatePresence initial={false}>
          {showWard ? (
            <motion.div key="ward-block" {...motionFade}>
              <FormRow label="Phường/Xã" labelId="branch-ward-label" largeLabel>
                <SearchCombobox
                  id="branch-ward"
                  items={wardItems}
                  value={selectedWardComboValue}
                  onValueChange={(v) => {
                    const w = wards.find((x) => wardValue(x) === v);
                    const api = w ? wardApiCode(w) : v;
                    onAddressChange({
                      wardCode: api,
                      streetDetail: "",
                    });
                  }}
                  placeholder="Chọn phường / xã"
                  searchPlaceholder="Tìm phường, xã…"
                  emptyText="Không tìm thấy phường xã"
                  isLoading={wardsLoading}
                  disabled={!address.provinceCode}
                  triggerClassName={COMBO_TRIGGER}
                />
              </FormRow>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {showStreet ? (
            <motion.div
              key="street-block"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ ...motionFade.transition, delay: 0.02 }}
            >
              <FormRow label="Số nhà, tên đường" labelId="branch-street-label" largeLabel>
                <Textarea
                  id="branch-street"
                  value={address.streetDetail}
                  onChange={(e) => onAddressChange({ streetDetail: e.target.value })}
                  placeholder="Ví dụ: 36 Phố Hàng Bạc"
                  rows={3}
                  className="min-h-22 resize-y rounded-lg border-border/70 bg-background text-sm shadow-none"
                />
              </FormRow>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
