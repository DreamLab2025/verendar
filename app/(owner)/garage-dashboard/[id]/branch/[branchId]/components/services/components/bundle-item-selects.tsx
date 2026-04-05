"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GarageProductListItemDto, GarageServiceListItemDto } from "@/lib/api/services/fetchGarage";

export const BUNDLE_SELECT_NONE = "__none__";

export function BundleProductSelect({
  value,
  onPickProduct,
  products,
  disabled,
  triggerId,
}: {
  value: string;
  onPickProduct: (productId: string) => void;
  products: GarageProductListItemDto[];
  disabled?: boolean;
  triggerId?: string;
}) {
  const inList = Boolean(value && products.some((p) => p.id === value));
  const selectValue = value ? value : BUNDLE_SELECT_NONE;

  return (
    <Select
      value={selectValue}
      onValueChange={(v) => {
        if (v === BUNDLE_SELECT_NONE) onPickProduct("");
        else onPickProduct(v);
      }}
      disabled={disabled}
    >
      <SelectTrigger id={triggerId} className="w-full min-w-0">
        <SelectValue placeholder="Chọn phụ tùng" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={BUNDLE_SELECT_NONE}>— Không chọn phụ tùng —</SelectItem>
        {value && !inList ? (
          <SelectItem value={value} className="text-amber-800 dark:text-amber-200">
            (Không trong danh sách) {value.slice(0, 8)}…
          </SelectItem>
        ) : null}
        {products.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function BundleServiceSelect({
  value,
  onPickService,
  services,
  disabled,
  triggerId,
}: {
  value: string;
  onPickService: (serviceId: string) => void;
  services: GarageServiceListItemDto[];
  disabled?: boolean;
  triggerId?: string;
}) {
  const inList = Boolean(value && services.some((s) => s.id === value));
  const selectValue = value ? value : BUNDLE_SELECT_NONE;

  return (
    <Select
      value={selectValue}
      onValueChange={(v) => {
        if (v === BUNDLE_SELECT_NONE) onPickService("");
        else onPickService(v);
      }}
      disabled={disabled}
    >
      <SelectTrigger id={triggerId} className="w-full min-w-0">
        <SelectValue placeholder="Chọn dịch vụ" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={BUNDLE_SELECT_NONE}>— Không chọn dịch vụ —</SelectItem>
        {value && !inList ? (
          <SelectItem value={value} className="text-amber-800 dark:text-amber-200">
            (Không trong danh sách) {value.slice(0, 8)}…
          </SelectItem>
        ) : null}
        {services.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
