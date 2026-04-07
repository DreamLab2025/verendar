"use client";

import { useState } from "react";
import { AuthService, JwtPayload, AuthState, AuthResult, User } from "@/lib/api/services/fetchAuth";
import { deleteCookie, setCookie, getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import api8080Service from "@/lib/api/api8080Service";
import apiService from "@/lib/api/apiService";
import type { ApiError, ApiErrorData } from "@/lib/api/apiService";
import { getAuthCookieConfig } from "@/utils/cookieConfig";
import { getPrimaryRoleFromRoles, normalizeJwtRolesClaim } from "@/lib/auth/role-routing";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";

function decodeJwtPayloadUtf8<T extends object = Record<string, unknown>>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder("utf-8").decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isAccessTokenValid(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = decodeJwtPayloadUtf8<{ exp?: number }>(token);
    if (!decoded) return false;
    const expMs = decoded.exp ? decoded.exp * 1000 : 0;
    if (expMs && expMs < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null, loading: false, error: null });

  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuthSession = useAuthStore((s) => s.setAuthSession);
  const clearAuthSession = useAuthStore((s) => s.logout);
  const storedRefreshToken = useAuthStore((s) => s.refreshToken);

  /* ---------- JWT HELPERS ---------- */

  const decodeJwt = (token: string): JwtPayload => {
    const decoded = decodeJwtPayloadUtf8<JwtPayload>(token);
    return decoded ?? {};
  };

  const buildUserFromToken = (token: string): User => {
    const payload = decodeJwt(token);
    const roles = normalizeJwtRolesClaim(payload.role);
    const primaryRole = getPrimaryRoleFromRoles(roles);
    const userName = payload.userName || payload.unique_name || payload.email?.split("@")[0] || "";

    return {
      userId: payload.userId || payload.sub || "",
      userName,
      email: payload.email || "",
      role: primaryRole || "User",
      avatarUrl: `https://ui-avatars.com/api/?name=${userName}&background=0D8ABC&color=fff`,
    };
  };

  /* ===================== LOGIN ===================== */

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const response = await AuthService.login(email, password);

      const token = response.data.data.accessToken;
      const refreshToken = response.data.data.refreshToken ?? null;
      const user = buildUserFromToken(token);

      // ✅ LƯU COOKIE
      setCookie("authToken", token, getAuthCookieConfig());

      // ✅ SET TOKEN CHO TẤT CẢ API SERVICES
      api8080Service.setAuthToken(token);
      apiService.setAuthToken(token);
      setAuthSession({ accessToken: token, refreshToken });
      setState({
        user,
        accessToken: token,
        loading: false,
        error: null,
      });

      // TEMP: disable SignalR during UI/auth testing
      // console.log("🔌 Attempting to connect to notification hub after login...");
      // startHubConnection(token).then((connected) => {
      //   if (connected) {
      //     console.log("✅ Notification hub connected successfully after login!");
      //   } else {
      //     console.warn("⚠️ Failed to connect to notification hub after login");
      //   }
      // });

      toast.success("Đăng nhập thành công!");
      return { success: true, user };
    } catch (err) {
      // Lấy message từ BE response nếu có
      let message = "Đăng nhập thất bại";
      if (err && typeof err === "object" && "message" in err) {
        // Nếu là ApiError từ interceptor
        const apiError = err as ApiError;
        message = apiError.message || apiError.error?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }

      toast.error(message);
      setState((s) => ({ ...s, loading: false, error: message }));

      if (err && typeof err === "object" && "error" in err) {
        const apiError = err as ApiError;
        const errorData = apiError.error as ApiErrorData & {
          metadata?: { requiresOtpVerification?: boolean; email?: string };
        };
        const metadata = errorData?.metadata;

        if (metadata?.requiresOtpVerification) {
          return {
            success: false,
            error: message,
            requiresOtpVerification: true,
            email: metadata.email,
          };
        }
      }

      return { success: false, error: message };
    }
  };

  /* ===================== REGISTER ===================== */

  const register = async (email: string, password: string, phoneNumber: string): Promise<AuthResult> => {
    setState((s) => ({ ...s, loading: true, error: null }));
 
    try {
      const response = await AuthService.register({
        email,
        password,
        phoneNumber,
        fullName: email.split("@")[0],
      });
      const userData = response.data.data;

      const user: User = {
        userId: userData.id,
        userName: userData.userName,
        email: userData.email,
        role: userData.roles[0] || "User",
        avatarUrl: `https://ui-avatars.com/api/?name=${userData.userName}&background=0D8ABC&color=fff`,
      };

      setState({
        user,
        accessToken: null,
        loading: false,
        error: null,
      });

      toast.success("Đăng ký thành công!");
      return { success: true, user };
    } catch (err) {
      // Lấy message từ BE response nếu có
      let message = "Đăng ký thất bại";
      if (err && typeof err === "object" && "message" in err) {
        // Nếu là ApiError từ interceptor
        const apiError = err as ApiError;
        message = apiError.message || apiError.error?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }

      toast.error(message);
      setState((s) => ({ ...s, loading: false, error: message }));
      return { success: false, error: message };
    }
  };

  /* ===================== VERIFY OTP ===================== */

  const verifyRegisterOtp = async (email: string, otpCode: string): Promise<AuthResult> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      await AuthService.verifyRegisterOtp({ email, otpCode });

      setState((s) => ({ ...s, loading: false }));
      toast.success("Xác thực mã OTP thành công!");
      return { success: true };
    } catch (err) {
      let message = "Mã OTP không đúng hoặc đã hết hạn";
      if (err && typeof err === "object" && "message" in err) {
        message = (err as ApiError).message || (err as ApiError).error?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }

      toast.error(message);
      setState((s) => ({ ...s, loading: false, error: message }));
      return { success: false, error: message };
    }
  };

  const verifyResetPasswordOtp = async (email: string, otpCode: string): Promise<AuthResult> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      await AuthService.verifyResetPasswordOtp({ email, otpCode });

      setState((s) => ({ ...s, loading: false }));
      toast.success("Xác thực mã OTP thành công!");
      return { success: true };
    } catch (err) {
      let message = "Mã OTP không đúng hoặc đã hết hạn";
      if (err && typeof err === "object" && "message" in err) {
        message = (err as ApiError).message || (err as ApiError).error?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }

      toast.error(message);
      setState((s) => ({ ...s, loading: false, error: message }));
      return { success: false, error: message };
    }
  };
 
  const resendOtp = async (email: string): Promise<AuthResult> => {
    setState((s) => ({ ...s, loading: true, error: null }));
 
    try {
      await AuthService.resendOtp(email);
      setState((s) => ({ ...s, loading: false }));
      toast.success("Mã OTP đã được gửi lại!");
      return { success: true };
    } catch (err) {
      let message = "Gửi lại mã OTP thất bại";
      if (err && typeof err === "object" && "message" in err) {
        message = (err as ApiError).message || (err as ApiError).error?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      toast.error(message);
      setState((s) => ({ ...s, loading: false, error: message }));
      return { success: false, error: message };
    }
  };
 
  /* ===================== FORGOT PASSWORD ===================== */

  const forgotPassword = async (email: string): Promise<AuthResult> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const response = await AuthService.forgotPassword(email);
      const msg = response.data.message;

      setState((s) => ({ ...s, loading: false }));
      toast.info(msg || "Vui lòng kiểm tra email để lấy mã OTP");
      return { success: true, message: msg };
    } catch (err) {
      let message = "Gửi OTP thất bại";
      if (err && typeof err === "object" && "message" in err) {
        message = (err as ApiError).message || (err as ApiError).error?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      toast.error(message);
      setState((s) => ({ ...s, loading: false, error: message }));
      return { success: false, error: message };
    }
  };

  /* ===================== RESET PASSWORD ===================== */

  const resetPassword = async (
    email: string,
    newPassword: string,
    confirmNewPassword: string,
  ): Promise<AuthResult> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const response = await AuthService.resetPassword({
        email,
        newPassword,
        confirmNewPassword,
      });

      const msg = response.data.message;
      setState((s) => ({ ...s, loading: false }));
      toast.success(msg || "Đặt lại mật khẩu thành công!");
      return { success: true, message: msg };
    } catch (err) {
      let message = "Đặt lại mật khẩu thất bại";
      if (err && typeof err === "object" && "message" in err) {
        message = (err as ApiError).message || (err as ApiError).error?.message || message;
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      toast.error(message);
      setState((s) => ({ ...s, loading: false, error: message }));
      return { success: false, error: message };
    }
  };

  /* ===================== LOGOUT ===================== */

  const logout = () => {
    clearAuthSession();
    deleteCookie("authToken", { path: "/" });
    api8080Service.setAuthToken(null);
    apiService.setAuthToken(null);

    // ✅ CLEAR REACT QUERY CACHE (xóa toàn bộ cache)
    queryClient.clear();

    // TEMP: disable SignalR during UI/auth testing
    // console.log("🔌 Disconnecting from notification hub on logout...");
    // notificationHubService.stopConnection().then(() => {
    //   console.log("✅ Notification hub disconnected");
    // });

    // ✅ CLEAR STATE
    setState({
      user: null,
      accessToken: null,
      loading: false,
      error: null,
    });

    // ✅ REDIRECT TO LOGIN
    toast.info("Đã đăng xuất");
    router.push("/login");
  };

  /* ===================== INIT AUTH ===================== */

  const initAuthFromStorage = async () => {
    setState((s) => ({ ...s, loading: true }));

    const token = getCookie("authToken") as string | undefined;
    if (!token) {
      clearAuthSession();
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const payload = decodeJwt(token);
    const exp = payload.exp ? payload.exp * 1000 : 0;

    const now = new Date().getTime();
    if (exp && exp < now) {
      // Access token hết hạn — thử refresh trước khi logout
      const persistedRefresh = storedRefreshToken;
      if (persistedRefresh) {
        try {
          const res = await AuthService.refreshToken(persistedRefresh);
          const nextAccess = res.data.data.accessToken;
          const nextRefresh = res.data.data.refreshToken ?? null;

          setCookie("authToken", nextAccess, getAuthCookieConfig());
          api8080Service.setAuthToken(nextAccess);
          apiService.setAuthToken(nextAccess);
          setAuthSession({ accessToken: nextAccess, refreshToken: nextRefresh });
          setState((s) => ({ ...s, accessToken: nextAccess }));

          await fetchCurrentUser();
          setState((s) => ({ ...s, loading: false }));
          return;
        } catch {
          // Refresh thất bại → logout
          logout();
          return;
        }
      }
      logout();
      return;
    }

    // ✅ SET TOKEN CHO TẤT CẢ API SERVICES
    api8080Service.setAuthToken(token);
    apiService.setAuthToken(token);
    setAuthSession({ accessToken: token, refreshToken: storedRefreshToken });

    setState((s) => ({ ...s, accessToken: token }));

    await fetchCurrentUser();

    // TEMP: disable SignalR during UI/auth testing
    // const currentState = getCookie("authToken") as string | undefined;
    // if (currentState) {
    //   console.log("🔌 Attempting to connect to notification hub on init...");
    //   notificationHubService.startConnection(currentState).then((connected) => {
    //     if (connected) {
    //       console.log("✅ Notification hub connected successfully on init!");
    //     } else {
    //       console.warn("⚠️ Failed to connect to notification hub on init");
    //     }
    //   });
    // }

    setState((s) => ({ ...s, loading: false }));
  };

  /* ===================== FETCH CURRENT USER ===================== */
  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await AuthService.me();
      const userData = response.data.data;
      const user: User = {
        userId: userData.id,
        userName: userData.userName,
        email: userData.email,
        role: userData.roles[0] || "User",
        avatarUrl: `https://ui-avatars.com/api/?name=${userData.userName}&background=0D8ABC&color=fff`,
      };

      setState((s) => ({
        ...s,
        user,
        accessToken: s.accessToken, // token đã có từ Provider
      }));

      return user;
    } catch (err) {
      // Lỗi 401: interceptor của api8080Service đã tự động thử refresh và redirect nếu thất bại.
      // Không gọi logout() ở đây để tránh double-redirect.
      console.error("Lấy thông tin user thất bại:", err);
      return null;
    }
  };



  /** Token cho hub / API khi cookie còn nhưng state `useAuth` chưa hydrate (vd. sau reload). */
  const resolvedAccessToken =
    state.accessToken ??
    ((getCookie("authToken") as string | undefined) ?? null);

  return {
    user: state.user,
    accessToken: state.accessToken,
    resolvedAccessToken,
    loading: state.loading,
    error: state.error,

    login,
    register,
    verifyRegisterOtp,
    verifyResetPasswordOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    logout,
    initAuthFromStorage,
    fetchCurrentUser,
    clearError: () => setState((s) => ({ ...s, error: null })),
  };
}
