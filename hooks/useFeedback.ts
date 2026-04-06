import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FeedbackService, FeedbackQueryParams, FeedbackStatus } from "@/lib/api/services/fetchFeedback";

export function useFeedbacks(params: FeedbackQueryParams, enabled: boolean = true) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["feedbacks", "list", params],
    queryFn: () => FeedbackService.getFeedbacks(params),
    enabled,
    select: (data) => ({
      feedbacks: data.data ?? [],
      metadata: data.metadata,
      message: data.message,
      isSuccess: data.isSuccess,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,

    feedbacks: data?.feedbacks ?? [],
    metadata: data?.metadata,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

export function useFeedbackById(id?: string, enabled: boolean = true) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["feedbacks", "detail", id],
    queryFn: () => FeedbackService.getFeedbackById(id as string),
    enabled: !!id && enabled,
    select: (data) => ({
      feedback: data.data,
      message: data.message,
      isSuccess: data.isSuccess,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,

    feedback: data?.feedback,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FeedbackService.createFeedback,
    onSuccess: () => {
      // Refresh list after creation if needed, though users often just see a success message
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
}

export function useUpdateFeedbackStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackStatus }) =>
      FeedbackService.updateFeedbackStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      queryClient.invalidateQueries({ queryKey: ["feedbacks", "detail", id] });
    },
  });
}
