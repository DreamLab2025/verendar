import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import { LocationService } from "@/lib/api/services/fetchLocation";

export const locationQueryKeys = {
  provinces: ["locations", "provinces"] as const,
  province: (code: string) => ["locations", "provinces", code] as const,
  provinceBoundary: (code: string, id?: string | number) =>
    ["locations", "provinces", code, "boundary", id ?? ""] as const,
  wards: (provinceCode: string) => ["locations", "provinces", provinceCode, "wards"] as const,
  ward: (code: string) => ["locations", "wards", code] as const,
  wardBoundary: (code: string) => ["locations", "wards", code, "boundary"] as const,
  reverseGeocode: (lat: number, lng: number) => ["locations", "reverse-geocode", lat, lng] as const,
  administrativeUnits: ["locations", "administrative-units"] as const,
  administrativeRegions: ["locations", "administrative-regions"] as const,
};

export function useProvinces(enabled = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: locationQueryKeys.provinces,
    queryFn: () => LocationService.getProvinces(),
    enabled,
    select: (res) => ({
      provinces: res.data ?? [],
      message: res.message,
      isSuccess: res.isSuccess,
      statusCode: res.statusCode,
      metadata: res.metadata,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    provinces: data?.provinces ?? [],
    message: data?.message,
    isSuccess: data?.isSuccess,
    statusCode: data?.statusCode,
    metadata: data?.metadata,
  };
}

export function useProvince(code: string | undefined, enabled = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: locationQueryKeys.province(code ?? ""),
    queryFn: () => LocationService.getProvinceByCode(code as string),
    enabled: !!code?.trim() && enabled,
    select: (res) => ({
      province: res.data,
      message: res.message,
      isSuccess: res.isSuccess,
      statusCode: res.statusCode,
      metadata: res.metadata,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    province: data?.province ?? null,
    message: data?.message,
    isSuccess: data?.isSuccess,
    statusCode: data?.statusCode,
    metadata: data?.metadata,
  };
}

export function useProvinceBoundary(
  code: string | undefined,
  id?: string | number,
  enabled = true,
) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: locationQueryKeys.provinceBoundary(code ?? "", id),
    queryFn: () => LocationService.getProvinceBoundaryByCode(code as string, id),
    enabled: !!code?.trim() && enabled,
    select: (res) => ({
      boundary: res.data,
      message: res.message,
      isSuccess: res.isSuccess,
      statusCode: res.statusCode,
      metadata: res.metadata,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    boundary: data?.boundary ?? null,
    message: data?.message,
    isSuccess: data?.isSuccess,
    statusCode: data?.statusCode,
    metadata: data?.metadata,
  };
}

export function useWards(provinceCode: string | undefined, enabled = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: locationQueryKeys.wards(provinceCode ?? ""),
    queryFn: () => LocationService.getWardsByProvinceCode(provinceCode as string),
    enabled: !!provinceCode?.trim() && enabled,
    select: (res) => ({
      wards: res.data ?? [],
      message: res.message,
      isSuccess: res.isSuccess,
      statusCode: res.statusCode,
      metadata: res.metadata,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    wards: data?.wards ?? [],
    message: data?.message,
    isSuccess: data?.isSuccess,
    statusCode: data?.statusCode,
    metadata: data?.metadata,
  };
}

export function useWard(code: string | undefined, enabled = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: locationQueryKeys.ward(code ?? ""),
    queryFn: () => LocationService.getWardByCode(code as string),
    enabled: !!code?.trim() && enabled,
    select: (res) => ({
      ward: res.data,
      message: res.message,
      isSuccess: res.isSuccess,
      statusCode: res.statusCode,
      metadata: res.metadata,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    ward: data?.ward ?? null,
    message: data?.message,
    isSuccess: data?.isSuccess,
    statusCode: data?.statusCode,
    metadata: data?.metadata,
  };
}

export function useWardBoundary(code: string | undefined, enabled = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: locationQueryKeys.wardBoundary(code ?? ""),
    queryFn: () => LocationService.getWardBoundaryByCode(code as string),
    enabled: !!code?.trim() && enabled,
    select: (res) => ({
      boundary: res.data,
      message: res.message,
      isSuccess: res.isSuccess,
      statusCode: res.statusCode,
      metadata: res.metadata,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    boundary: data?.boundary ?? null,
    message: data?.message,
    isSuccess: data?.isSuccess,
    statusCode: data?.statusCode,
    metadata: data?.metadata,
  };
}

export const reverseGeocodeCoordsValid = (lat: number | undefined, lng: number | undefined) =>
  lat != null &&
  lng != null &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180;

/**
 * Reverse geocode theo tọa độ WGS84.
 * Response body: `{ address: string | null }` (không bọc `isSuccess`/`data`).
 */
export function useReverseGeocode(
  lat: number | undefined,
  lng: number | undefined,
  enabled = true,
) {
  const coordsOk = reverseGeocodeCoordsValid(lat, lng);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey:
      coordsOk && enabled
        ? locationQueryKeys.reverseGeocode(lat as number, lng as number)
        : (["locations", "reverse-geocode", "idle"] as const),
    queryFn: () => LocationService.reverseGeocode(lat as number, lng as number),
    enabled: coordsOk && enabled,
    select: (body) => ({
      address: body.data?.address ?? null,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    address: data?.address ?? null,
  };
}

/**
 * Reverse geocode khi ghim vị trí trên map — `onSuccess` / `onError` xử lý trong hook (toast + gọi `onStreetDetailApplied` khi có chuỗi địa chỉ).
 */
export function useReverseGeocodeMutation(onStreetDetailApplied: (streetDetail: string) => void) {
  const mutation = useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) => LocationService.reverseGeocode(lat, lng),
  });

  const mutateGhim = useCallback(
    (lat: number, lng: number) => {
      if (!reverseGeocodeCoordsValid(lat, lng)) {
        toast.error("Tọa độ không hợp lệ.");
        return;
      }
      mutation.mutate(
        { lat, lng },
        {
          onSuccess: (data) => {
            const next = data.data?.address?.trim();
            if (next) {
              onStreetDetailApplied(next);
            } else {
              toast.message("Không có địa chỉ cho vị trí này.");
            }
            toast.success(data.message || "Lấy địa chỉ thành công!");
          },
          onError: () => {
            toast.error("Không lấy được địa chỉ. Thử lại sau.");
          },
        },
      );
    },
    [mutation, onStreetDetailApplied],
  );

  return {
    mutateGhim,
    isPending: mutation.isPending,
  };
}

export function useAdministrativeUnits(enabled = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: locationQueryKeys.administrativeUnits,
    queryFn: () => LocationService.getAdministrativeUnits(),
    enabled,
    select: (res) => ({
      administrativeUnits: res.data ?? [],
      message: res.message,
      isSuccess: res.isSuccess,
      statusCode: res.statusCode,
      metadata: res.metadata,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    administrativeUnits: data?.administrativeUnits ?? [],
    message: data?.message,
    isSuccess: data?.isSuccess,
    statusCode: data?.statusCode,
    metadata: data?.metadata,
  };
}

export function useAdministrativeRegions(enabled = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: locationQueryKeys.administrativeRegions,
    queryFn: () => LocationService.getAdministrativeRegions(),
    enabled,
    select: (res) => ({
      administrativeRegions: res.data ?? [],
      message: res.message,
      isSuccess: res.isSuccess,
      statusCode: res.statusCode,
      metadata: res.metadata,
    }),
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    administrativeRegions: data?.administrativeRegions ?? [],
    message: data?.message,
    isSuccess: data?.isSuccess,
    statusCode: data?.statusCode,
    metadata: data?.metadata,
  };
}
