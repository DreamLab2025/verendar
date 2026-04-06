"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import GarageService, {
  garageBranchDetailToGarageBranchMeDto,
  type CreateGarageBranchPayload,
  type CreateGaragePayload,
  type CreateGarageBundlePayload,
  type CreateGarageProductPayload,
  type CreateGarageServicePayload,
  type GarageProductListResponse,
  type GarageBundleListResponse,
  type GarageServiceListResponse,
  type UpdateGarageBundlePayload,
  type GarageBranchDto,
  type GarageBranchMapItemDto,
  type GarageBranchMeDto,
  type GarageCatalogItemDto,
  type GarageDto,
  type GarageBranchesMapsQueryParams,
  type GarageBranchesQueryParams,
  type GaragesQueryParams,
  type PatchGarageBranchStatusPayload,
  type PatchGarageStatusPayload,
  type UpdateGarageBranchPayload,
  type UpdateGaragePayload,
} from "@/lib/api/services/fetchGarage";
import { readAuthRolesFromCookies } from "@/lib/auth/read-auth-cookie-user";
import { GARAGE_PORTAL_ROLE_OWNER } from "@/lib/auth/garage-portal-roles";
import type { ApiResponse } from "@/types/api";
import { flattenInfinitePages, useInfinityScroll } from "@/hooks/useInfinityScroll";
import { toast } from "sonner";

function toApiResponse(body: Awaited<ReturnType<typeof GarageService.getGarages>>): ApiResponse<GarageDto[]> {
  return {
    isSuccess: body.isSuccess,
    message: body.message ?? "",
    data: body.data,
    metadata: body.metadata ?? undefined,
  };
}

function toBranchesApiResponse(
  body: Awaited<ReturnType<typeof GarageService.getGarageBranches>>,
): ApiResponse<GarageBranchDto[]> {
  return {
    isSuccess: body.isSuccess,
    message: body.message ?? "",
    data: body.data,
    metadata: body.metadata ?? undefined,
  };
}

function toBranchesMapsApiResponse(
  body: Awaited<ReturnType<typeof GarageService.getGarageBranchesMaps>>,
): ApiResponse<GarageBranchMapItemDto[]> {
  return {
    isSuccess: body.isSuccess,
    message: body.message ?? "",
    data: body.data,
    metadata: body.metadata ?? undefined,
  };
}

export function useGaragesQuery(params: GaragesQueryParams, enabled = true) {
  return useQuery({
    queryKey: ["garages", "list", params],
    queryFn: () => GarageService.getGarages(params),
    enabled,
  });
}

export function useMyGarageQuery(enabled = true) {
  return useQuery({
    queryKey: ["garages", "me"],
    queryFn: () => GarageService.getMyGarage(),
    enabled,
  });
}

export function useGarageByIdQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["garages", "detail", id],
    queryFn: () => GarageService.getGarageById(id!),
    enabled: Boolean(id) && enabled,
  });
}

export function useGarageBusinessLookupQuery(taxCode: string | undefined, enabled = true) {
  const trimmed = taxCode?.trim() ?? "";
  return useQuery({
    queryKey: ["garages", "business-lookup", trimmed],
    queryFn: () => GarageService.lookupBusinessByTaxCode(trimmed),
    enabled: trimmed.length > 0 && enabled,
  });
}

export function useGarageBranchesQuery(
  garageId: string | undefined,
  params: GarageBranchesQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["garages", garageId, "branches", params],
    queryFn: () => GarageService.getGarageBranches(garageId!, params),
    enabled: Boolean(garageId) && enabled,
  });
}

export function useGarageBranchesMapsQuery(params: GarageBranchesMapsQueryParams, enabled = true) {
  return useQuery({
    queryKey: ["garages", "branches", "maps", params],
    queryFn: () => GarageService.getGarageBranchesMaps(params),
    enabled,
  });
}

