"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { useCreateGarageService } from "@/hooks/useGarage";
import type { ServiceCategoryDto } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  description: string;
  serviceCategoryId: string;
  laborAmount: string;
  estimatedDurationMinutes: string;
  imageUrl: string;
};

function emptyForm(defaultCategoryId: string | null): FormState {
  return {
    name: "",
    description: "",
    serviceCategoryId: defaultCategoryId ?? "",
    laborAmount: "",
    estimatedDurationMinutes: "",
    imageUrl: "",
  };
}

export type CreateGarageServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  categories: ServiceCategoryDto[];
  /** Danh mục đang chọn trên rail — gán sẵn vào select khi mở dialog. */
  defaultCategoryId: string | null;
};

export function CreateGarageServiceDialog({
  open,
  onOpenChange,
  branchId,
  categories,
  defaultCategoryId,
}: CreateGarageServiceDialogProps) {
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultCategoryId));
  const createService = useCreateGarageService();
  /** Tránh reset form khi `defaultCategoryId` đổi trong lúc dialog đang mở (rail). Chỉ sync khi vừa mở dialog. */
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setTimeout(() => {
        setForm(emptyForm(defaultCategoryId));
      }, 0);
      wasOpenRef.current = true;
    }
  }, [open, defaultCategoryId]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!branchId) return;

    const name = form.name.trim();
    const amount = Number(String(form.laborAmount).replace(/\s/g, "").replace(/,/g, ""));
    const duration = Number.parseInt(form.estimatedDurationMinutes, 10);
    if (!name || !form.serviceCategoryId || !Number.isFinite(amount) || amount < 0) return;
    if (!Number.isFinite(duration) || duration < 1) return;

    const description = form.description.trim();
    const imageUrl = form.imageUrl.trim();

    createService.mutate(
      {
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
          handleOpenChange(false);
        },
      },
    );
  };

  const pending = createService.isPending;
  const noCategories = categories.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo dịch vụ</DialogTitle>
          <DialogDescription>Thêm dịch vụ nhân công cho chi nhánh hiện tại</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gms-category">Danh mục dịch vụ</Label>
            <Select
              value={form.serviceCategoryId || undefined}
              onValueChange={(serviceCategoryId) => setForm((f) => ({ ...f, serviceCategoryId }))}
              disabled={pending || noCategories}
              required
            >
              <SelectTrigger id="gms-category" className="w-full">
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
            {noCategories ? (
              <p className="text-xs text-destructive">Cần có ít nhất một danh mục từ API service-categories.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gms-name">Tên dịch vụ</Label>
            <Input
              id="gms-name"
              name="name"
              value={form.name}
              onChange={(ev) => setForm((f) => ({ ...f, name: ev.target.value }))}
              placeholder="Ví dụ: Thay dầu động cơ"
              required
              disabled={pending}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gms-desc">Mô tả</Label>
            <Textarea
              id="gms-desc"
              name="description"
              value={form.description}
              onChange={(ev) => setForm((f) => ({ ...f, description: ev.target.value }))}
              placeholder="Mô tả ngắn công việc…"
              rows={3}
              disabled={pending}
              className="resize-y min-h-[80px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gms-labor">Giá nhân công (VND)</Label>
              <Input
                id="gms-labor"
                name="laborAmount"
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                value={form.laborAmount}
                onChange={(ev) => setForm((f) => ({ ...f, laborAmount: ev.target.value }))}
                placeholder="150000"
                required
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gms-duration">Thời lượng (phút)</Label>
              <Input
                id="gms-duration"
                name="estimatedDurationMinutes"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={form.estimatedDurationMinutes}
                onChange={(ev) => setForm((f) => ({ ...f, estimatedDurationMinutes: ev.target.value }))}
                placeholder="30"
                required
                disabled={pending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gms-image">URL ảnh (tùy chọn)</Label>
            <Input
              id="gms-image"
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={(ev) => setForm((f) => ({ ...f, imageUrl: ev.target.value }))}
              placeholder="https://…"
              disabled={pending}
              autoComplete="off"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
              Hủy
            </Button>
            <Button type="submit" disabled={pending || noCategories} className={cn(pending && "gap-2")}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Tạo dịch vụ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
