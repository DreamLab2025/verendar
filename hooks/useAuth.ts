"use client";

import { useState } from "react";
import { AuthService, JwtPayload, AuthState, AuthResult, User } from "@/lib/api/services/fetchAuth";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import api8080Service from "@/lib/api/api8080Service";
import apiService from "@/lib/api/apiService";
import type { ApiError } from "@/lib/api/apiService";
import { getAuthCookieConfig } from "@/utils/cookieConfig";

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null, loading: false, error: null });

  const router = useRouter();
  const queryClient = useQueryClient();

  /* ---------- JWT HELPERS ---------- */

  const decodeJwt = (token: string): JwtPayload => {
    try {
      const payload = token.split(".")[1];
      if (!payload) return {};
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch {
      return {};
    }
  };

  const buildUserFromToken = (token: string): User => {
    const payload = decodeJwt(token);

    return {
      userId: payload.userId || payload.sub || "",
      userName: payload.userName || payload.unique_name || payload.email?.split("@")[0] || "",
      email: payload.email || "",
      role: Array.isArray(payload.role) ? payload.role[0] : payload.role || "User",
      avatarUrl: `https://ui-avatars.com/api/?name=${payload.userName}&background=0D8ABC&color=fff`,
    };
  };

  /* ===================== LOGIN ===================== */

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const response = await AuthService.login(email, password);

      const token = response.data.data.accessToken;
      const user = buildUserFromToken(token);

      // ✅ LƯU COOKIE
      setCookie("authToken", token, getAuthCookieConfig());
      setCookie("auth-token", token, getAuthCookieConfig()); // Backward compatibility

      // ✅ SET TOKEN CHO TẤT CẢ API SERVICES
      api8080Service.setAuthToken(token);
      apiService.setAuthToken(token);
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

      setState((s) => ({ ...s, loading: false, error: message }));
      return { success: false, error: message };
    }
  };

  /* ===================== REGISTER ===================== */

  const register = async (email: string, password: string): Promise<AuthResult> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const response = await AuthService.register(email, password);
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

      setState((s) => ({ ...s, loading: false, error: message }));
      return { success: false, error: message };
    }
  };

  /* ===================== VERIFY OTP ===================== */

  const verifyOtp = async (email: string, otpCode: string): Promise<AuthResult> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      await AuthService.verifyOtp(email, otpCode);

      setState((s) => ({ ...s, loading: false }));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mã OTP không đúng hoặc đã hết hạn";

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
      return { success: true, message: msg };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gửi OTP thất bại";
      setState((s) => ({ ...s, loading: false, error: message }));
      return { success: false, error: message };
    }
  };

  /* ===================== RESET PASSWORD ===================== */

  const resetPassword = async (
    email: string,
    otpCode: string,
    newPassword: string,
    confirmNewPassword: string,
  ): Promise<AuthResult> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const response = await AuthService.resetPassword({
        email,
        otpCode,
        newPassword,
        confirmNewPassword,
      });

      const msg = response.data.message;
      setState((s) => ({ ...s, loading: false }));
      return { success: true, message: msg };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại";
      setState((s) => ({ ...s, loading: false, error: message }));
      return { success: false, error: message };
    }
  };

  /* ===================== LOGOUT ===================== */

  const logout = () => {
    // ✅ XÓA COOKIE (với tất cả các options để đảm bảo xóa hoàn toàn)
    deleteCookie("auth-token", {
      path: "/",
      domain: undefined, // Xóa trên tất cả domains
    });
    deleteCookie("authToken", { path: "/" });

    // ✅ CLEAR TOKEN Ở TẤT CẢ API SERVICES
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
    router.push("/login");
  };

  /* ===================== INIT AUTH ===================== */

  const initAuthFromStorage = async () => {
    setState((s) => ({ ...s, loading: true }));

    const token = (getCookie("authToken") as string | undefined) ?? (getCookie("auth-token") as string | undefined);
    if (!token) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const payload = decodeJwt(token);
    const exp = payload.exp ? payload.exp * 1000 : 0;

    const now = new Date().getTime(); // ✅ Tách ra biến
    if (exp && exp < now) {
      logout();
      return;
    }

    // ✅ SET TOKEN CHO TẤT CẢ API SERVICES
    api8080Service.setAuthToken(token);
    apiService.setAuthToken(token);

    setState((s) => ({ ...s, accessToken: token }));

    await fetchCurrentUser();

    // TEMP: disable SignalR during UI/auth testing
    // const currentState = getCookie("auth-token") as string | undefined;
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
      console.error("Lấy thông tin user thất bại:", err);
      logout(); // 401 / token hết hạn
      return null;
    }
  };

  

  /** Token cho hub / API khi cookie còn nhưng state `useAuth` chưa hydrate (vd. sau reload). */
  const resolvedAccessToken =
    state.accessToken ??
    ((getCookie("authToken") as string | undefined) ?? (getCookie("auth-token") as string | undefined) ?? null);

  return {
    user: state.user,
    accessToken: state.accessToken,
    resolvedAccessToken,
    loading: state.loading,
    error: state.error,

    login,
    register,
    verifyOtp,
    forgotPassword,
    resetPassword,
    logout,
    initAuthFromStorage,
    fetchCurrentUser,
    clearError: () => setState((s) => ({ ...s, error: null })),
  };
}