export function useGarageBranchByIdQuery(
  garageId: string | undefined,
  branchId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ["garages", garageId, "branches", "detail", branchId],
    queryFn: () => GarageService.getGarageBranchById(garageId!, branchId!),
    enabled: Boolean(garageId) && Boolean(branchId) && enabled,
  });
}

/**
 * GET /api/v1/garages/branches/me — chi nhánh của user hiện tại.
 * Cần UI infinite scroll: dùng `useInfinityScroll` từ `@/hooks/useInfinityScroll` + `GarageService.getMyGarageBranch` (API trả một object, không phân trang).
 */
export function useMyGarageBranchQuery(enabled = true) {
  return useQuery({
    queryKey: ["garages", "branches", "me"],
    queryFn: () => GarageService.getMyGarageBranch(),
    enabled,
  });
}

function pickBranchMeForProfile(
  data: GarageBranchMeDto | undefined,
  garageId: string,
  branchId: string,
): GarageBranchMeDto | null {
  if (!data) return null;
  if (data.id !== branchId || data.garageId !== garageId) return null;
  return data;
}

/** Hồ sơ chi nhánh: GarageOwner → GET branch theo id; không thì /branches/me + khớp URL. */
export function useBranchProfileBranch(garageId: string, branchId: string) {
  const isGarageOwner = useMemo(() => readAuthRolesFromCookies().includes(GARAGE_PORTAL_ROLE_OWNER), []);
  const enabled = Boolean(garageId && branchId);

  const byIdQuery = useGarageBranchByIdQuery(garageId, branchId, enabled && isGarageOwner);
  const meQuery = useMyGarageBranchQuery(enabled && !isGarageOwner);

  return useMemo(() => {
    if (isGarageOwner) {
      const res = byIdQuery.data;
      const branchMe: GarageBranchMeDto | null =
        res?.isSuccess && res.data ? garageBranchDetailToGarageBranchMeDto(res.data) : null;
      return {
        isGarageOwner: true,
        isPending: byIdQuery.isPending,
        isError: byIdQuery.isError,
        res,
        branchMe,
      };
    }

    const res = meQuery.data;
    const branchMe = res?.isSuccess && res.data ? pickBranchMeForProfile(res.data, garageId, branchId) : null;
    return {
      isGarageOwner: false,
      isPending: meQuery.isPending,
      isError: meQuery.isError,
      res,
      branchMe,
    };
  }, [
    isGarageOwner,
    byIdQuery.data,
    byIdQuery.isPending,
    byIdQuery.isError,
    meQuery.data,
    meQuery.isPending,
    meQuery.isError,
    garageId,
    branchId,
  ]);
}

export function useGarageProductByIdQuery(
  id: string | undefined,
  enabled = true,
  /** Mặc định 60s; dialog sửa có thể truyền `0` để luôn coi stale và refetch khi mở. */
  staleTime: number = 60_000,
) {
  return useQuery({
    queryKey: ["garage-products", "detail", id],
    queryFn: async () => {
      const body = await GarageService.getGarageProductById(id!);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tải được chi tiết sản phẩm.");
      }
      return body.data;
    },
    enabled: Boolean(id) && enabled,
    staleTime,
  });
}

export function useGarageServiceByIdQuery(
  id: string | undefined,
  enabled = true,
  /** Mặc định 60s; dialog sửa có thể truyền `0` để luôn coi stale và refetch khi mở. */
  staleTime: number = 60_000,
) {
  return useQuery({
    queryKey: ["garage-services", "detail", id],
    queryFn: async () => {
      const body = await GarageService.getGarageServiceById(id!);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tải được chi tiết dịch vụ.");
      }
      return body.data;
    },
    enabled: Boolean(id) && enabled,
    staleTime,
  });
}

