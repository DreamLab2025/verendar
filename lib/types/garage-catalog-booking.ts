/** Loại mục trong garage catalog / payload booking. */
export type CatalogDetailKind = "product" | "service" | "bundle";

/** Một dòng trong đơn đặt lịch (API: Items[]). */
export type CatalogBookingLine = {
  kind: CatalogDetailKind;
  /** Id mục trong garage catalog. */
  catalogItemId: string;
  name: string;
  /** Chỉ product: có lắp đặt. */
  includeInstallation?: boolean;
  /** Giá ước tính một dòng (VND) — hiển thị checkout khi có. */
  unitPriceVnd?: number | null;
  imageUrl?: string | null;
};
