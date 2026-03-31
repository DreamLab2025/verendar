import { useQuery } from "@tanstack/react-query";

import { LocationService } from "@/lib/api/services/fetchLocation";

export const locationQueryKeys = {
  provinces: ["locations", "provinces"] as const,
  province: (code: string) => ["locations", "provinces", code] as const,
  provinceBoundary: (code: string, id?: string | number) =>
    ["locations", "provinces", code, "boundary", id ?? ""] as const,
  wards: (provinceCode: string) => ["locations", "provinces", provinceCode, "wards"] as const,
  ward: (code: string) => ["locations", "wards", code] as const,
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