export function useGarageBundleByIdQuery(
  id: string | undefined,
  enabled = true,
  staleTime: number = 60_000,
) {
  return useQuery({
    queryKey: ["garage-bundles", "detail", id],
    queryFn: async () => {
      const body = await GarageService.getGarageBundleById(id!);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tải được chi tiết combo.");
      }
      return body.data;
    },
    enabled: Boolean(id) && enabled,
    staleTime,
  });
}

const GARAGE_BRANCH_CATALOG_LIST_PAGE_SIZE = 100;

export type GarageBranchCatalogListOptions = {
  pageSize?: number;
  activeOnly?: boolean;
  enabled?: boolean;
  /** Lọc theo danh mục dịch vụ — gửi `ServiceCategoryId` lên API khi có. */
  serviceCategoryId?: string | null;
};

function branchCatalogListParams(
  branchId: string,
  pageSize: number,
  activeOnly: boolean,
  serviceCategoryId: string | null | undefined,
) {
  return {
    branchId,
    activeOnly,
    PageNumber: 1,
    PageSize: pageSize,
    ...(serviceCategoryId ? { ServiceCategoryId: serviceCategoryId } : {}),
  };
}

export function useServiceCategoriesQuery(enabled = true) {
  return useQuery({
    queryKey: ["service-categories", "list"],
    queryFn: async () => {
      const body = await GarageService.getServiceCategories();
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tải được danh mục dịch vụ.");
      }
      return body;
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useGarageBundlesByBranchQuery(
  branchId: string | undefined,
  options?: GarageBranchCatalogListOptions,
) {
  const pageSize = options?.pageSize ?? GARAGE_BRANCH_CATALOG_LIST_PAGE_SIZE;
  const activeOnly = options?.activeOnly ?? true;
  const enabled = options?.enabled ?? true;
  const serviceCategoryId = options?.serviceCategoryId ?? null;

  return useQuery({
    queryKey: ["garage-bundles", "branch", branchId, pageSize, activeOnly, serviceCategoryId],
    queryFn: async () => {
      const body = await GarageService.getGarageBundlesByBranch(
        branchCatalogListParams(branchId!, pageSize, activeOnly, serviceCategoryId),
      );
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tải được danh sách combo.");
      }
      return body;
    },
    enabled: Boolean(branchId) && enabled,
    staleTime: 60_000,
  });
}

export function useGarageProductsByBranchQuery(
  branchId: string | undefined,
  options?: GarageBranchCatalogListOptions,
) {
  const pageSize = options?.pageSize ?? GARAGE_BRANCH_CATALOG_LIST_PAGE_SIZE;
  const activeOnly = options?.activeOnly ?? true;
  const enabled = options?.enabled ?? true;
  const serviceCategoryId = options?.serviceCategoryId ?? null;

  return useQuery({
    queryKey: ["garage-products", "branch", branchId, pageSize, activeOnly, serviceCategoryId],
    queryFn: async () => {
      const body = await GarageService.getGarageProductsByBranch(
        branchCatalogListParams(branchId!, pageSize, activeOnly, serviceCategoryId),
      );
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tải được danh sách phụ tùng.");
      }
      return body;
    },
    enabled: Boolean(branchId) && enabled,
    staleTime: 60_000,
  });
}

export function useGarageServicesByBranchQuery(
  branchId: string | undefined,
  options?: GarageBranchCatalogListOptions,
) {
  const pageSize = options?.pageSize ?? GARAGE_BRANCH_CATALOG_LIST_PAGE_SIZE;
  const activeOnly = options?.activeOnly ?? true;
  const enabled = options?.enabled ?? true;
  const serviceCategoryId = options?.serviceCategoryId ?? null;

  return useQuery({
    queryKey: ["garage-services", "branch", branchId, pageSize, activeOnly, serviceCategoryId],
    queryFn: async () => {
      const body = await GarageService.getGarageServicesByBranch(
        branchCatalogListParams(branchId!, pageSize, activeOnly, serviceCategoryId),
      );
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tải được danh sách dịch vụ.");
      }
      return body;
    },
    enabled: Boolean(branchId) && enabled,
    staleTime: 60_000,
  });
}

