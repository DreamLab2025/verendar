"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCookie } from "cookies-next";

import api8080Service from "@/lib/api/api8080Service";
import apiService from "@/lib/api/apiService";

/**
 * Đăng xuất giống useAuth.logout: xóa cookie, clear token API, clear React Query, sync tab Redux.
 */
export function useOwnerSessionLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(() => {
    deleteCookie("auth-token", { path: "/", domain: undefined });
    deleteCookie("authToken", { path: "/" });
    api8080Service.setAuthToken(null);
    apiService.setAuthToken(null);
    queryClient.clear();
    window.dispatchEvent(new Event("logout"));
    router.push("/login");
  }, [queryClient, router]);
}
