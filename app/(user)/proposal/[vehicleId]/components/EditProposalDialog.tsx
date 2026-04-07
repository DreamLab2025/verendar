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
import { usePatchMaintenanceProposalMutation } from "@/hooks/useMaintenanceProposals";
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
            toast.success(body.message?.trim() || "Đã cập nhật đề xuất.");
            onOpenChange(false);
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
                    : "left-[50%] top-[50%] h-fit max-h-[95vh] sm:rounded-xl sm:max-w-md p-0"
                )}
              >
                <div className="flex flex-col h-full max-h-[90vh]">
                  {/* Header */}
                  <div className="p-6 border-b bg-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                        <ClipboardEdit className="size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <DialogPrimitive.Title className="text-xl font-bold tracking-tight text-foreground">
                          Cập nhật đề xuất
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="text-xs text-muted-foreground font-medium mt-0.5">
                          Điều chỉnh ODO, ghi chú và theo dõi phụ tùng.
                        </DialogPrimitive.Description>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-6">
                    {/* ODO Section */}
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
                          className="h-12 rounded-xl bg-muted/20 pl-4 font-mono text-lg font-bold tabular-nums ring-offset-background focus-visible:ring-1 focus-visible:ring-primary shadow-xs"
                          disabled={patching}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-muted-foreground/60">km</span>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-2.5">
                      <Label htmlFor={`dlg-notes-${p.id}`} className="text-sm font-semibold text-foreground/80">
                        Ghi chú
                      </Label>
                      <Textarea
                        id={`dlg-notes-${p.id}`}
                        placeholder="Ghi chú cho garage hoặc kỹ thuật viên…"
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        rows={3}
                        className="min-h-[100px] resize-none rounded-xl bg-muted/20 p-4 ring-offset-background focus-visible:ring-1 focus-visible:ring-primary shadow-xs"
                        disabled={patching}
                      />
                    </div>

                    {/* Tracking Section */}
                    <div className="space-y-3.5">
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                        Cập nhật theo dõi phụ tùng
                      </p>
                      <ul className="space-y-2.5">
                        {p.items.map((it) => (
                          <li
                            key={it.id}
                            className={cn(
                              "flex items-center justify-between gap-4 rounded-2xl border border-border/40 bg-primary/3 p-3.5 shadow-xs transition-colors",
                              "hover:border-primary/20",
                            )}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-foreground">
                                {it.itemName}
                              </p>
                              <p className="text-[10px] font-semibold text-muted-foreground/70">
                                {it.partCategoryName}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-muted/10 border-t mt-auto">
                    <div className="flex gap-3 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl px-6 h-12 flex-1 sm:flex-none font-bold"
                        onClick={() => onOpenChange(false)}
                        disabled={patching}
                      >
                        Huỷ
                      </Button>
                      <Button
                        type="button"
                        className="rounded-xl px-8 h-12 flex-1 sm:flex-none font-bold shadow-sm shadow-primary/20"
                        onClick={onPatch}
                        disabled={patching}
                      >
                        {patching ? (
                          <>
                            <Loader2 className="mr-2 size-5 animate-spin" />
                            Đang lưu…
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 size-5" />
                            Lưu thay đổi
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
