"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCookie } from "cookies-next";
import { toast } from "sonner";

import api8080Service from "@/lib/api/api8080Service";
import apiService from "@/lib/api/apiService";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Đăng xuất giống useAuth.logout: xóa cookie, clear token API, clear React Query, sync tab Redux.
 */
export function useOwnerSessionLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useCallback(() => {
    logout();
    deleteCookie("authToken", { path: "/" });
    api8080Service.setAuthToken(null);
    apiService.setAuthToken(null);
    queryClient.clear();
    window.dispatchEvent(new Event("logout"));
    toast.info("Đã đăng xuất");
    router.push("/login");
  }, [logout, queryClient, router]);
}
