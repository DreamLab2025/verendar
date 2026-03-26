import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { store } from "@/lib/redux/store";

class ApiService {
  private client: AxiosInstance;

  constructor(baseURL: string, timeout = 60000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: { "Content-Type": "application/json" },
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      const token = store.getState().auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
      return config;
    });
  }

  async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.request<T>(config);
  }

  async get<T>(url: string, params?: Record<string, unknown>) {
    return this.request<T>({ method: "GET", url, params });
  }

  async post<T, D = unknown>(url: string, data?: D) {
    return this.request<T>({ method: "POST", url, data });
  }

  async put<T, D = unknown>(url: string, data?: D) {
    return this.request<T>({ method: "PUT", url, data });
  }

  async patch<T, D = unknown>(url: string, data?: D) {
    return this.request<T>({ method: "PATCH", url, data });
  }

  async delete<T>(url: string) {
    return this.request<T>({ method: "DELETE", url });
  }
}

const apiService = new ApiService(
  process.env.NEXT_PUBLIC_API_URL_BACKEND || "http://localhost:8080/"
);

export default apiService;
