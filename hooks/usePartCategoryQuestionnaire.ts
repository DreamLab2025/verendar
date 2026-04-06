import { useQuery } from "@tanstack/react-query";
import {
  PartCategoryQuestionnaireService,
  type PartQuestionConfig,
} from "@/lib/api/services/fetchPartCategoryQuestionnaire";

export function usePartCategoryQuestionnaire(partCategorySlug: string | undefined, enabled = true) {
  const slug = partCategorySlug?.trim() ?? "";

  const query = useQuery<PartQuestionConfig, Error>({
    queryKey: ["parts", "categories", "questionnaire", slug.toUpperCase()],
    queryFn: () => PartCategoryQuestionnaireService.get(slug),
    enabled: enabled && slug.length > 0,
    staleTime: 5 * 60_000,
  });

  return {
    ...query,
    config: query.data,
    hasQuestions: !!query.data && query.data.questions.length > 0,
  };
}
