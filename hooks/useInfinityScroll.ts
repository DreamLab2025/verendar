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
  gcTime = 0,
  refetchOnWindowFocus = false,
  errorMessage = "Khong the tai du lieu",
  mapItems,
}: UseInfinityScrollOptions<TItem, TFilters>) {
  const infiniteQuery = useInfiniteQuery({
    queryKey: [...queryKey, filters ?? {}, pageSize],
    initialPageParam: 1,
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
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
