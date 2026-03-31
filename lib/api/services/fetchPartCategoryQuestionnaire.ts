import api8080Service from "../api8080Service";

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  group: string;
  groupName: string;
  question: string;
  aiQuestion: string;
  hint?: string | null;
  options: QuestionOption[];
  required: boolean;
}

export interface PartQuestionConfig {
  partCategoryCode: string;
  partCategoryName: string;
  questions: Question[];
}

export interface PartCategoryQuestionnaireApiResponse {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: PartQuestionConfig | null;
  metadata: unknown;
}

export const PartCategoryQuestionnaireService = {
  async get(partCategorySlug: string): Promise<PartQuestionConfig> {
    const slugForPath = partCategorySlug.trim().toUpperCase();
    const response = await api8080Service.get<PartCategoryQuestionnaireApiResponse>(
      `/api/v1/part-categories/${encodeURIComponent(slugForPath)}/questionnaire`,
    );
    const body = response.data;
    if (!body?.isSuccess || body.data == null) {
      throw new Error(body?.message || "Không tải được bộ câu hỏi");
    }
    return body.data;
  },
};
