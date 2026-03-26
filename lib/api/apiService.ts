import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { deleteCookie } from "cookies-next";

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
      Object.entries(errorData.errors).forEach(([field, messages]) => {
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
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }

      // Let browser set multipart boundary
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      (error: AxiosError<ApiErrorData>) => {
        if (error.response?.status === 401) {
          // Xử lý lỗi 401 (Unauthorized) - Xóa token và redirect đến login
          // Chỉ xử lý nếu đang ở client side và chưa redirect
          if (typeof window !== "undefined" && !ApiService.isRedirecting) {
            ApiService.isRedirecting = true;

            // Xóa token cookie
            deleteCookie("auth-token", { path: "/" });

            // Clear token trong service
            this.setAuthToken(null);

            // Redirect đến login
            window.location.href = "/login";

            // Return early để không throw error
            return Promise.reject(new Error("Unauthorized"));
          }
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
