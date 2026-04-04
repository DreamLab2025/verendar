"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

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
  const [error, setError] = useState("");

  // Reset timer when dialog opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(60);
      setOtp("");
    }
  }, [open]);

  // Countdown logic
  useEffect(() => {
    if (!open || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [open, timeLeft]);

  const handleVerify = () => {
    if (!otp) {
      setError("Vui lòng nhập mã OTP");
      return;
    }
    if (otp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số");
      return;
    }
    if (!/^\d+$/.test(otp)) {
      setError("Mã OTP chỉ bao gồm chữ số");
      return;
    }
    setError("");
    onVerify(otp);
  };

  const handleResend = () => {
    if (onResend) {
      onResend();
      setTimeLeft(60); // Reset timer after resending
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* Overlay */}
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80"
              />
            </DialogPrimitive.Overlay>

            {/* Content */}
            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "fixed left-[50%] top-[50%] z-50 grid w-full sm:max-w-[400px] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg"
                )}
              >
                <div className="flex flex-col space-y-1.5 text-center mb-2">
                  <DialogPrimitive.Title className="text-xl font-bold text-primary">
                    Xác thực OTP
                  </DialogPrimitive.Title>
                  <p className="text-sm text-muted-foreground">
                    Mã xác thực đã được gửi đến email{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center py-4 gap-2">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => {
                      setOtp(value);
                      setError("");
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleVerify}
                    disabled={otp.length !== 6 || isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Đang xác thực..." : "Xác nhận"}
                  </Button>

                  {onResend && (
                    <Button
                      variant="link"
                      onClick={handleResend}
                      disabled={timeLeft > 0 || isLoading}
                      className="text-xs text-muted-foreground font-normal"
                    >
                      {timeLeft > 0 ? `Gửi lại mã sau ${timeLeft}s` : "Gửi lại mã"}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full text-sm text-muted-foreground hover:bg-gray-200 hover:text-black"
                    onClick={() => onOpenChange?.(false)}
                  >
                    Quay lại đăng nhập
                  </Button>
                </div>

                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
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
