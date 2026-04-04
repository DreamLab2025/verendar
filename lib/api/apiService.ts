import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { deleteCookie, setCookie } from "cookies-next";
import { getAuthCookieConfig } from "@/utils/cookieConfig";
import { AUTH_STORAGE_KEY, useAuthStore } from "@/lib/stores/auth-store";

/* =========================
   Types
========================= */

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  metadata: unknown;
}

export interface ApiListResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T[];
  metadata: PaginationMetadata | null | string;
}

export interface ApiItemResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  metadata: null | string;
}

export interface ApiMutationResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T | string | null;
  metadata: null | string;
}

export interface BaseQueryParams {
  PageNumber?: number;
  PageSize?: number;
  IsDescending?: boolean;
}

export interface PaginationMetadata {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T[];
  metadata: PaginationMetadata;
}

export interface ApiErrorData {
  message?: string;
  code?: string | number;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export interface ApiError {
  status?: number;
  message: string;
  error?: ApiErrorData;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface RequestParams {
  [key: string]: string | number | boolean | null | undefined | string[];
}

/* =========================
   Api Service
========================= */

export class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private static isRedirecting = false; // Flag để tránh redirect nhiều lần
  /** Shared across ALL instances để tránh concurrent refresh calls */
  private static sharedRefreshPromise: Promise<string | null> | null = null;

  constructor(baseURL: string, timeout = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /* ---------- Token ---------- */

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      ApiService.isRedirecting = false;
    }
  }

