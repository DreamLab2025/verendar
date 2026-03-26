import type { ApiResponse } from "@/types/api";
import apiService from "@/lib/api/core";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
}

export const fetchAuth = {
  login: async (data: LoginRequest) =>
    (await apiService.post<ApiResponse<LoginData>>("api/v1/auth/login", data)).data,
  register: async (data: LoginRequest) =>
    (await apiService.post<ApiResponse<LoginData>>("api/v1/auth/register", data)).data,
  logout: async () => {
    await apiService.post("api/v1/auth/logout");
  },
};
