import api8080Service from "@/lib/api/api8080Service";

export interface LocationProvince {
  code: string | null;
  name: string | null;
  administrativeRegionId: number;
  administrativeRegionName: string | null;
  administrativeUnitId: number;
  administrativeUnitName: string | null;
}

export interface ProvincesListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: LocationProvince[];
  metadata: unknown;
}

export interface ProvinceDetailResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: LocationProvince;
  metadata: unknown;
}

export interface LocationWard {
  code: string | null;
  name: string | null;
  provinceCode: string | null;
  provinceName: string | null;
  administrativeUnitId: number;
  administrativeUnitName: string | null;
}

export interface ProvinceWardsListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: LocationWard[];
  metadata: unknown;
}

export interface WardDetailResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: LocationWard;
  metadata: unknown;
}

export interface LocationAdministrativeUnit {
  id: number;
  name: string | null;
  abbreviation: string | null;
}

export interface AdministrativeUnitsListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: LocationAdministrativeUnit[];
  metadata: unknown;
}

export interface LocationAdministrativeRegion {
  id: number;
  name: string | null;
}

export interface AdministrativeRegionsListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: LocationAdministrativeRegion[];
  metadata: unknown;
}

export interface ProvinceBoundaryData {
  code: string | null;
  name: string | null;
  boundaryUrl: string | null;
}

export interface WardBoundaryData {
  code: string | null;
  name: string | null;
  boundaryUrl: string | null;
  boundaryShardMatchProperty: string | null;
  boundaryShardMatchValue: string | null;
}
export interface ProvinceBoundaryResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: ProvinceBoundaryData;
  metadata: unknown;
}

/** GET /api/v1/locations/wards/{code}/boundary — cùng shape `data` với province boundary */
export interface WardBoundaryResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: WardBoundaryData;
  metadata: unknown;
}

/** Body JSON trực tiếp — GET /api/internal/locations/reverse-geocode?lat=&lng= */
export interface ReverseGeocodeResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: {
  address: string | null;
  };
  metadata: unknown;
}

export const LocationService = {
  getProvinces: async () => {
    const response = await api8080Service.get<ProvincesListResponse>("/api/v1/locations/provinces");
    return response.data;
  },

  /** `code` — mã tỉnh/thành (path segment, đã encode). */
  getProvinceByCode: async (code: string) => {
    const response = await api8080Service.get<ProvinceDetailResponse>(
      `/api/v1/locations/provinces/${encodeURIComponent(code)}`,
    );
    return response.data;
  },

  /** `code` — mã tỉnh/thành; danh sách phường/xã thuộc tỉnh đó. */
  getWardsByProvinceCode: async (code: string) => {
    const response = await api8080Service.get<ProvinceWardsListResponse>(
      `/api/v1/locations/provinces/${encodeURIComponent(code)}/wards`,
    );
    return response.data;
  },

  /** `code` — mã phường/xã (path segment, đã encode). */
  getWardByCode: async (code: string) => {
    const response = await api8080Service.get<WardDetailResponse>(
      `/api/v1/locations/wards/${encodeURIComponent(code)}`,
    );
    return response.data;
  },

  /** `code` — mã phường/xã (path segment, đã encode). */
  getWardBoundaryByCode: async (code: string) => {
    const response = await api8080Service.get<WardBoundaryResponse>(
      `/api/v1/locations/wards/${encodeURIComponent(code)}/boundary`,
    );
    return response.data;
  },

  getAdministrativeUnits: async () => {
    const response = await api8080Service.get<AdministrativeUnitsListResponse>(
      "/api/v1/locations/administrative-units",
    );
    return response.data;
  },

  getAdministrativeRegions: async () => {
    const response = await api8080Service.get<AdministrativeRegionsListResponse>(
      "/api/v1/locations/administrative-regions",
    );
    return response.data;
  },

  /**
   * GET /api/v1/locations/provinces/{code}/boundary
   * Có thể truyền thêm query param `Id` nếu BE yêu cầu.
   */
  getProvinceBoundaryByCode: async (code: string, id?: string | number) => {
    const response = await api8080Service.get<ProvinceBoundaryResponse>(
      `/api/v1/locations/provinces/${encodeURIComponent(code)}/boundary`,
      id == null ? undefined : { Id: id },
    );
    return response.data;
  },

  /**
   * GET /api/internal/locations/reverse-geocode
   * Query: `lat`, `lng` (số — client gửi dạng string qua query).
   */
  reverseGeocode: async (lat: number, lng: number) => {
    const response = await api8080Service.get<ReverseGeocodeResponse>("/api/v1/locations/reverse-geocode", {
      lat,
      lng,
    });
    return response.data;
  },
};