  private readPersistedRefreshToken(): string | null {
    // ✅ Ưu tiên Zustand store (in-memory, luôn up-to-date ngay sau login)
    // localStorage persist có thể bị trễ vài ms → đây là root cause redirect sớm
    const storeRefreshToken = useAuthStore.getState().refreshToken;
    if (storeRefreshToken) return storeRefreshToken;

    // Fallback: đọc từ localStorage (dùng khi store chưa được hydrate)
    if (typeof window === "undefined") return null;
    try {
      const rawPersist = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!rawPersist) return null;
      const parsed = JSON.parse(rawPersist) as {
        state?: { refreshToken?: string | null };
      };
      return parsed.state?.refreshToken ?? null;
    } catch {
      return null;
    }
  }

  private writePersistedTokens(accessToken: string, refreshToken?: string | null) {
    if (typeof window === "undefined") return;
    try {
      const rawPersist = window.localStorage.getItem(AUTH_STORAGE_KEY);
      const parsed = rawPersist
        ? (JSON.parse(rawPersist) as {
            state?: Record<string, unknown>;
            version?: number;
          })
        : { state: {}, version: 0 };

      const nextState: Record<string, unknown> = {
        ...(parsed.state ?? {}),
        token: accessToken,
        isAuthenticated: true,
      };

      if (typeof refreshToken !== "undefined") {
        nextState.refreshToken = refreshToken;
      }

      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          state: nextState,
          version: parsed.version ?? 0,
        }),
      );
    } catch {
      // Ignore persist update errors to avoid breaking request flow.
    }
  }

  private clearPersistedAuth() {
    if (typeof window === "undefined") return;
    try {
      const rawPersist = window.localStorage.getItem(AUTH_STORAGE_KEY);
      const parsed = rawPersist
        ? (JSON.parse(rawPersist) as {
            state?: Record<string, unknown>;
            version?: number;
          })
        : { state: {}, version: 0 };

      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          state: {
            ...(parsed.state ?? {}),
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          },
          version: parsed.version ?? 0,
        }),
      );
    } catch {
      // Ignore persist cleanup errors.
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    // Dùng STATIC promise để share giữa mọi instances của ApiService
    // → tránh 2 instances (api8080Service + apiService) cùng gọi refresh song song
    if (ApiService.sharedRefreshPromise) {
      console.debug("[Auth] 🔄 Waiting for existing refresh promise...");
      return ApiService.sharedRefreshPromise;
    }

    ApiService.sharedRefreshPromise = (async () => {
      try {
        const refreshToken = this.readPersistedRefreshToken();
        if (!refreshToken) {
          console.debug("[Auth] ❌ No refresh token found, cannot refresh");
          return null;
        }

        const gatewayBase = process.env.NEXT_PUBLIC_API_URL_API_GATEWAY || this.client.defaults.baseURL || "";
        if (!gatewayBase) {
          console.debug("[Auth] ❌ Gateway base URL missing");
          return null;
        }

        console.debug("[Auth] 🛫 Calling refresh-token API...");
        const response = await axios.post<{
          isSuccess: boolean;
          data?: { accessToken?: string; refreshToken?: string | null };
        }>(
          "/api/v1/auth/refresh-token",
          { refreshToken },
          { baseURL: gatewayBase, timeout: 15000 },
        );

        const nextAccessToken = response.data?.data?.accessToken;
        if (!nextAccessToken) {
          console.debug("[Auth] refresh-token ❌ response missing accessToken", response.data);
          return null;
        }

        const nextRefreshToken = response.data?.data?.refreshToken;
        
        // Cập nhật mọi thứ đồng bộ
        this.setAuthToken(nextAccessToken);
        setCookie("authToken", nextAccessToken, getAuthCookieConfig());
        this.writePersistedTokens(nextAccessToken, nextRefreshToken ?? null);
        
        // Cập nhật Zustand store
        useAuthStore.getState().setAuthSession({ 
          accessToken: nextAccessToken, 
          refreshToken: nextRefreshToken ?? null 
        });

        console.debug("[Auth] refresh-token ✅ success");
        return nextAccessToken;
      } catch (err) {
        console.debug("[Auth] refresh-token ❌ failed", err);
        return null;
      }
    })();

    try {
      return await ApiService.sharedRefreshPromise;
    } finally {
      ApiService.sharedRefreshPromise = null;
    }
  }

  /* ---------- Interceptors ---------- */

  private parseErrorMessage(errorData: ApiErrorData | undefined): string {
    if (!errorData) return "Unknown error";

    // Nếu có message trực tiếp, ưu tiên dùng
    if (errorData.message) {
      return errorData.message;
    }

    // Nếu có errors object (validation errors từ BE)
    if (errorData.errors && typeof errorData.errors === "object") {
      const errorMessages: string[] = [];

      // Lấy tất cả các message từ errors object
      Object.entries(errorData.errors).forEach(([, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) => {
            if (typeof msg === "string") {
              errorMessages.push(msg);
            }
          });
        }
      });

      // Trả về message đầu tiên hoặc tất cả messages nối bằng dấu phẩy
      if (errorMessages.length > 0) {
        return errorMessages.join(", ");
      }
    }

    return "Unknown error";
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      // Ưu tiên token trong memory; fallback sang Zustand store
      // (đảm bảo instance khác đã refresh sẽ được pickup)
      const token = this.authToken ?? useAuthStore.getState().token ?? null;
      if (token) {
        // Đồng bộ lại instance nếu store có token mới hơn
        if (!this.authToken && token) this.authToken = token;
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Let browser set multipart boundary
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      async (error: AxiosError<ApiErrorData>) => {
        if (error.response?.status === 401) {
          const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

          if (originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            console.debug("[Auth] 401 intercepted, attempting refresh...", originalRequest.url);
            
            const nextAccessToken = await this.refreshAccessToken();

            if (nextAccessToken) {
              console.debug("[Auth] refresh ✅, retrying original request:", originalRequest.url);
              originalRequest.headers = {
                ...(originalRequest.headers ?? {}),
                Authorization: `Bearer ${nextAccessToken}`,
              };
              return this.client.request(originalRequest);
            }
            
            // Nếu refreshAccessToken trả về null, nó sẽ rơi xuống block redirect bên dưới
            console.debug("[Auth] refresh returned null — will force logout");
          } else if (originalRequest?._retry) {
            // Đã retry rồi nhưng vẫn 401 — check xem store có token mới hơn cái request này vừa dùng không
            const currentStoreToken = useAuthStore.getState().token;
            const requestToken = (originalRequest.headers?.Authorization as string)?.replace("Bearer ", "");

            if (currentStoreToken && currentStoreToken !== requestToken) {
              console.debug("[Auth] retry 401, but newer token found in store. Retrying again...");
              this.setAuthToken(currentStoreToken);
              originalRequest.headers = {
                ...(originalRequest.headers ?? {}),
                Authorization: `Bearer ${currentStoreToken}`,
              };
              return this.client.request(originalRequest);
            }
          }

          // CHỈ REDIRECT KHI:
          // 1. Không tìm thấy refreshToken hoặc API refresh trả về lỗi (nextAccessToken === null)
          // 2. Hoặc đã retry với token mới nhất mà vẫn bị 401
          if (typeof window !== "undefined" && !ApiService.isRedirecting) {
            console.debug("[Auth] ❌ Terminal 401, redirecting to /login");
            ApiService.isRedirecting = true;
            
            this.setAuthToken(null);
            deleteCookie("authToken", { path: "/" });
            this.clearPersistedAuth();
            useAuthStore.getState().logout();

            window.location.href = "/login";
          }

          return Promise.reject(new Error("Unauthorized"));
        }

        // Parse message từ error data (bao gồm cả errors object)
        const errorMessage = this.parseErrorMessage(error.response?.data);

        const apiError: ApiError = {
          status: error.response?.status,
          message: errorMessage,
          error: error.response?.data,
        };

        return Promise.reject(apiError);
      },
    );
  }

  /* ---------- Helpers ---------- */

  private createParams(params?: RequestParams) {
    if (!params) return undefined;

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    });

    return searchParams;
  }

  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client(config);
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>,
      isSuccess: response.status >= 200 && response.status < 300,
      message: response.statusText,
      metadata: response.headers["x-metadata"] as unknown,
    };
  }

  /* ---------- HTTP Methods ---------- */

  get<T>(url: string, params?: RequestParams) {
    return this.request<T>({
      method: "GET",
      url,
      params: this.createParams(params),
    });
  }

  post<T, D = unknown>(url: string, data?: D) {
    return this.request<T>({
      method: "POST",
      url,
      data,
    });
  }

  put<T, D = unknown>(url: string, data?: D) {
    return this.request<T>({
      method: "PUT",
      url,
      data,
    });
  }

  patch<T, D = unknown>(url: string, data?: D) {
    return this.request<T>({
      method: "PATCH",
      url,
      data,
    });
  }

  delete<T>(url: string, data?: unknown) {
    return this.request<T>({
      method: "DELETE",
      url,
      data,
    });
  }

  upload<T>(
    url: string,
    files: File | File[],
    fieldName = "file",
    extra?: Record<string, string | number | boolean>,
    onProgress?: (percent: number) => void,
  ) {
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((f) => formData.append(fieldName, f));
    } else {
      formData.append(fieldName, files);
    }

    if (extra) {
      Object.entries(extra).forEach(([k, v]) => formData.append(k, String(v)));
    }

    return this.request<T>({
      method: "POST",
      url,
      data: formData,
      onUploadProgress: (e) => {
        if (!onProgress || !e.total) return;
        onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
  }
}

/* =========================
   Default instance
========================= */

const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL_BACKEND || "", 600000);

export default apiService;
