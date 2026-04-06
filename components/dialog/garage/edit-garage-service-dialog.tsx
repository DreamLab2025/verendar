"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogSheetHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUrlDropzone } from "@/components/ui/image-url-dropzone";
import { Textarea } from "@/components/ui/textarea";
import { useGarageServiceByIdQuery, useUpdateGarageService } from "@/hooks/useGarage";
import type { GarageServiceDetailDto, ServiceCategoryDto } from "@/lib/api/services/fetchGarage";
import { requestCloseBottomSheet } from "@/lib/ui/bottom-sheet-motion";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  description: string;
  serviceCategoryId: string;
  laborAmount: string;
  estimatedDurationMinutes: string;
  imageUrl: string;
};

function detailToForm(d: GarageServiceDetailDto): FormState {
  return {
    name: d.name,
    description: d.description ?? "",
    serviceCategoryId: d.serviceCategoryId ?? "",
    laborAmount: String(d.laborPrice.amount),
    estimatedDurationMinutes: String(d.estimatedDurationMinutes ?? ""),
    imageUrl: d.imageUrl ?? "",
  };
}

export type EditGarageServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  serviceId: string | null;
  categories: ServiceCategoryDto[];
};

export function EditGarageServiceDialog({
  open,
  onOpenChange,
  branchId,
  serviceId,
  categories,
}: EditGarageServiceDialogProps) {
  const enabled = open && Boolean(serviceId);
  const detailQuery = useGarageServiceByIdQuery(serviceId ?? undefined, enabled, 0);
  const { refetch, isError: detailError } = detailQuery;
  const updateService = useUpdateGarageService();

  const [form, setForm] = useState<FormState>(() => ({
    name: "",
    description: "",
    serviceCategoryId: "",
    laborAmount: "",
    estimatedDurationMinutes: "",
    imageUrl: "",
  }));
  /** Form đã đồng bộ từ refetch GET detail (sau khi mở dialog — tránh cache cũ làm sai danh mục). */
  const [formHydrated, setFormHydrated] = useState(false);

  useEffect(() => {
    if (!open || !serviceId) return;
    let cancelled = false;
    void (async () => {
      const res = await refetch();
      if (cancelled) return;
      const d = res.data;
      if (res.isError || !d || d.id !== serviceId) return;
      setForm(detailToForm(d));
      setFormHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, serviceId, refetch]);

  const handleOpenChange = (next: boolean) => {
    if (!next) setFormHydrated(false);
    onOpenChange(next);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!branchId || !serviceId) return;

    const name = form.name.trim();
    const amount = Number(String(form.laborAmount).replace(/\s/g, "").replace(/,/g, ""));
    const duration = Number.parseInt(form.estimatedDurationMinutes, 10);
    if (!name || !form.serviceCategoryId || !Number.isFinite(amount) || amount < 0) return;
    if (!Number.isFinite(duration) || duration < 1) return;

    const description = form.description.trim();
    const imageUrl = form.imageUrl.trim();

    updateService.mutate(
      {
        id: serviceId,
        branchId,
        payload: {
          name,
          description: description.length > 0 ? description : null,
          laborPrice: { amount: Math.round(amount), currency: "VND" },
          serviceCategoryId: form.serviceCategoryId,
          estimatedDurationMinutes: duration,
          imageUrl: imageUrl.length > 0 ? imageUrl : null,
        },
      },
      {
        onSuccess: () => {
          requestCloseBottomSheet();
        },
      },
    );
  };

  const pending = updateService.isPending;
  const noCategories = categories.length === 0;
  const loadingDetail =
    enabled &&
    !detailError &&
    (detailQuery.isFetching || !formHydrated || (detailQuery.data != null && detailQuery.data.id !== serviceId));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        variant="bottomSheet"
        open={open}
        onOpenChange={handleOpenChange}
        className="flex max-h-[min(92dvh,900px)] flex-col gap-0 overflow-hidden p-0 md:max-w-lg"
        key={serviceId ?? undefined}
      >
        <DialogSheetHeader className="shrink-0">
          <DialogTitle>Sửa dịch vụ</DialogTitle>
          <DialogDescription>
            Cập nhật qua <span className="font-mono text-xs">PUT /api/v1/garage-services/{"{id}"}</span>
          </DialogDescription>
        </DialogSheetHeader>

        {detailQuery.isError ? (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {detailQuery.error?.message ?? "Không tải được dịch vụ."}
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
          </div>
        ) : loadingDetail ? (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
            <div className="space-y-2">
              <Label htmlFor="egms-category">Danh mục dịch vụ</Label>
              <Select
                key={`egms-cat-${serviceId}-${form.serviceCategoryId}-${categories.length}`}
                value={form.serviceCategoryId || undefined}
                onValueChange={(v) => setForm((f) => ({ ...f, serviceCategoryId: v }))}
                disabled={pending || noCategories}
                required
              >
                <SelectTrigger id="egms-category" className="w-full min-w-0">
                  <SelectValue placeholder={noCategories ? "Chưa có danh mục" : "Chọn danh mục"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="egms-name">Tên dịch vụ</Label>
              <Input
                id="egms-name"
                name="name"
                value={form.name}
                onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))}
                required
                disabled={pending}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="egms-desc">Mô tả</Label>
              <Textarea
                id="egms-desc"
                name="description"
                value={form.description}
                onChange={(ev) => setForm((f) => ({ ...f, description: ev.target.value }))}
                rows={3}
                disabled={pending}
                className="resize-y min-h-[80px]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="egms-labor">Giá nhân công (VND)</Label>
                <Input
                  id="egms-labor"
                  name="laborAmount"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  value={form.laborAmount}
                  onChange={(ev) => setForm((f) => ({ ...f, laborAmount: ev.target.value }))}
                  required
                  disabled={pending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="egms-duration">Thời lượng (phút)</Label>
                <Input
                  id="egms-duration"
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
              id="egms-image"
              label="Ảnh (tùy chọn)"
              value={form.imageUrl}
              onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))}
              disabled={pending}
            />
            </div>

            <DialogFooter className="shrink-0 gap-2 border-t border-border/60 bg-background px-4 py-3 sm:gap-0 sm:px-6 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <Button type="button" variant="outline" onClick={() => requestCloseBottomSheet()} disabled={pending}>
                Hủy
              </Button>
              <Button type="submit" disabled={pending || noCategories} className={cn(pending && "gap-2")}>
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
