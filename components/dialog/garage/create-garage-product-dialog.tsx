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
import { ImageUrlDropzone } from "@/components/ui/image-url-dropzone";
import { Textarea } from "@/components/ui/textarea";
import { useCreateGarageProduct, useGarageServicesByBranchQuery } from "@/hooks/useGarage";
import { usePartCategories } from "@/hooks/usePartCategories";
import { cn } from "@/lib/utils";

/** Giá trị Select khi không gắn dịch vụ lắp — gửi `installationServiceId: null` lên BE. */
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
    compatibleVehicleTypes: "All",
    manufacturerKmInterval: "",
    manufacturerMonthInterval: "",
    partCategoryId: "",
    installationServiceId: INSTALL_NONE,
  };
}

export type CreateGarageProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
};

export function CreateGarageProductDialog({ open, onOpenChange, branchId }: CreateGarageProductDialogProps) {
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const createProduct = useCreateGarageProduct();

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
    if (open) {
      setForm(emptyForm());
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!branchId) return;

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

    createProduct.mutate(
      {
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

  const pending = createProduct.isPending;
  const categoriesLoading = partCategoriesQ.isLoading || partCategoriesQ.isFetching;
  const noCategories = !categoriesLoading && categories.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo phụ tùng</DialogTitle>
          <DialogDescription>Thêm sản phẩm / phụ tùng cho chi nhánh hiện tại</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gmp-part-category">Danh mục phụ tùng</Label>
            <Select
              value={form.partCategoryId || undefined}
              onValueChange={(partCategoryId) => setForm((f) => ({ ...f, partCategoryId }))}
              disabled={pending || categoriesLoading || noCategories}
              required
            >
              <SelectTrigger id="gmp-part-category" className="w-full">
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
            <Label htmlFor="gmp-name">Tên phụ tùng</Label>
            <Input
              id="gmp-name"
              name="name"
              value={form.name}
              onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))}
              placeholder="Ví dụ: Chip điện tử"
              required
              disabled={pending}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gmp-desc">Mô tả</Label>
            <Textarea
              id="gmp-desc"
              name="description"
              value={form.description}
              onChange={(ev) => setForm((f) => ({ ...f, description: ev.target.value }))}
              placeholder="Mô tả ngắn…"
              rows={3}
              disabled={pending}
              className="min-h-[80px] resize-y"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gmp-material">Giá vật tư (VND)</Label>
              <Input
                id="gmp-material"
                name="materialAmount"
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                value={form.materialAmount}
                onChange={(ev) => setForm((f) => ({ ...f, materialAmount: ev.target.value }))}
                placeholder="10000"
                required
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gmp-duration">Thời lượng ước tính (phút)</Label>
              <Input
                id="gmp-duration"
                name="estimatedDurationMinutes"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={form.estimatedDurationMinutes}
                onChange={(ev) => setForm((f) => ({ ...f, estimatedDurationMinutes: ev.target.value }))}
                placeholder="120"
                required
                disabled={pending}
              />
            </div>
          </div>

          <ImageUrlDropzone
            id="gmp-image"
            label="Ảnh (tùy chọn)"
            value={form.imageUrl}
            onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))}
            disabled={pending}
          />

          <div className="space-y-2">
            <Label htmlFor="gmp-compat">Loại xe tương thích</Label>
            <Input
              id="gmp-compat"
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
              <Label htmlFor="gmp-km">Khoảng cách khuyến nghị (km)</Label>
              <Input
                id="gmp-km"
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
              <Label htmlFor="gmp-month">Chu kỳ khuyến nghị (tháng)</Label>
              <Input
                id="gmp-month"
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
            <Label htmlFor="gmp-install-service">Dịch vụ lắp đặt (tùy chọn)</Label>
            <Select
              value={form.installationServiceId}
              onValueChange={(installationServiceId) => setForm((f) => ({ ...f, installationServiceId }))}
              disabled={pending || servicesQ.isLoading}
            >
              <SelectTrigger id="gmp-install-service" className="w-full">
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
                  "Không tải được danh sách dịch vụ — vẫn có thể tạo phụ tùng không gắn dịch vụ."}
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
              Tạo phụ tùng
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
