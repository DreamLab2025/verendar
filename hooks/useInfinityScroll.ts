import type { QueryKey } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, type UIEvent } from "react";

import type { RequestParams, PaginationMetadata } from "@/lib/api/apiService";
import type { ApiResponse } from "@/types/api";

export interface InfinitePageResult<TItem> {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: TItem[];
}

function asPaginationMetadata(metadata: unknown): Partial<PaginationMetadata> | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  return metadata as Partial<PaginationMetadata>;
}

/** Tránh hai object filter cùng nội dung nhưng khác reference → queryKey khác / refetch oan. */
function stableFiltersKey(filters: RequestParams | undefined): string {
  if (filters == null || Object.keys(filters).length === 0) return "{}";
  const keys = Object.keys(filters).sort();
  const sorted: Record<string, unknown> = {};
  for (const k of keys) {
    const v = filters[k];
    if (v !== undefined && v !== null) sorted[k] = v;
  }
  return JSON.stringify(sorted);
}

interface UseInfinityScrollOptions<TItem, TFilters extends RequestParams = RequestParams> {
  queryKey: QueryKey;
  fetchPage: (params: TFilters & { pageNumber: number; pageSize: number }) => Promise<ApiResponse<TItem[]>>;
  filters?: TFilters;
  pageSize?: number;
  scrollOffset?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  /** Mặc định true: infinite query refetch *mọi trang* khi mount lại → dễ bùng API. Catalog có thể tắt khi đã cache. */
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  errorMessage?: string;
  mapItems?: (response: ApiResponse<TItem[]>) => TItem[];
}

export function useInfinityScroll<TItem, TFilters extends RequestParams = RequestParams>({
  queryKey,
  fetchPage,
  filters,
  pageSize = 20,
  scrollOffset = 16,
  enabled = true,
  staleTime = 0,
  /** Giữ cache khi đổi filter/tab (observer = 0). Mặc định trước đây là 0 → mỗi lần đổi tab là mất cache và gọi API lại. */
  gcTime = 1000 * 60 * 5,
  refetchOnWindowFocus = false,
  refetchOnMount,
  refetchOnReconnect,
  errorMessage = "Khong the tai du lieu",
  mapItems,
}: UseInfinityScrollOptions<TItem, TFilters>) {
  const infiniteQuery = useInfiniteQuery({
    queryKey: [...queryKey, stableFiltersKey(filters), pageSize],
    initialPageParam: 1,
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnMount,
    refetchOnReconnect,
    queryFn: async ({ pageParam }): Promise<InfinitePageResult<TItem>> => {
      const response = await fetchPage({
        ...(filters ?? ({} as TFilters)),
        pageNumber: pageParam,
        pageSize,
      });

      if (!response.isSuccess) {
        throw new Error(response.message || errorMessage);
      }

      const meta = asPaginationMetadata(response.metadata);
      const pageIndex = meta?.pageNumber ?? pageParam;
      const totalPages = meta?.totalPages ?? pageIndex;
      const totalItems = meta?.totalItems ?? response.data.length;

      return {
        pageIndex,
        totalPages,
        totalItems,
        hasPreviousPage: meta?.hasPreviousPage ?? pageIndex > 1,
        hasNextPage: meta?.hasNextPage ?? pageIndex < totalPages,
        items: mapItems ? mapItems(response) : response.data,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.pageIndex + 1 : undefined),
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = infiniteQuery;

  const onScrollToLoadMore = useCallback(
    (event: UIEvent<HTMLElement>) => {
      const element = event.currentTarget;
      const reachedBottom =
        element.scrollTop + element.clientHeight >= element.scrollHeight - scrollOffset;

      if (reachedBottom && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage, scrollOffset],
  );

  return {
    ...infiniteQuery,
    onScrollToLoadMore,
  };
}

export const flattenInfinitePages = <TItem,>(pages?: InfinitePageResult<TItem>[]) =>
  pages?.flatMap((page) => page.items) ?? [];
