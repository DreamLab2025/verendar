"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUrlDropzone } from "@/components/ui/image-url-dropzone";
import { Textarea } from "@/components/ui/textarea";
import { useGarageProductByIdQuery, useGarageServicesByBranchQuery, useUpdateGarageProduct } from "@/hooks/useGarage";
import { usePartCategories } from "@/hooks/usePartCategories";
import type { GarageProductDetailDto } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

const INSTALL_NONE = "__none__";

type FormState = {
  name: string;
  description: string;
  materialAmount: string;
  estimatedDurationMinutes: string;
  imageUrl: string;
  compatibleVehicleTypes: string;
  manufacturerKmInterval: string;
  manufacturerMonthInterval: string;
  partCategoryId: string;
  installationServiceId: string;
};

function emptyForm(): FormState {
  return {
    name: "",
    description: "",
    materialAmount: "",
    estimatedDurationMinutes: "",
    imageUrl: "",
    compatibleVehicleTypes: "",
    manufacturerKmInterval: "",
    manufacturerMonthInterval: "",
    partCategoryId: "",
    installationServiceId: INSTALL_NONE,
  };
}

function detailToForm(d: GarageProductDetailDto): FormState {
  return {
    name: d.name,
    description: d.description ?? "",
    materialAmount: String(d.materialPrice.amount),
    estimatedDurationMinutes: String(d.estimatedDurationMinutes ?? ""),
    imageUrl: d.imageUrl ?? "",
    compatibleVehicleTypes: d.compatibleVehicleTypes ?? "",
    manufacturerKmInterval: d.manufacturerKmInterval != null ? String(d.manufacturerKmInterval) : "",
    manufacturerMonthInterval: d.manufacturerMonthInterval != null ? String(d.manufacturerMonthInterval) : "",
    partCategoryId: d.partCategoryId ?? "",
    installationServiceId: d.installationService?.id ?? INSTALL_NONE,
  };
}

export type EditGarageProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  productId: string | null;
};

