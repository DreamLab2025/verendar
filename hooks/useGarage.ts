"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import GarageService, {
  type CreateGarageBranchPayload,
  type CreateGaragePayload,
  type GarageBranchDto,
  type GarageBranchMapItemDto,
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

export function useGarageProductByIdQuery(id: string | undefined, enabled = true) {
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
    staleTime: 60_000,
  });
}

export function useGarageServiceByIdQuery(id: string | undefined, enabled = true) {
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
    staleTime: 60_000,
  });
}

export function useGarageBundleByIdQuery(id: string | undefined, enabled = true) {
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
    staleTime: 60_000,
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
