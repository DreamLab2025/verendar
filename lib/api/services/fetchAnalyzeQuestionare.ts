import api8080Service from "../api8080Service";

export interface QuestionAnswer {
  question: string;
  value: string;
}

export interface AnalyzeQuestionnaireRequest {
  userVehicleId: string;
  /** Slug loại phụ tùng, vd. `engine-oil` — BE tự lấy model từ xe */
  partCategorySlug: string;
  answers: QuestionAnswer[];
}

export interface AIRecommendation {
  partCategorySlug: string;
  /** Một số phiên bản API cũ */
  partCategoryCode?: string;
  lastReplacementOdometer: number;
  lastReplacementDate: string;
  predictedNextOdometer: number;
  predictedNextDate: string;
  reasoning: string;
  needsImmediateAttention: boolean;
  /** API mới */
  confidenceTier?: "low" | "medium" | "high";
  analysisPhase?: "baseline" | "personalized";
  earliestNextOdometer?: number;
  latestNextOdometer?: number;
  earliestNextDate?: string | null;
  latestNextDate?: string | null;
  rangeNarrowsWhen?: string[];
  /** API cũ — thay bằng confidenceTier */
  confidenceScore?: number;
}

export interface AIMetadata {
  model: string;
  totalTokens: number;
  totalCost: number;
  responseTimeMs: number;
}

export interface AnalyzeQuestionnaireData {
  recommendations: AIRecommendation[];
  warnings: string[];
  metadata: AIMetadata;
}
export interface AnalyzeQuestionnaireResponse {
  isSuccess: boolean;
  message: string;
  data: AnalyzeQuestionnaireData;
  metadata: string;
}
export const analyzeQuestionnaireService = {
  analyzeQuestionnaire: async (payload: AnalyzeQuestionnaireRequest) => {
    const response = await api8080Service.post<AnalyzeQuestionnaireResponse>(
      "/api/v1/ai/vehicle-questionnaire/analyze",
      payload,
    );
    return response.data;
  },
};