export function EditGarageProductDialog({
  open,
  onOpenChange,
  branchId,
  productId,
}: EditGarageProductDialogProps) {
  const enabled = open && Boolean(productId);
  const detailQuery = useGarageProductByIdQuery(productId ?? undefined, enabled, 0);
  const { refetch, isError: detailError } = detailQuery;
  const updateProduct = useUpdateGarageProduct();

  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [formHydrated, setFormHydrated] = useState(false);

  const partCategoriesQ = usePartCategories({ PageNumber: 1, PageSize: 500 }, open && Boolean(branchId));
  const categories = useMemo(
    () => [...(partCategoriesQ.categories ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
    [partCategoriesQ.categories],
  );

  const servicesQ = useGarageServicesByBranchQuery(branchId || undefined, {
    enabled: open && Boolean(branchId),
    serviceCategoryId: null,
  });
  const services = servicesQ.data?.data ?? [];

  useEffect(() => {
    if (!open || !productId) return;
    let cancelled = false;
    void (async () => {
      const res = await refetch();
      if (cancelled) return;
      const d = res.data;
      if (res.isError || !d || d.id !== productId) return;
      setForm(detailToForm(d));
      setFormHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, productId, refetch]);

  const handleOpenChange = (next: boolean) => {
    if (!next) setFormHydrated(false);
    onOpenChange(next);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!branchId || !productId) return;

    const name = form.name.trim();
    const amount = Number(String(form.materialAmount).replace(/\s/g, "").replace(/,/g, ""));
    const duration = Number.parseInt(form.estimatedDurationMinutes, 10);
    if (!name || !form.partCategoryId || !Number.isFinite(amount) || amount < 0) return;
    if (!Number.isFinite(duration) || duration < 1) return;

    const description = form.description.trim();
    const imageUrl = form.imageUrl.trim();
    const compat = form.compatibleVehicleTypes.trim();

    const kmRaw = form.manufacturerKmInterval.trim();
    const monthRaw = form.manufacturerMonthInterval.trim();
    let manufacturerKmInterval: number | null = null;
    let manufacturerMonthInterval: number | null = null;
    if (kmRaw !== "") {
      const km = Number(kmRaw);
      if (!Number.isFinite(km) || km < 0) return;
      manufacturerKmInterval = km;
    }
    if (monthRaw !== "") {
      const mo = Number(monthRaw);
      if (!Number.isFinite(mo) || mo < 0) return;
      manufacturerMonthInterval = mo;
    }

    const installationServiceId =
      form.installationServiceId && form.installationServiceId !== INSTALL_NONE
        ? form.installationServiceId
        : null;

    updateProduct.mutate(
      {
        id: productId,
        branchId,
        payload: {
          name,
          description: description.length > 0 ? description : null,
          materialPrice: { amount: Math.round(amount), currency: "VND" },
          estimatedDurationMinutes: duration,
          imageUrl: imageUrl.length > 0 ? imageUrl : null,
          compatibleVehicleTypes: compat.length > 0 ? compat : null,
          manufacturerKmInterval,
          manufacturerMonthInterval,
          partCategoryId: form.partCategoryId,
          installationServiceId,
        },
      },
      {
        onSuccess: () => {
          handleOpenChange(false);
        },
      },
    );
  };

  const pending = updateProduct.isPending;
  const categoriesLoading = partCategoriesQ.isLoading || partCategoriesQ.isFetching;
  const noCategories = !categoriesLoading && categories.length === 0;

  const loadingDetail =
    enabled &&
    !detailError &&
    (detailQuery.isFetching || !formHydrated || (detailQuery.data != null && detailQuery.data.id !== productId));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" key={productId ?? undefined}>
        <DialogHeader>
          <DialogTitle>Sửa phụ tùng</DialogTitle>
          <DialogDescription>
            Cập nhật qua <span className="font-mono text-xs">PUT /api/v1/garage-products/{"{id}"}</span>
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {detailQuery.error?.message ?? "Không tải được phụ tùng."}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void detailQuery.refetch()}
            >
              Thử lại
            </Button>
          </div>
        ) : loadingDetail ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="egmp-part-category">Danh mục phụ tùng</Label>
              <Select
                key={`egmp-cat-${productId}-${form.partCategoryId}-${categories.length}`}
                value={form.partCategoryId || undefined}
                onValueChange={(partCategoryId) => setForm((f) => ({ ...f, partCategoryId }))}
                disabled={pending || categoriesLoading || noCategories}
                required
              >
                <SelectTrigger id="egmp-part-category" className="w-full min-w-0">
                  <SelectValue
                    placeholder={
                      categoriesLoading ? "Đang tải…" : noCategories ? "Chưa có danh mục" : "Chọn danh mục"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {partCategoriesQ.isError ? (
                <p className="text-xs text-destructive">
                  {partCategoriesQ.error?.message ?? "Không tải được danh mục phụ tùng."}
                </p>
              ) : null}
              {noCategories ? (
                <p className="text-xs text-destructive">Cần có ít nhất một danh mục từ API part-categories.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="egmp-name">Tên phụ tùng</Label>
              <Input
                id="egmp-name"
                name="name"
                value={form.name}
                onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))}
                required
                disabled={pending}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="egmp-desc">Mô tả</Label>
              <Textarea
                id="egmp-desc"
                name="description"
                value={form.description}
                onChange={(ev) => setForm((f) => ({ ...f, description: ev.target.value }))}
                rows={3}
                disabled={pending}
                className="min-h-[80px] resize-y"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="egmp-material">Giá vật tư (VND)</Label>
                <Input
                  id="egmp-material"
                  name="materialAmount"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  value={form.materialAmount}
                  onChange={(ev) => setForm((f) => ({ ...f, materialAmount: ev.target.value }))}
                  required
                  disabled={pending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="egmp-duration">Thời lượng ước tính (phút)</Label>
                <Input
                  id="egmp-duration"
                  name="estimatedDurationMinutes"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={form.estimatedDurationMinutes}
                  onChange={(ev) => setForm((f) => ({ ...f, estimatedDurationMinutes: ev.target.value }))}
                  required
                  disabled={pending}
                />
              </div>
            </div>

            <ImageUrlDropzone
              id="egmp-image"
              label="Ảnh (tùy chọn)"
              value={form.imageUrl}
              onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))}
              disabled={pending}
            />

            <div className="space-y-2">
              <Label htmlFor="egmp-compat">Loại xe tương thích</Label>
              <Input
                id="egmp-compat"
                name="compatibleVehicleTypes"
                value={form.compatibleVehicleTypes}
                onChange={(ev) => setForm((f) => ({ ...f, compatibleVehicleTypes: ev.target.value }))}
                placeholder="All hoặc Sedan, SUV…"
                disabled={pending}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="egmp-km">Khoảng cách khuyến nghị (km)</Label>
                <Input
                  id="egmp-km"
                  name="manufacturerKmInterval"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  value={form.manufacturerKmInterval}
                  onChange={(ev) => setForm((f) => ({ ...f, manufacturerKmInterval: ev.target.value }))}
                  placeholder="Để trống nếu không áp dụng"
                  disabled={pending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="egmp-month">Chu kỳ khuyến nghị (tháng)</Label>
                <Input
                  id="egmp-month"
                  name="manufacturerMonthInterval"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={form.manufacturerMonthInterval}
                  onChange={(ev) => setForm((f) => ({ ...f, manufacturerMonthInterval: ev.target.value }))}
                  placeholder="Để trống nếu không áp dụng"
                  disabled={pending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="egmp-install-service">Dịch vụ lắp đặt (tùy chọn)</Label>
              <Select
                value={form.installationServiceId}
                onValueChange={(installationServiceId) => setForm((f) => ({ ...f, installationServiceId }))}
                disabled={pending || servicesQ.isLoading}
              >
                <SelectTrigger id="egmp-install-service" className="w-full min-w-0">
                  <SelectValue placeholder={servicesQ.isLoading ? "Đang tải dịch vụ…" : "Không chọn"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={INSTALL_NONE}>Không chọn</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {servicesQ.isError ? (
                <p className="text-xs text-muted-foreground">
                  {servicesQ.error?.message ??
                    "Không tải được danh sách dịch vụ — vẫn có thể bỏ gắn dịch vụ lắp."}
                </p>
              ) : null}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={pending || noCategories || categoriesLoading || partCategoriesQ.isError}
                className={cn(pending && "gap-2")}
              >
                {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
