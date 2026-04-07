import type { ApiError } from "./apiService";

/** Lỗi từ interceptor `ApiService` khi HTTP 404. */
export function isApiNotFoundError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const status = (error as Partial<ApiError>).status;
  return status === 404;
}
