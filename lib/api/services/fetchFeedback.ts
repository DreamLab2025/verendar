import api8080Service from "@/lib/api/api8080Service";
import { PaginationMetadata, RequestParams } from "../apiService";


/**
 * Feedback API Service
 * Base path: /api/v1/feedback
 */

// ===== Enums =====

export enum FeedbackCategory {
  General = 0,
  Bug = 1,
  Feature = 2,
  UX = 3,
  Performance = 4,
  Other = 5,
}

export enum FeedbackStatus {
  Pending = 0,
  Reviewed = 1,
  Resolved = 2,
}

// ===== Types =====

export interface Feedback {
  id: string;
  userId: string;
  category: FeedbackCategory;
  subject: string;
  content: string;
  rating: number | null;
  contactEmail: string | null;
  status: string;
  createdAt: string;
}

export interface FeedbackListResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: Feedback[];
  metadata: PaginationMetadata;
}

export interface FeedbackSingleResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: Feedback;
}

// Params cho GET danh sách (Admin)
export interface FeedbackQueryParams extends RequestParams {
  pageNumber: number;
  pageSize: number;
}


// ===== Service (fetch functions) =====

export const FeedbackService = {
  /**
   * 1. Gửi feedback (Mọi user đã đăng nhập)
   * POST /api/v1/feedback
   */
  createFeedback: async (payload: {
    category: FeedbackCategory;
    subject: string;
    content: string;
    rating?: number;
    contactEmail?: string;
  }) => {
    const response = await api8080Service.post<FeedbackSingleResponse>("/api/v1/feedback", payload);
    return response.data;
  },

  /**
   * 2. Lấy danh sách feedback (Admin)
   * GET /api/v1/feedback
   */
  getFeedbacks: async (params: FeedbackQueryParams) => {
    const response = await api8080Service.get<FeedbackListResponse>("/api/v1/feedback", params);
    return response.data;
  },

  /**
   * 3. Chi tiết feedback (Admin)
   * GET /api/v1/feedback/{id}
   */
  getFeedbackById: async (id: string) => {
    const response = await api8080Service.get<FeedbackSingleResponse>(`/api/v1/feedback/${id}`);
    return response.data;
  },

  /**
   * 4. Cập nhật trạng thái feedback (Admin)
   * PATCH /api/v1/feedback/{id}/status
   */
  updateFeedbackStatus: async (id: string, status: FeedbackStatus) => {
    const response = await api8080Service.patch<FeedbackSingleResponse>(`/api/v1/feedback/${id}/status`, { status });
    return response.data;
  },
};