export function useCreateGarageService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ branchId, payload }: { branchId: string; payload: CreateGarageServicePayload }) => {
      const body = await GarageService.createGarageService(branchId, payload);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tạo được dịch vụ.");
      }
      return body;
    },
    onSuccess: (data, { branchId }) => {
      void queryClient.invalidateQueries({ queryKey: ["garage-services", "branch", branchId] });
      toast.success(data.message || "Đã tạo dịch vụ.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo dịch vụ thất bại");
    },
  });
}

export function useCreateGarageProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ branchId, payload }: { branchId: string; payload: CreateGarageProductPayload }) => {
      const body = await GarageService.createGarageProduct(branchId, payload);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tạo được phụ tùng.");
      }
      return body;
    },
    onSuccess: (data, { branchId }) => {
      void queryClient.invalidateQueries({ queryKey: ["garage-products", "branch", branchId] });
      toast.success(data.message || "Đã tạo phụ tùng.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo phụ tùng thất bại");
    },
  });
}

export function useUpdateGarageProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      branchId: string;
      payload: CreateGarageProductPayload;
    }) => {
      const body = await GarageService.updateGarageProduct(id, payload);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không cập nhật được phụ tùng.");
      }
      return body;
    },
    onSuccess: (data, { id, branchId }) => {
      const updated = data.data;
      queryClient.setQueriesData<GarageProductListResponse>(
        {
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "garage-products" &&
            q.queryKey[1] === "branch" &&
            q.queryKey[2] === branchId,
        },
        (old) => {
          if (!old?.data || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.map((row) =>
              row.id === id
                ? {
                    ...row,
                    name: updated.name,
                    description: updated.description,
                    materialPrice: updated.materialPrice,
                    estimatedDurationMinutes: updated.estimatedDurationMinutes,
                    imageUrl: updated.imageUrl,
                    partCategoryId: updated.partCategoryId,
                    hasInstallationOption: updated.installationService != null,
                    status: updated.status,
                  }
                : row,
            ),
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["garage-products", "detail", id] });
      void queryClient.invalidateQueries({ queryKey: ["garage-products", "branch", branchId] });
      toast.success(data.message || "Đã cập nhật phụ tùng.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật phụ tùng thất bại");
    },
  });
}

export function useUpdateGarageService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      branchId: string;
      payload: CreateGarageServicePayload;
    }) => {
      const body = await GarageService.updateGarageService(id, payload);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không cập nhật được dịch vụ.");
      }
      return body;
    },
    onSuccess: (data, { id, branchId }) => {
      const updated = data.data;
      queryClient.setQueriesData<GarageServiceListResponse>(
        {
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "garage-services" &&
            q.queryKey[1] === "branch" &&
            q.queryKey[2] === branchId,
        },
        (old) => {
          if (!old?.data || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.map((row) =>
              row.id === id
                ? {
                    ...row,
                    name: updated.name,
                    description: updated.description,
                    laborPrice: updated.laborPrice,
                    serviceCategoryId: updated.serviceCategoryId,
                    serviceCategoryName: updated.serviceCategoryName,
                    estimatedDurationMinutes: updated.estimatedDurationMinutes,
                    imageUrl: updated.imageUrl,
                    status: updated.status,
                  }
                : row,
            ),
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["garage-services", "detail", id] });
      void queryClient.invalidateQueries({ queryKey: ["garage-services", "branch", branchId] });
      toast.success(data.message || "Đã cập nhật dịch vụ.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật dịch vụ thất bại");
    },
  });
}

export function useDeleteGarageService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; branchId: string }) => {
      const body = await GarageService.deleteGarageService(id);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không xóa được dịch vụ.");
      }
      return body;
    },
    onSuccess: (data, { id, branchId }) => {
      void queryClient.removeQueries({ queryKey: ["garage-services", "detail", id] });
      void queryClient.invalidateQueries({ queryKey: ["garage-services", "branch", branchId] });
      toast.success(data.message || "Đã xóa dịch vụ.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa dịch vụ thất bại");
    },
  });
}

