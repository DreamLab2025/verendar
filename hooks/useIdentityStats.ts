import { useQuery } from "@tanstack/react-query";
import { 
  IdentityStatsService, 
  StatsQueryParams, 
  ChartQueryParams 
} from "@/lib/api/services/fetchIdentityStats";

export function useIdentityOverviewStats(params: StatsQueryParams, enabled: boolean = true) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["identity", "stats", "overview", JSON.stringify(params)],
    queryFn: () => IdentityStatsService.getOverviewStats(params),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
    select: (data) => ({
      stats: data.data,
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

    stats: data?.stats,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}

export function useUserGrowthChart(params: ChartQueryParams, enabled: boolean = true) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["identity", "charts", "user-growth", JSON.stringify(params)],
    queryFn: () => IdentityStatsService.getUserGrowthChart(params),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
    select: (data) => ({
      chartData: data.data,
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

    chartData: data?.chartData,
    message: data?.message,
    isSuccess: data?.isSuccess,
  };
}
