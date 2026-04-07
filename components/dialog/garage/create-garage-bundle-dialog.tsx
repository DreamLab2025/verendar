"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

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
import { ImageUrlDropzone } from "@/components/ui/image-url-dropzone";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateGarageBundle,
  useGarageProductsByBranchQuery,
  useGarageServicesByBranchQuery,
} from "@/hooks/useGarage";
import type { CreateGarageBundlePayload } from "@/lib/api/services/fetchGarage";
import { uploadMediaFile } from "@/lib/api/services/fetchMedia";
import { requestCloseBottomSheet } from "@/lib/ui/bottom-sheet-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { BundleProductSelect, BundleServiceSelect } from "./bundle-item-selects";

type ItemForm = {
  productId: string;
  serviceId: string;
  sortOrder: number;
};

type FormState = {
  name: string;
  description: string;
  imageUrl: string;
  discountAmount: string;
  discountPercent: string;
  items: ItemForm[];
};

function emptyItem(sortOrder: number): ItemForm {
  return { productId: "", serviceId: "", sortOrder };
}

function initialForm(): FormState {
  return {
    name: "",
    description: "",
    imageUrl: "",
    discountAmount: "",
    discountPercent: "",
    items: [emptyItem(1)],
  };
}

export type CreateGarageBundleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
};

