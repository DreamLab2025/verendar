import api8080Service from "../api8080Service";

export interface QuestionAnswer {
  question: string;
  value: string;
}

export interface AnalyzeQuestionnaireRequest {
  userVehicleId: string;
  vehicleModelId: string;
  partCategoryCode: string;
  answers: QuestionAnswer[];
}

export interface AIRecommendation {
  partCategoryCode: string;
  lastReplacementOdometer: number;
  lastReplacementDate: string;
  predictedNextOdometer: number;
  predictedNextDate: string;
  confidenceScore: number;
  reasoning: string;
  needsImmediateAttention: boolean;
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
