"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Phone, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpDialog } from "@/components/dialog/auth/OtpDialog";

export default function RegisterPage() {
  const router = useRouter();
  const { register, verifyRegisterOtp, resendOtp, loading, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setFieldErrors({ email: "", phoneNumber: "", password: "", confirmPassword: "" });

    let hasError = false;
    const newErrors = { email: "", phoneNumber: "", password: "", confirmPassword: "" };

    // Validation
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedPhone || !/^0(3|5|7|8|9)\d{8}$/.test(trimmedPhone)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (phải là số Việt Nam 10 chữ số).";
      hasError = true;
    }

    if (!/[A-Z]/.test(password)) {
      newErrors.password = "Mật khẩu phải chứa ít nhất 1 ký tự viết hoa.";
      hasError = true;
    } else if (!/\d/.test(password)) {
      newErrors.password = "Mật khẩu phải chứa ít nhất 1 chữ số.";
      hasError = true;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }

    const result = await register(trimmedEmail, password, trimmedPhone);
    if (result.success) {
      setIsOtpOpen(true);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    const result = await verifyRegisterOtp(email, otp);
    if (result.success) {
      setIsOtpOpen(false);
      router.push("/login");
    }
  };

  return (
    <>
      <div className="w-full max-w-[440px] shrink-0">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4 text-center">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-zinc-200">
              <Image width={40} height={40} src="/icon.svg" alt="Verendar Logo" className="h-10 w-auto" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Đăng ký mới</h1>
              <p className="text-[15px] text-zinc-500 font-medium font-quicksand">
                Tham gia cùng Verendar ngay hôm nay.
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
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn("pl-11 h-14 rounded-2xl bg-white border border-zinc-200 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 transition-all font-medium shadow-sm", fieldErrors.email && "border-destructive focus-visible:ring-destructive/10")}
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
                </div>
                {fieldErrors.email && <p className="text-xs font-medium text-destructive">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="sr-only">Số điện thoại</Label>
                <div className="relative group">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0987654321"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={cn("pl-11 h-14 rounded-2xl bg-white border border-zinc-200 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 transition-all font-medium shadow-sm", fieldErrors.phoneNumber && "border-destructive focus-visible:ring-destructive/10")}
                    required
                  />
                  <Phone className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
                </div>
                {fieldErrors.phoneNumber && <p className="text-xs font-medium text-destructive">{fieldErrors.phoneNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="sr-only">Mật khẩu</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn("pl-11 pr-12 h-14 rounded-2xl bg-white border border-zinc-200 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 transition-all font-medium shadow-sm", fieldErrors.password && "border-destructive focus-visible:ring-destructive/10")}
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 flex w-10 items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs font-medium text-destructive">{fieldErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="sr-only">Xác nhận mật khẩu</Label>
                <div className="relative group">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn("pl-11 pr-12 h-14 rounded-2xl bg-white border border-zinc-200 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 transition-all font-medium shadow-sm", fieldErrors.confirmPassword && "border-destructive focus-visible:ring-destructive/10")}
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-primary" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-2 flex w-10 items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="text-xs font-medium text-destructive">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-[16px] rounded-2xl font-bold shadow-sm hover:shadow-lg active:scale-[0.98] transition-all mt-6 bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng ký thành viên"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>

      <OtpDialog
        open={isOtpOpen}
        onOpenChange={setIsOtpOpen}
        email={email}
        onVerify={handleVerifyOtp}
        onResend={() => resendOtp(email)}
        isLoading={loading}
      />
    </>
  );
}
