// hooks/useAuthClient.ts
"use client";

import { useState } from "react";
import { AuthService, VerifyOtpResult } from "@/lib/api/services/fetchAuth";
import type { ApiError } from "@/lib/api/apiService";

export function useAuthClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyOtp = async (email: string, otpCode: string): Promise<VerifyOtpResult> => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.verifyOtp(email, otpCode);
      setLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setLoading(false);

      // Lấy message từ BE response nếu có
      let message = "Mã OTP không đúng hoặc đã hết hạn";
      if (err && typeof err === "object" && "message" in err) {
        // Nếu là ApiError từ interceptor
        const apiError = err as ApiError;
        message = apiError.message || apiError.error?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }

      setError(message);
      return { success: false, error: message };
    }
  };

  return { verifyOtp, loading, error };
}
