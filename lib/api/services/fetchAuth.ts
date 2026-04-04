// lib/api/services/fetchAuth.ts
import api8080Service from "../api8080Service";

/* ===================== RESPONSE TYPES ===================== */

export interface ApiSuccessResponse<T> {
  isSuccess: true;
  message: string;
  data: T;
  metadata?: unknown | null;
}

/* ===================== DATA TYPES ===================== */

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
}

export interface RegisterResponseData {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  isEmailConfirmed: boolean;
  isPhoneNumberConfirmed: boolean;
  status: string;
  roles: string[];
  createdAt: string;
}
 
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface UserMeData {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  isEmailConfirmed: boolean;
  isPhoneNumberConfirmed: boolean;
  status: string;
  roles: string[];
  createdAt: string;
}

export interface User {
  avatarUrl: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User | null;
  error?: string;
  message?: string;
}

export interface JwtPayload {
  userId?: string;
  sub?: string;
  unique_name?: string;
  userName?: string;
  email?: string;
  role?: string | string[];
  exp?: number;
}

/* ===================== AUTH APIs ===================== */

export const AuthService = {
  login: (email: string, password: string) =>
    api8080Service.post<ApiSuccessResponse<LoginResponseData>>("/api/v1/auth/login", { email, password }),

  register: (payload: RegisterRequest) =>
    api8080Service.post<ApiSuccessResponse<RegisterResponseData>>("/api/v1/auth/register", payload),

  verifyOtp: (email: string, otpCode: string) =>
    api8080Service.post<ApiSuccessResponse<boolean>>("/api/v1/auth/verify-otp", { email, otpCode }),
 
  resendOtp: (email: string) =>
    api8080Service.post<ApiSuccessResponse<boolean>>("/api/v1/auth/resend-otp", { email }),
 
  me: () => api8080Service.get<ApiSuccessResponse<UserMeData>>("/api/v1/users/me"),
  forgotPassword: (email: string) =>
    api8080Service.post<ApiSuccessResponse<boolean>>("/api/v1/auth/forgot-password", { email }),

  resetPassword: (payload: { email: string; otpCode: string; newPassword: string; confirmNewPassword: string }) =>
    api8080Service.post<ApiSuccessResponse<boolean>>("/api/v1/auth/reset-password", payload),

  refreshToken: (refreshToken: string) =>
    api8080Service.post<ApiSuccessResponse<LoginResponseData>>("/api/v1/auth/refresh-token", { refreshToken }),
};

export default AuthService;
