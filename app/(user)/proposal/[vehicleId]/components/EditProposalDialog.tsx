"use client";

import { useEffect, useState } from "react";
import { ClipboardEdit, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useApplyMaintenanceProposalMutation,
  usePatchMaintenanceProposalMutation,
} from "@/hooks/useMaintenanceProposals";
import type { MaintenanceProposalDto } from "@/lib/api/services/fetchMaintenanceProposals";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/useMobile";

interface EditProposalDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  p: MaintenanceProposalDto;
  vehicleId: string;
}

export function EditProposalDialog({
  open,
  onOpenChange,
  p,
  vehicleId,
}: EditProposalDialogProps) {
  const isMobile = useMobile();
  const patchMutation = usePatchMaintenanceProposalMutation(vehicleId);
  const applyMutation = useApplyMaintenanceProposalMutation(vehicleId);

  const [odometerInput, setOdometerInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOdometerInput(
      p.odometerAtService != null ? String(p.odometerAtService) : "",
    );
    setNotesInput(p.notes?.trim() ? p.notes : "");
    // Defaulting to true for all items is handled in onPatch logic
  }, [open, p]);

  const parseOdometer = (): number | null => {
    const t = odometerInput.trim().replace(/\s/g, "").replace(/\./g, "");
    if (t === "") return null;
    const n = Number(t);
    if (Number.isNaN(n) || n < 0) return Number.NaN;
    return Math.floor(n);
  };

  const patching =
    patchMutation.isPending && patchMutation.variables?.proposalId === p.id;
  const applying =
    applyMutation.isPending && applyMutation.variables === p.id;
  const submitting = patching || applying;

  const formatVnd = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(n);

  const onPatch = () => {
    const odo = parseOdometer();
    if (Number.isNaN(odo)) {
      toast.error("Số km ODO không hợp lệ.");
      return;
    }
    const notes = notesInput.trim() || null;
    const items = p.items.map((it) => ({
      id: it.id,
      updatesTracking: true,
    }));

    patchMutation.mutate(
      { proposalId: p.id, payload: { odometerAtService: odo, notes, items } },
      {
        onSuccess: (body) => {
          if (body?.isSuccess) {
            applyMutation.mutate(p.id, {
              onSuccess: (applyBody) => {
                if (applyBody?.isSuccess) {
                  const extra = applyBody.data?.trackingUpdated?.length
                    ? ` (Đã cập nhật: ${applyBody.data.trackingUpdated.join(", ")})`
                    : "";
                  toast.success(
                    (applyBody.message?.trim() || "Đã cập nhật và xác nhận áp dụng.") + extra,
                  );
                  onOpenChange(false);
                } else {
                  toast.error(
                    applyBody?.message?.trim() || "Đã cập nhật nhưng không xác nhận được.",
                  );
                }
              },
              onError: (err: Error) => {
                toast.error(err.message || "Đã cập nhật nhưng xác nhận thất bại.");
              },
            });
          } else {
            toast.error(body?.message?.trim() || "Không cập nhật được.");
          }
        },
        onError: (err: Error) => {
          toast.error(err.message || "Cập nhật thất bại.");
        },
      },
    );
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content aria-describedby={undefined} asChild>
              <motion.div
                initial={
                  isMobile
                    ? { opacity: 0, y: "100%" }
                    : { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }
                }
                animate={
                  isMobile
                    ? { opacity: 1, y: "0%" }
                    : { opacity: 1, scale: 1, x: "-50%", y: "-50%" }
                }
                exit={
                  isMobile
                    ? { opacity: 0, y: "100%" }
                    : { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }
                }
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "fixed z-50 grid w-full gap-0 border bg-background shadow-lg overflow-hidden",
                  isMobile
                    ? "inset-x-0 bottom-0 h-[90vh] rounded-t-2xl rounded-b-none p-0"
                    : "left-[50%] top-[50%] h-fit max-h-[95vh] sm:max-w-3xl sm:rounded-xl p-0"
                )}
              >
                <div className="flex flex-col h-full max-h-[90vh]">
                  {/* Header */}
                  <div className="border-b border-border/50 bg-muted/20 px-4 py-4 sm:px-5">
                    <div className="flex items-start gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary shadow-inner">
                        <ClipboardEdit className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <DialogPrimitive.Title className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                          Cập nhật đề xuất
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="mt-0.5 text-xs font-medium text-muted-foreground">
                          Điều chỉnh ODO, ghi chú và tự động xác nhận áp dụng.
                        </DialogPrimitive.Description>

                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-md border border-border/60 bg-background px-2.5 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Mã đề xuất</p>
                            <p className="mt-1 font-mono text-sm font-semibold text-foreground">{p.id.slice(-6).toUpperCase()}</p>
                          </div>
                          <div className="rounded-md border border-border/60 bg-background px-2.5 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Số hạng mục</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{p.items.length} mục</p>
                          </div>
                          <div className="rounded-md border border-border/60 bg-background px-2.5 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Tổng chi phí</p>
                            <p className="mt-1 truncate text-sm font-semibold text-foreground">{formatVnd(p.totalAmount)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                      <section className="space-y-4 rounded-xl border border-border/60 bg-card p-4">
                        <div className="space-y-2.5">
                          <Label htmlFor={`dlg-odo-${p.id}`} className="text-sm font-semibold text-foreground/80">
                            ODO tại dịch vụ (km)
                          </Label>
                          <div className="relative">
                            <Input
                              id={`dlg-odo-${p.id}`}
                              inputMode="numeric"
                              placeholder="Ví dụ: 40.000"
                              value={odometerInput}
                              onChange={(e) => setOdometerInput(e.target.value)}
                              className="h-11 rounded-lg border-border/60 bg-muted/20 pl-3 font-mono text-base font-semibold tabular-nums"
                              disabled={submitting}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-muted-foreground/70">km</span>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <Label htmlFor={`dlg-notes-${p.id}`} className="text-sm font-semibold text-foreground/80">
                            Ghi chú
                          </Label>
                          <Textarea
                            id={`dlg-notes-${p.id}`}
                            placeholder="Ghi chú cho garage hoặc kỹ thuật viên..."
                            value={notesInput}
                            onChange={(e) => setNotesInput(e.target.value)}
                            rows={5}
                            className="min-h-[140px] resize-none rounded-lg border-border/60 bg-muted/20 p-3"
                            disabled={submitting}
                          />
                        </div>
                      </section>

                      <aside className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Theo dõi phụ tùng
                        </p>
                        <ul className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                          {p.items.map((it) => (
                            <li
                              key={it.id}
                              className={cn(
                                "rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5",
                                "transition-colors hover:bg-muted/30",
                              )}
                            >
                              <p className="truncate text-sm font-semibold text-foreground">
                                {it.itemName}
                              </p>
                              <p className="text-[10px] font-semibold text-muted-foreground/80">
                                {it.partCategoryName}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </aside>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto border-t border-border/50 bg-muted/20 p-4">
                    <div className="flex gap-3 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 flex-1 rounded-lg px-6 font-semibold sm:flex-none"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                      >
                        Huỷ
                      </Button>
                      <Button
                        type="button"
                        className="h-10 flex-1 rounded-lg px-8 font-semibold sm:flex-none"
                        onClick={onPatch}
                        disabled={submitting}
                      >
                        {patching ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Đang cập nhật…
                          </>
                        ) : applying ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Đang xác nhận…
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 size-4" />
                            Lưu và xác nhận
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 hover:bg-muted focus:outline-none disabled:pointer-events-none">
                  <span className="sr-only">Close</span>
                  <X className="size-5" />
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
