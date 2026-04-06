"use client";

import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateBranchMember } from "@/hooks/useBranchMember";
import {
  BRANCH_MEMBER_ROLE_LABEL_VI,
  BranchMemberRole,
} from "@/lib/api/services/fetchBranchMember";
import { cn } from "@/lib/utils";

function emptyForm() {
  return {
    fullName: "",
    email: "",
    phoneNumber: "",
    role: BranchMemberRole.Manager as string,
  };
}

export type StaffBranchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  garageId: string;
  branchId: string;
};

export function StaffBranchDialog({ open, onOpenChange, garageId, branchId }: StaffBranchDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const createMember = useCreateBranchMember();

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setForm(emptyForm());
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!garageId || !branchId) return;
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const phoneNumber = form.phoneNumber.trim();
    if (!fullName || !email || !phoneNumber || !form.role) return;

    createMember.mutate(
      { garageId, payload: { fullName, email, phoneNumber, role: form.role, branchId } },
      {
        onSuccess: () => {
          handleOpenChange(false);
        },
      },
    );
  };

  const pending = createMember.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên</DialogTitle>
          <DialogDescription>
            Nhập thông tin thành viên cho chi nhánh hiện tại. Họ sẽ nhận vai trò bạn chọn sau khi hệ thống xử lý.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staff-branch-full-name">Họ và tên</Label>
            <Input
              id="staff-branch-full-name"
              name="fullName"
              autoComplete="name"
              value={form.fullName}
              onChange={(ev) => setForm((f) => ({ ...f, fullName: ev.target.value }))}
              placeholder="Nguyễn Văn A"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-branch-email">Email</Label>
            <Input
              id="staff-branch-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(ev) => setForm((f) => ({ ...f, email: ev.target.value }))}
              placeholder="email@example.com"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-branch-phone">Số điện thoại</Label>
            <Input
              id="staff-branch-phone"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              value={form.phoneNumber}
              onChange={(ev) => setForm((f) => ({ ...f, phoneNumber: ev.target.value }))}
              placeholder="0901234567"
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-branch-role">Vai trò</Label>
            <Select
              value={form.role}
              onValueChange={(role) => setForm((f) => ({ ...f, role }))}
              disabled={pending}
            >
              <SelectTrigger id="staff-branch-role" className="w-full">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BranchMemberRole.Manager}>
                  {BRANCH_MEMBER_ROLE_LABEL_VI[BranchMemberRole.Manager]}
                </SelectItem>
                <SelectItem value={BranchMemberRole.Mechanic}>
                  {BRANCH_MEMBER_ROLE_LABEL_VI[BranchMemberRole.Mechanic]}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
              Hủy
            </Button>
            <Button type="submit" disabled={pending} className={cn(pending && "gap-2")}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Thêm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
