"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Image from "next/image";

interface OtpDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  email: string;
  onVerify: (otp: string) => void;
  onResend?: () => void;
  isLoading?: boolean;
}

export function OtpDialog({
  open,
  onOpenChange,
  email,
  onVerify,
  onResend,
  isLoading,
}: OtpDialogProps) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOtp("");
      setTimeLeft(60);
    }
  }, [open]);

  // Countdown logic
  useEffect(() => {
    if (!open || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [open, timeLeft]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerify(otp);
    }
  };

  const handleResend = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onResend && timeLeft <= 0) {
      onResend();
      setTimeLeft(60);
    }
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
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "fixed left-[50%] top-[50%] z-50 grid w-full sm:max-w-[420px] gap-6 border bg-background p-6 shadow-2xl sm:rounded-2xl"
                )}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Image width={40} height={40} src="/icon.svg" alt="Verendar Logo" className="h-10 w-auto" style={{ width: "auto" }} />
                  </div>

                  <DialogPrimitive.Title className="text-2xl font-bold tracking-tight text-foreground">
                    Xác thực OTP
                  </DialogPrimitive.Title>
                  <p className="mt-1 text-sm text-muted-foreground px-4">
                    Mã xác thực đã được gửi đến <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerify} className="flex flex-col gap-6">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-12 w-11 sm:w-12" />
                        <InputOTPSlot index={1} className="h-12 w-11 sm:w-12" />
                        <InputOTPSlot index={2} className="h-12 w-11 sm:w-12" />
                        <InputOTPSlot index={3} className="h-12 w-11 sm:w-12" />
                        <InputOTPSlot index={4} className="h-12 w-11 sm:w-12" />
                        <InputOTPSlot index={5} className="h-12 w-11 sm:w-12" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button type="submit" disabled={otp.length !== 6 || isLoading} className="w-full h-11 rounded-xl font-semibold">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Xác nhận mã OTP"}
                    </Button>

                    <div className="flex flex-col items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResend}
                        disabled={timeLeft > 0 || isLoading}
                        className="h-auto p-0 text-xs font-semibold text-primary hover:bg-transparent"
                      >
                        {timeLeft > 0 ? `Gửi lại mã sau ${timeLeft}s` : "Gửi lại mã xác thực"}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto p-0 text-xs text-muted-foreground hover:bg-transparent"
                        onClick={() => onOpenChange?.(false)}
                      >
                        Quay lại đăng nhập
                      </Button>
                    </div>
                  </div>
                </form>

                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-xl opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-2">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
