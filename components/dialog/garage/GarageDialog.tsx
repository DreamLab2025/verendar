"use client";

import { Loader2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateGarage, useGarageBusinessLookupQuery } from "@/hooks/useGarage";
import { cn } from "@/lib/utils";

function emptyForm() {
  return {
    businessName: "",
    shortName: "",
    taxCode: "",
  };
}

export function GarageDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const createGarage = useCreateGarage();
  const lookup = useGarageBusinessLookupQuery(form.taxCode, false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setForm(emptyForm());
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const businessName = form.businessName.trim();
    const shortName = form.shortName.trim();
    const taxCode = form.taxCode.trim();
    if (!businessName || !shortName) return;

    createGarage.mutate(
      { businessName, shortName, taxCode: taxCode || undefined, logoUrl: null },
      {
        onSuccess: () => {
          setOpen(false);
          setForm(emptyForm());
        },
      },
    );
  };

  const pending = createGarage.isPending;

  const lookupByTaxCode = async () => {
    const taxCode = form.taxCode.trim();
    if (!open || !taxCode) return;
    const res = await lookup.refetch();
    const payload = res.data?.data;
    if (!payload) return;
    const businessName = payload.name?.trim() ?? "";
    const shortName = payload.shortName?.trim() ?? "";
    setForm((prev) => ({
      ...prev,
      businessName: businessName || prev.businessName,
      shortName: shortName || prev.shortName,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo garage mới</DialogTitle>
          <DialogDescription>Nhập thông tin đăng ký garage. Bạn có thể chỉnh sửa sau khi tạo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="garage-dialog-tax-code">Mã số thuế (không bắt buộc)</Label>
            <Input
              id="garage-dialog-tax-code"
              name="taxCode"
              autoComplete="off"
              inputMode="numeric"
              value={form.taxCode}
              onChange={(ev) => setForm((f) => ({ ...f, taxCode: ev.target.value }))}
              onBlur={() => {
                void lookupByTaxCode();
              }}
              placeholder="Mã số thuế doanh nghiệp"
              disabled={pending}
            />
            {lookup.isFetching ? (
              <p className="text-xs text-muted-foreground">Đang tra cứu thông tin doanh nghiệp...</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="garage-dialog-business-name">Tên doanh nghiệp</Label>
            <Input
              id="garage-dialog-business-name"
              name="businessName"
              autoComplete="organization"
              value={form.businessName}
              onChange={(ev) => setForm((f) => ({ ...f, businessName: ev.target.value }))}
              placeholder="Ví dụ: Công ty TNHH ABC"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="garage-dialog-short-name">Tên ngắn</Label>
            <Input
              id="garage-dialog-short-name"
              name="shortName"
              value={form.shortName}
              onChange={(ev) => setForm((f) => ({ ...f, shortName: ev.target.value }))}
              placeholder="Hiển thị ngắn gọn"
              required
              disabled={pending}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
              Hủy
            </Button>
            <Button type="submit" disabled={pending} className={cn(pending && "gap-2")}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Tạo garage
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