export function useDeleteGarageProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; branchId: string }) => {
      const body = await GarageService.deleteGarageProduct(id);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không xóa được phụ tùng.");
      }
      return body;
    },
    onSuccess: (data, { id, branchId }) => {
      void queryClient.removeQueries({ queryKey: ["garage-products", "detail", id] });
      void queryClient.invalidateQueries({ queryKey: ["garage-products", "branch", branchId] });
      toast.success(data.message || "Đã xóa phụ tùng.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa phụ tùng thất bại");
    },
  });
}

export function useUpdateGarageBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      branchId: string;
      payload: UpdateGarageBundlePayload;
    }) => {
      const body = await GarageService.updateGarageBundle(id, payload);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không cập nhật được combo.");
      }
      return body;
    },
    onSuccess: (data, { id, branchId }) => {
      const updated = data.data;
      queryClient.setQueriesData<GarageBundleListResponse>(
        {
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "garage-bundles" &&
            q.queryKey[1] === "branch" &&
            q.queryKey[2] === branchId,
        },
        (old) => {
          if (!old?.data || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.map((row) =>
              row.id === id
                ? {
                    ...row,
                    name: updated.name,
                    description: updated.description,
                    imageUrl: updated.imageUrl,
                    discountAmount: updated.discountAmount,
                    discountPercent: updated.discountPercent,
                    subTotal: updated.subTotal,
                    finalPrice: updated.finalPrice,
                    currency: updated.currency,
                    status: updated.status,
                    itemCount: updated.items?.length ?? row.itemCount,
                  }
                : row,
            ),
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["garage-bundles", "detail", id] });
      void queryClient.invalidateQueries({ queryKey: ["garage-bundles", "branch", branchId] });
      toast.success(data.message || "Đã cập nhật combo.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật combo thất bại");
    },
  });
}

export function useDeleteGarageBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; branchId: string }) => {
      const body = await GarageService.deleteGarageBundle(id);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không xóa được combo.");
      }
      return body;
    },
    onSuccess: (data, { id, branchId }) => {
      void queryClient.removeQueries({ queryKey: ["garage-bundles", "detail", id] });
      void queryClient.invalidateQueries({ queryKey: ["garage-bundles", "branch", branchId] });
      toast.success(data.message || "Đã xóa combo.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa combo thất bại");
    },
  });
}

export function useCreateGarageBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ branchId, payload }: { branchId: string; payload: CreateGarageBundlePayload }) => {
      const body = await GarageService.createGarageBundle(branchId, payload);
      if (!body.isSuccess) {
        throw new Error(body.message || "Không tạo được combo.");
      }
      return body;
    },
    onSuccess: (data, { branchId }) => {
      void queryClient.invalidateQueries({ queryKey: ["garage-bundles", "branch", branchId] });
      toast.success(data.message || "Đã tạo combo.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo combo thất bại");
    },
  });
}

export type GarageCatalogTypeFilter = "service" | "product" | "bundle";

/** Giá trị query `Type` gửi lên API (BE Garage dùng PascalCase giống field `type` trong JSON). */
const GARAGE_CATALOG_TYPE_API: Record<GarageCatalogTypeFilter, "Service" | "Product" | "Bundle"> = {
  service: "Service",
  product: "Product",
  bundle: "Bundle",
};

export type GarageCatalogInfiniteFilters = {
  Type?: GarageCatalogTypeFilter;
};

