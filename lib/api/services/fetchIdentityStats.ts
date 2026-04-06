import { ApiResponse } from "@/types/api";
import api8080Service from "../api8080Service";
import { RequestParams } from "../apiService";

/* ===================== DATA TYPES ===================== */

export interface IdentityOverviewStats {
  users: {
    total: number;
    emailVerified: number;
    byRole: {
      user: number;
      admin: number;
      garageOwner: number;
      mechanic: number;
      garageManager: number;
    };
  };
  feedback: {
    total: number;
    byStatus: {
      pending: number;
      reviewed: number;
      resolved: number;
    };
    byCategory: {
      general: number;
      bug: number;
      feature: number;
      ux: number;
      performance: number;
      other: number;
    };
    avgRating: number | null;
  };
}

export interface ChartPoint {
  period: string; // "YYYY-MM" hoặc "YYYY-MM-DD"
  value: number;
}

export interface ChartTimeline {
  groupBy: "day" | "month";
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD"
  points: ChartPoint[];
}

/* ===================== PARAM TYPES ===================== */

export interface StatsQueryParams extends RequestParams {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface ChartQueryParams extends StatsQueryParams {
  groupBy?: "day" | "month";
}

/* ===================== IDENTITY STATS APIs ===================== */

export const IdentityStatsService = {
  /**
   * 1. Overview Stats
   * GET /api/v1/identity/stats
   */
  getOverviewStats: async (params: StatsQueryParams) => {
    const response = await api8080Service.get<ApiResponse<IdentityOverviewStats>>(
      "/api/v1/identity/stats",
      params
    );
    return response.data;
  },

  /**
   * 2. User Growth Chart
   * GET /api/v1/identity/charts/user-growth
   */
  getUserGrowthChart: async (params: ChartQueryParams) => {
    const response = await api8080Service.get<ApiResponse<ChartTimeline>>(
      "/api/v1/identity/charts/user-growth",
      params
    );
    return response.data;
  },
};

export default IdentityStatsService;