export function CreateGarageBundleDialog({ open, onOpenChange, branchId }: CreateGarageBundleDialogProps) {
  const createBundle = useCreateGarageBundle();

  const catalogEnabled = open && Boolean(branchId);
  const catalogOpts = { enabled: catalogEnabled, serviceCategoryId: null as string | null };
  const productsQ = useGarageProductsByBranchQuery(branchId || undefined, catalogOpts);
  const servicesQ = useGarageServicesByBranchQuery(branchId || undefined, catalogOpts);

  const products = useMemo(() => {
    const raw = productsQ.data?.data ?? [];
    return [...raw].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [productsQ.data?.data]);

  const services = useMemo(() => {
    const raw = servicesQ.data?.data ?? [];
    return [...raw].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [servicesQ.data?.data]);

  const [form, setForm] = useState<FormState>(initialForm);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setForm(initialForm());
      }, 0);
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!branchId) return;

    const name = form.name.trim();
    if (!name) return;

    const discountAmountRaw = form.discountAmount.trim().replace(/\s/g, "").replace(/,/g, "");
    const discountPercentRaw = form.discountPercent.trim().replace(",", ".");

    const discountAmount =
      discountAmountRaw === "" ? null : Number(discountAmountRaw);
    const discountPercent =
      discountPercentRaw === "" ? null : Number(discountPercentRaw);

    if (discountAmount != null && (!Number.isFinite(discountAmount) || discountAmount < 0)) return;
    if (discountPercent != null && (!Number.isFinite(discountPercent) || discountPercent < 0)) return;

    const itemsPayload: CreateGarageBundlePayload["items"] = [];
    for (let i = 0; i < form.items.length; i++) {
      const it = form.items[i];
      const pid = it.productId.trim();
      const sid = it.serviceId.trim();
      if (!pid && !sid) continue;
      if (pid && sid) {
        toast.error("Mỗi mục chỉ được gán phụ tùng hoặc dịch vụ.");
        return;
      }
      itemsPayload.push({
        productId: pid || null,
        serviceId: sid || null,
        includeInstallation: Boolean(pid),
        sortOrder: it.sortOrder || i + 1,
      });
    }

    if (itemsPayload.length === 0) {
      toast.error("Cần ít nhất một mục có phụ tùng hoặc dịch vụ.");
      return;
    }

    const description = form.description.trim();
    const imageUrl = form.imageUrl.trim();

    const payload: CreateGarageBundlePayload = {
      name,
      description: description.length > 0 ? description : null,
      imageUrl: imageUrl.length > 0 ? imageUrl : null,
      discountAmount,
      discountPercent,
      items: itemsPayload,
    };

    createBundle.mutate(
      { branchId, payload },
      {
        onSuccess: () => {
          requestCloseBottomSheet();
        },
      },
    );
  };

  const pending = createBundle.isPending;

  const addItem = () => {
    setForm((f) => {
      const nextOrder =
        f.items.length === 0 ? 1 : Math.max(...f.items.map((x) => x.sortOrder), 0) + 1;
      return { ...f, items: [...f.items, emptyItem(nextOrder)] };
    });
  };

  const removeItem = (index: number) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  };

  const updateItem = (index: number, patch: Partial<ItemForm>) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        variant="bottomSheet"
        open={open}
        onOpenChange={handleOpenChange}
        className="flex max-h-[min(92vh,800px)] max-w-2xl flex-col gap-0 overflow-hidden p-0 md:max-w-2xl"
      >
        <DialogSheetHeader className="shrink-0">
          <DialogTitle>Tạo combo</DialogTitle>
          <DialogDescription>
            Tạo qua <span className="font-mono text-xs">POST /api/v1/garage-bundles?branchId=…</span> — phụ tùng → có lắp
            đặt; dịch vụ → không lắp đặt.
          </DialogDescription>
        </DialogSheetHeader>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
            <div className="space-y-2">
              <Label htmlFor="cgb-name">Tên combo</Label>
              <Input
                id="cgb-name"
                name="name"
                value={form.name}
                onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))}
                required
                disabled={pending}
                placeholder="Ví dụ: Combo bảo dưỡng nhanh"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cgb-desc">Mô tả</Label>
              <Textarea
                id="cgb-desc"
                name="description"
                value={form.description}
                onChange={(ev) => setForm((f) => ({ ...f, description: ev.target.value }))}
                rows={3}
                disabled={pending}
                className="resize-y min-h-[80px]"
              />
            </div>

            <ImageUrlDropzone
              id="cgb-image"
              label="Ảnh (tùy chọn)"
              value={form.imageUrl}
              onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))}
              disabled={pending}
              description="Ảnh được tải lên qua S3 (GarageBundleImage)."
              resolveFileUpload={async (file) => {
                const { imageUrl } = await uploadMediaFile(file, "GarageBundleImage");
                return imageUrl;
              }}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cgb-da">Giảm giá (VND)</Label>
                <Input
                  id="cgb-da"
                  name="discountAmount"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  value={form.discountAmount}
                  onChange={(ev) => setForm((f) => ({ ...f, discountAmount: ev.target.value }))}
                  disabled={pending}
                  placeholder="Để trống nếu không dùng"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cgb-dp">Giảm giá (%)</Label>
                <Input
                  id="cgb-dp"
                  name="discountPercent"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={100}
                  step={0.1}
                  value={form.discountPercent}
                  onChange={(ev) => setForm((f) => ({ ...f, discountPercent: ev.target.value }))}
                  disabled={pending}
                  placeholder="Để trống nếu không dùng"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-base">Mục trong combo</Label>
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addItem} disabled={pending}>
                  <Plus className="size-4" aria-hidden />
                  Thêm mục
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mỗi mục: một phụ tùng <span className="font-medium text-foreground">hoặc</span> một dịch vụ. Phụ tùng gửi{" "}
                <span className="font-mono text-[11px]">includeInstallation: true</span>, dịch vụ gửi{" "}
                <span className="font-mono text-[11px]">false</span>.
              </p>
              {productsQ.isError || servicesQ.isError ? (
                <p className="text-xs text-destructive">
                  Không tải được danh sách phụ tùng/dịch vụ — thử đóng và mở lại.
                </p>
              ) : null}

              {form.items.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Chưa có mục — bấm «Thêm mục».
                </p>
              ) : (
                <ul className="space-y-4">
                  {form.items.map((it, index) => (
                    <li
                      key={`${it.sortOrder}-${index}`}
                      className="rounded-lg border border-border/80 bg-muted/20 p-3 sm:p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">Mục {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 shrink-0 text-destructive hover:bg-destructive/10"
                          aria-label="Xóa mục"
                          onClick={() => removeItem(index)}
                          disabled={pending}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`cgb-pid-${index}`}>Phụ tùng</Label>
                          <BundleProductSelect
                            triggerId={`cgb-pid-${index}`}
                            value={it.productId}
                            onPickProduct={(productId) =>
                              updateItem(index, { productId, serviceId: productId ? "" : it.serviceId })
                            }
                            products={products}
                            disabled={pending || productsQ.isPending}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`cgb-sid-${index}`}>Dịch vụ</Label>
                          <BundleServiceSelect
                            triggerId={`cgb-sid-${index}`}
                            value={it.serviceId}
                            onPickService={(serviceId) =>
                              updateItem(index, { serviceId, productId: serviceId ? "" : it.productId })
                            }
                            services={services}
                            disabled={pending || servicesQ.isPending}
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor={`cgb-so-${index}`}>Thứ tự</Label>
                          <Input
                            id={`cgb-so-${index}`}
                            type="number"
                            min={1}
                            step={1}
                            value={it.sortOrder || ""}
                            onChange={(ev) =>
                              updateItem(index, { sortOrder: Number.parseInt(ev.target.value, 10) || 0 })
                            }
                            disabled={pending}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-border/60 bg-background px-4 py-3 sm:px-6 sm:gap-0 max-md:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button type="button" variant="outline" onClick={() => requestCloseBottomSheet()} disabled={pending}>
              Hủy
            </Button>
            <Button type="submit" disabled={pending || form.items.length === 0} className={cn(pending && "gap-2")}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Tạo combo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