export function useGarageCatalogInfinite(
  branchId: string | undefined,
  filters: GarageCatalogInfiniteFilters = {},
  options?: { pageSize?: number; enabled?: boolean },
) {
  const pageSize = options?.pageSize ?? 12;
  const enabled = options?.enabled ?? true;

  const infinite = useInfinityScroll<GarageCatalogItemDto, GarageCatalogInfiniteFilters>({
    queryKey: ["garage-catalog", branchId],
    fetchPage: async ({ pageNumber, pageSize: size, ...rest }) => {
      const typeParam = rest.Type ? GARAGE_CATALOG_TYPE_API[rest.Type] : undefined;
      const body = await GarageService.getGarageCatalog(branchId!, {
        PageNumber: pageNumber,
        PageSize: size,
        ...(typeParam ? { Type: typeParam } : {}),
      });
      return {
        isSuccess: body.isSuccess,
        message: body.message ?? "",
        data: body.data,
        metadata: body.metadata ?? undefined,
      };
    },
    filters,
    pageSize,
    enabled: Boolean(branchId) && enabled,
    /** 1 phút vẫn “fresh” → quay lại tab cũ không refetch; cache giữ 30 phút để không gọi lại khi lưới qua các tab. */
    staleTime: 60_000,
    gcTime: 1000 * 60 * 30,
    /** Đã có nhiều trang → remount/refetch mặc định gọi lại *từng trang* → bùng request. */
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const items = useMemo(() => flattenInfinitePages(infinite.data?.pages), [infinite.data?.pages]);

  return {
    ...infinite,
    items,
  };
}

export type GaragesInfiniteFilters = Pick<GaragesQueryParams, "status" | "isDescending">;

export type GarageBranchesInfiniteFilters = Pick<GarageBranchesQueryParams, "isDescending">;

export type GarageBranchesMapsInfiniteFilters = Pick<
  GarageBranchesMapsQueryParams,
  "Address" | "Lat" | "Lng" | "RadiusKm" | "isDescending"
>;

export function useGaragesInfinite(
  filters: GaragesInfiniteFilters = {},
  options?: { pageSize?: number; enabled?: boolean },
) {
  const pageSize = options?.pageSize ?? 20;
  const enabled = options?.enabled ?? true;

  const infinite = useInfinityScroll<GarageDto, GaragesInfiniteFilters>({
    queryKey: ["garages", "infinite"],
    fetchPage: async (params) => toApiResponse(await GarageService.getGarages(params)),
    filters,
    pageSize,
    enabled,
  });

  const garages = useMemo(() => flattenInfinitePages(infinite.data?.pages), [infinite.data?.pages]);

  return {
    ...infinite,
    garages,
  };
}

export function useGarageBranchesInfinite(
  garageId: string | undefined,
  filters: GarageBranchesInfiniteFilters = {},
  options?: { pageSize?: number; enabled?: boolean },
) {
  const pageSize = options?.pageSize ?? 20;
  const enabled = options?.enabled ?? true;

  const infinite = useInfinityScroll<GarageBranchDto, GarageBranchesInfiniteFilters>({
    queryKey: ["garages", garageId, "branches", "infinite"],
    fetchPage: async (params) =>
      toBranchesApiResponse(await GarageService.getGarageBranches(garageId!, params)),
    filters,
    pageSize,
    enabled: Boolean(garageId) && enabled,
  });

  const branches = useMemo(() => flattenInfinitePages(infinite.data?.pages), [infinite.data?.pages]);

  return {
    ...infinite,
    branches,
  };
}

export function useGarageBranchesMapsInfinite(
  filters: GarageBranchesMapsInfiniteFilters = {},
  options?: { pageSize?: number; enabled?: boolean },
) {
  const pageSize = options?.pageSize ?? 20;
  const enabled = options?.enabled ?? true;

  const infinite = useInfinityScroll<GarageBranchMapItemDto, GarageBranchesMapsInfiniteFilters>({
    queryKey: ["garages", "branches", "maps", "infinite"],
    fetchPage: async ({ pageNumber, pageSize: size, ...mapFilters }) =>
      toBranchesMapsApiResponse(
        await GarageService.getGarageBranchesMaps({
          ...mapFilters,
          PageNumber: pageNumber,
          PageSize: size,
        }),
      ),
    filters,
    pageSize,
    enabled,
  });

  const branches = useMemo(() => flattenInfinitePages(infinite.data?.pages), [infinite.data?.pages]);

  return {
    ...infinite,
    branches,
  };
}

export function useCreateGarageBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ garageId, payload }: { garageId: string; payload: CreateGarageBranchPayload }) =>
      GarageService.createGarageBranch(garageId, payload),
    onSuccess: (data, { garageId }) => {
      void queryClient.invalidateQueries({ queryKey: ["garages", garageId, "branches"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "detail", garageId] });
      toast.success(data.message || "Tạo chi nhánh thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Tạo chi nhánh thất bại");
    },
  });
}

