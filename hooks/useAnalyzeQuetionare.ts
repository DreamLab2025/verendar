import {
  AnalyzeQuestionnaireRequest,
  AnalyzeQuestionnaireResponse,
  analyzeQuestionnaireService,
} from "@/lib/api/services/fetchAnalyzeQuestionare";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAnalyzeQuestionnaire() {
  const { mutate, mutateAsync, data, isPending, isError, error, reset } = useMutation({
    mutationKey: ["analyze-questionnaire"],
    mutationFn: (payload: AnalyzeQuestionnaireRequest) => analyzeQuestionnaireService.analyzeQuestionnaire(payload),
    onSuccess: (data: AnalyzeQuestionnaireResponse) => {
      toast.success(data.message || "Phân tích thành công!");
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Phân tích thất bại!");
    },
  });

  return {
    analyze: mutate,
    analyzeAsync: mutateAsync,
    reset,
    isAnalyzing: isPending,
    isError,
    error,
    data: data?.data,
    recommendations: data?.data?.recommendations ?? [],
    warnings: data?.data?.warnings ?? [],
    isSuccess: data?.isSuccess,
    message: data?.message,
  };
}
