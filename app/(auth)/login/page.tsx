"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, User, Lock } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveHomeRouteFromRoles } from "@/lib/auth/role-routing";
import { ForgotPasswordDialog } from "@/components/dialog/auth/ForgotPasswordDialog";
import { OtpDialog } from "@/components/dialog/auth/OtpDialog";
import { ChangePasswordDialog } from "@/components/dialog/auth/ChangePasswordDialog";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    forgotPassword,
    verifyRegisterOtp,
    verifyResetPasswordOtp,
    resetPassword,
    resendOtp,
    user,
    accessToken,
    loading: authLoading,
    clearError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [otpFlow, setOtpFlow] = useState<"forgot" | "activation" | null>(null);

  useEffect(() => {
    if (accessToken && user?.role) {
      router.replace(resolveHomeRouteFromRoles([user.role]));
    }
  }, [accessToken, router, user?.role]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    const result = await login(email.trim(), password);
    if (result.success) {
      router.replace(resolveHomeRouteFromRoles(result.user?.role ? [result.user.role] : []));
      return;
    }

    if (result.requiresOtpVerification) {
      const targetEmail = result.email || email.trim();
      setForgotPasswordEmail(targetEmail);
      setOtpFlow("activation");
      setIsOtpOpen(true);
      await resendOtp(targetEmail);
    }
  };

  const handleForgotPasswordSuccess = async (enteredEmail: string) => {
    clearError();
    const result = await forgotPassword(enteredEmail);
    if (result.success) {
      setForgotPasswordEmail(enteredEmail);
      setOtpFlow("forgot");
      setIsForgotPasswordOpen(false);
      setIsOtpOpen(true);
    }
  };

  const handleOtpVerify = async (otp: string) => {
    clearError();

    if (otpFlow === "activation") {
      const result = await verifyRegisterOtp(forgotPasswordEmail, otp);
      if (result.success) {
        setIsOtpOpen(false);
        toast.success("Kích hoạt tài khoản thành công! Bây giờ bạn có thể đăng nhập.");
      }
      return;
    }

    // Default to forgot password flow
    const result = await verifyResetPasswordOtp(forgotPasswordEmail, otp);
    if (result.success) {
      setIsOtpOpen(false);
      setIsResetPasswordOpen(true);
    }
  };

  const handleChangePasswordSuccess = async (newPassword: string) => {
    clearError();
    const result = await resetPassword(forgotPasswordEmail, newPassword, newPassword);
    if (result.success) {
      setIsResetPasswordOpen(false);
      toast.success("Đặt lại mật khẩu thành công!");
    }
  };

  const handleResendOtp = async () => {
    await resendOtp(forgotPasswordEmail);
  };

  return (
    <>
      <div className="w-full max-w-[440px] shrink-0">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4 text-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-white">
              <Image width={48} height={48} src="/icon.svg" alt="Verendar Icon" className="size-12" style={{ width: "auto", height: "auto" }} />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Đăng nhập</h1>
              <p className="text-[15px] text-zinc-500 font-medium font-quicksand">
                Vui lòng đăng nhập để tiếp tục quản lý
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-11 h-14 rounded-2xl bg-white border border-zinc-200 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 transition-all font-medium shadow-sm"
                    required
                  />
                  <User className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="sr-only">Mật khẩu</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pl-11 pr-12 h-14 rounded-2xl bg-white border border-zinc-200 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 transition-all font-medium shadow-sm"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 flex w-10 items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-[16px] rounded-2xl font-bold shadow-sm hover:shadow-lg active:scale-[0.98] transition-all bg-primary hover:bg-primary/90" disabled={authLoading}>
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng nhập ngay"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
      <ForgotPasswordDialog
        open={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
        onSuccess={handleForgotPasswordSuccess}
        isLoading={authLoading}
      />
      <OtpDialog
        open={isOtpOpen}
        onOpenChange={setIsOtpOpen}
        email={forgotPasswordEmail}
        onVerify={handleOtpVerify}
        onResend={handleResendOtp}
        isLoading={authLoading}
      />
      <ChangePasswordDialog
        open={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
        onSuccess={handleChangePasswordSuccess}
        isLoading={authLoading}
      />
    </>
  );
}