export function useUpdateGarageBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      garageId,
      branchId,
      payload,
    }: {
      garageId: string;
      branchId: string;
      payload: UpdateGarageBranchPayload;
    }) => GarageService.updateGarageBranch(garageId, branchId, payload),
    onSuccess: (data, { garageId, branchId }) => {
      void queryClient.invalidateQueries({ queryKey: ["garages", garageId, "branches"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", garageId, "branches", "detail", branchId] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "detail", garageId] });
      toast.success(data.message || "Cập nhật chi nhánh thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Cập nhật chi nhánh thất bại");
    },
  });
}

export function useDeleteGarageBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ garageId, branchId }: { garageId: string; branchId: string }) =>
      GarageService.deleteGarageBranch(garageId, branchId),
    onSuccess: (data, { garageId, branchId }) => {
      queryClient.removeQueries({ queryKey: ["garages", garageId, "branches", "detail", branchId] });
      void queryClient.invalidateQueries({ queryKey: ["garages", garageId, "branches"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "detail", garageId] });
      toast.success(data.message || "Xóa chi nhánh thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Xóa chi nhánh thất bại");
    },
  });
}

export function usePatchGarageBranchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      garageId,
      branchId,
      payload,
    }: {
      garageId: string;
      branchId: string;
      payload: PatchGarageBranchStatusPayload;
    }) => GarageService.patchGarageBranchStatus(garageId, branchId, payload),
    onSuccess: (data, { garageId, branchId }) => {
      void queryClient.invalidateQueries({ queryKey: ["garages", garageId, "branches"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", garageId, "branches", "detail", branchId] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "detail", garageId] });
      toast.success(data.message || "Cập nhật trạng thái chi nhánh thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Cập nhật trạng thái chi nhánh thất bại");
    },
  });
}

export function useCreateGarage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGaragePayload) => GarageService.createGarage(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["garages"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "me"] });
      if (data.data?.id) {
        void queryClient.invalidateQueries({ queryKey: ["garages", "detail", data.data.id] });
      }
      toast.success(data.message || "Tạo garage thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Tạo garage thất bại");
    },
  });
}

export function useUpdateGarage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGaragePayload }) =>
      GarageService.updateGarage(id, payload),
    onSuccess: (data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["garages"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "detail", id] });
      toast.success(data.message || "Cập nhật garage thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Cập nhật garage thất bại");
    },
  });
}

export function usePatchGarageStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PatchGarageStatusPayload }) =>
      GarageService.patchGarageStatus(id, payload),
    onSuccess: (data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["garages"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "detail", id] });
      toast.success(data.message || "Cập nhật trạng thái garage thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Cập nhật trạng thái garage thất bại");
    },
  });
}

export function useResubmitGarage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => GarageService.resubmitGarage(id),
    onSuccess: (data, id) => {
      void queryClient.invalidateQueries({ queryKey: ["garages"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["garages", "detail", id] });
      toast.success(data.message || "Gửi lại hồ sơ garage thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Gửi lại hồ sơ garage thất bại");
    },
  });
}
