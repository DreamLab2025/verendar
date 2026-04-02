import type { PaginationMetadata, RequestParams } from "../apiService";
import api8080Service from "../api8080Service";

/** Trạng thái garage theo BE (chuỗi giá trị cố định). */
export enum GarageStatus {
  Pending = "Pending",
  Active = "Active",
  Suspended = "Suspended",
  Rejected = "Rejected",
}

/** Nhãn hiển thị tiếng Việt cho từng `GarageStatus`. */
export const GARAGE_STATUS_LABEL_VI: Record<GarageStatus, string> = {
  [GarageStatus.Pending]: "Chờ duyệt",
  [GarageStatus.Active]: "Đang hoạt động",
  [GarageStatus.Suspended]: "Tạm ngưng",
  [GarageStatus.Rejected]: "Từ chối",
};

export function getGarageStatusLabelVi(status: string | null | undefined): string {
  if (status == null || status === "") return "—";
  if (Object.values(GarageStatus).includes(status as GarageStatus)) {
    return GARAGE_STATUS_LABEL_VI[status as GarageStatus];
  }
  return status;
}

export function isGarageStatusActive(status: string | null | undefined): boolean {
  return status === GarageStatus.Active;
}

export interface GarageDto {
  id: string;
  ownerId: string;
  businessName: string | null;
  slug: string | null;
  shortName: string | null;
  taxCode: string | null;
  logoUrl: string | null;
  status: GarageStatus | string;
  createdAt: string;
  updatedAt: string | null;
}

/** Trạng thái chi nhánh theo BE. */
export enum GarageBranchStatus {
  Active = "Active",
  Inactive = "Inactive",
}

/** Nhãn hiển thị tiếng Việt cho từng `GarageBranchStatus`. */
export const GARAGE_BRANCH_STATUS_LABEL_VI: Record<GarageBranchStatus, string> = {
  [GarageBranchStatus.Active]: "Đang hoạt động",
  [GarageBranchStatus.Inactive]: "Ngưng hoạt động",
};

export function getGarageBranchStatusLabelVi(status: string | null | undefined): string {
  if (status == null || status === "") return "—";
  if (Object.values(GarageBranchStatus).includes(status as GarageBranchStatus)) {
    return GARAGE_BRANCH_STATUS_LABEL_VI[status as GarageBranchStatus];
  }
  return status;
}

export function isGarageBranchStatusActive(status: string | null | undefined): boolean {
  return status === GarageBranchStatus.Active;
}

/** Địa chỉ branch dạng object — POST/PUT body & chi tiết branch. */
export interface GarageBranchAddressDto {
  provinceCode: string;
  wardCode: string;
  streetDetail: string;
}

/** Địa chỉ khi BE trả object lỏng hơn (list, dữ liệu cũ). */
export interface GarageBranchAddressPartsDto {
  provinceCode?: string;
  wardCode?: string;
  streetDetail?: string;
}

export interface GarageBranchDto {
  id: string;
  name: string | null;
  slug: string | null;
  address: string | GarageBranchAddressPartsDto | null;
  phoneNumber: string | null;
  latitude: number;
  longitude: number;
  status: GarageBranchStatus | string;
}

export function formatGarageBranchAddress(address: GarageBranchDto["address"]): string {
  if (address == null) return "—";
  if (typeof address === "string") {
    const t = address.trim();
    return t.length > 0 ? t : "—";
  }
  const parts = [address.streetDetail].filter(
    (x): x is string => typeof x === "string" && x.trim().length > 0,
  );
  return parts.length > 0 ? parts.join(", ") : "—";
}

export interface GarageMeDto extends GarageDto {
  branchCount: number;
  branches: GarageBranchDto[];
  /** Chủ sở hữu / người đại diện — BE có thể bổ sung */
  ownerDisplayName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface GaragesListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageDto[];
  metadata: PaginationMetadata | null;
}

export interface GaragesQueryParams extends RequestParams {
  status?: string;
  pageNumber: number;
  pageSize: number;
  isDescending?: boolean;
}

export interface CreateGaragePayload {
  businessName: string;
  shortName: string;
  taxCode: string;
  logoUrl: string | null;
}

/** Body PUT /api/v1/garages/{id} */
export type UpdateGaragePayload = CreateGaragePayload;

export interface GarageCreateResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageDto;
  metadata: null;
}

export interface GarageMeResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageMeDto;
  metadata: null;
}

export type GarageDetailResponse = GarageMeResponse;

export interface GarageUpdateResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageDto;
  metadata: null;
}

export interface PatchGarageStatusPayload {
  status: GarageStatus | string;
  reason: string;
}

export type GarageStatusPatchResponse = GarageUpdateResponse;

export type GarageResubmitResponse = GarageUpdateResponse;

export interface GarageBusinessLookupDto {
  taxCode: string | null;
  name: string | null;
  internationalName: string | null;
  shortName: string | null;
  address: string | null;
  status: string | null;
}

export interface GarageBusinessLookupResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBusinessLookupDto;
  metadata: null;
}

export interface GarageBranchesQueryParams extends RequestParams {
  pageNumber: number;
  pageSize: number;
  isDescending?: boolean;
}

export interface GarageBranchesListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBranchDto[];
  metadata: PaginationMetadata | null;
}

/** GET /api/v1/garages/branches/maps — tên query theo BE (PascalCase) */
export interface GarageBranchesMapsQueryParams extends RequestParams {
  Address?: string;
  Lat?: number;
  Lng?: number;
  RadiusKm?: number;
  PageNumber: number;
  PageSize: number;
  isDescending?: boolean;
}

/** Một điểm chi nhánh trên bản đồ */
export interface GarageBranchMapItemDto {
  id: string;
  name: string | null;
  slug: string | null;
  coverImageUrl: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  mapLinks: unknown | null;
  phoneNumber: string | null;
  status: GarageBranchStatus | string;
  garage: GarageDto | null;
  averageRating: number | null;
  reviewCount: number;
}

export interface GarageBranchesMapsListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBranchMapItemDto[];
  metadata: PaginationMetadata | null;
}

/** Body `address` — POST/PUT /api/v1/garages/{garageId}/branches */
export type CreateGarageBranchAddressPayload = GarageBranchAddressDto;

/** Một ngày trong `workingHours.schedule` (key thường là mã ngày / weekday). */
export interface GarageBranchDaySchedule {
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface GarageBranchWorkingHoursDto {
  schedule: Record<string, GarageBranchDaySchedule>;
}

/** Lịch làm việc — body gửi lên; `schedule` có thể rỗng `{}`. */
export interface CreateGarageBranchWorkingHoursPayload {
  schedule: Record<string, unknown>;
}

export interface GarageBranchMapLinksDto {
  googleMaps: string;
  appleMaps: string;
  waze: string;
  openStreetMap: string;
}

/** Body POST /api/v1/garages/{garageId}/branches */
export interface CreateGarageBranchPayload {
  name: string;
  description: string;
  coverImageUrl: string | null;
  phoneNumber: string;
  taxCode: string;
  address: CreateGarageBranchAddressPayload;
  workingHours: CreateGarageBranchWorkingHoursPayload;
}

/** Body PUT /api/v1/garages/{garageId}/branches/{branchId} — cùng schema với POST */
export type UpdateGarageBranchPayload = CreateGarageBranchPayload;

/** GET /api/v1/garages/{garageId}/branches/{branchId} — cùng dạng `data` sau POST */
export interface GarageBranchDetailDto {
  id: string;
  garageId: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  coverImageUrl: string | null;
  address: GarageBranchAddressDto | string | null;
  latitude: number;
  longitude: number;
  mapLinks: GarageBranchMapLinksDto | null;
  workingHours: GarageBranchWorkingHoursDto | null;
  phoneNumber: string | null;
  taxCode: string | null;
  status: GarageBranchStatus | string;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string | null;
}

/** Response POST /api/v1/garages/{garageId}/branches */
export interface GarageBranchCreateResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBranchDetailDto;
  metadata: string | null;
}

export interface GarageBranchDetailResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBranchDetailDto;
  metadata: string | null;
}

/**
 * GET /api/v1/garages/branches/me — chi nhánh gắn user hiện tại (BE có thể trả null cho tọa độ / địa chỉ).
 */
export interface GarageBranchMeDto {
  id: string;
  garageId: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  coverImageUrl: string | null;
  address: GarageBranchAddressDto | string | null;
  latitude: number | null;
  longitude: number | null;
  mapLinks: GarageBranchMapLinksDto | null;
  workingHours: GarageBranchWorkingHoursDto | null;
  phoneNumber: string | null;
  taxCode: string | null;
  status: GarageBranchStatus | string;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface GarageBranchMeResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBranchMeDto;
  metadata: unknown;
}

/** GET chi nhánh theo id — map sang cùng shape với /branches/me cho UI dùng chung. */
export function garageBranchDetailToGarageBranchMeDto(d: GarageBranchDetailDto): GarageBranchMeDto {
  return {
    id: d.id,
    garageId: d.garageId,
    name: d.name,
    slug: d.slug,
    description: d.description,
    coverImageUrl: d.coverImageUrl,
    address: d.address,
    latitude: d.latitude,
    longitude: d.longitude,
    mapLinks: d.mapLinks,
    workingHours: d.workingHours,
    phoneNumber: d.phoneNumber,
    taxCode: d.taxCode,
    status: d.status,
    averageRating: d.averageRating,
    reviewCount: d.reviewCount,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

/** Map GET /branches/me → shape dùng chung với card danh sách chi nhánh. */
export function garageBranchMeToGarageBranchDto(me: GarageBranchMeDto): GarageBranchDto {
  return {
    id: me.id,
    name: me.name,
    slug: me.slug,
    address: me.address as GarageBranchDto["address"],
    phoneNumber: me.phoneNumber,
    latitude: me.latitude ?? 0,
    longitude: me.longitude ?? 0,
    status: me.status,
  };
}

/** PUT branch — `data` là chi nhánh đầy đủ sau cập nhật */
export type GarageBranchUpdateResponse = GarageBranchDetailResponse;

/** DELETE /api/v1/garages/{garageId}/branches/{branchId} */
export interface GarageBranchDeleteResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: boolean;
  metadata: null;
}

/** Body PATCH /api/v1/garages/{garageId}/branches/{branchId}/status */
export interface PatchGarageBranchStatusPayload {
  status: GarageBranchStatus | string;
}

/** PATCH branch status — `data` là chi nhánh đầy đủ */
export type GarageBranchStatusPatchResponse = GarageBranchDetailResponse;

/** GET /api/v1/garage-catalog/{branchId} — public, lọc theo BE (Type: service/product/bundle, CategoryId). */
export type GarageCatalogItemType = "Service" | "Product" | "Bundle";

export interface GarageCatalogPriceDto {
  amount: number;
  currency: string;
}

export interface GarageCatalogItemDto {
  id: string;
  type: GarageCatalogItemType | string;
  garageBranchId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: GarageCatalogPriceDto;
  estimatedDurationMinutes: number | null;
  status: string;
  createdAt: string;
  serviceCategoryId: string | null;
  serviceCategoryName: string | null;
  partCategoryId: string | null;
  hasInstallationOption: boolean;
  itemCount: number | null;
  subTotal: number | null;
  finalPrice: number | null;
  discountAmount: number | null;
  discountPercent: number | null;
  currency: string;
}

export interface GarageCatalogListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageCatalogItemDto[];
  metadata: PaginationMetadata | null;
}

export interface GarageCatalogQueryParams extends RequestParams {
  PageNumber: number;
  PageSize: number;
  /** Lọc loại mục — BE thường dùng Service | Product | Bundle (PascalCase). */
  Type?: string;
  CategoryId?: string;
}

/** GET /api/v1/garage-products/{id} — chi tiết phụ tùng (có thể kèm dịch vụ lắp). */
export interface GarageProductInstallationServiceDto {
  id: string;
  name: string;
  laborPrice: GarageCatalogPriceDto;
  estimatedDurationMinutes: number | null;
}

export interface GarageProductDetailDto {
  id: string;
  garageBranchId: string;
  name: string;
  description: string | null;
  materialPrice: GarageCatalogPriceDto;
  estimatedDurationMinutes: number | null;
  imageUrl: string | null;
  compatibleVehicleTypes: string | null;
  manufacturerKmInterval: number | null;
  manufacturerMonthInterval: number | null;
  partCategoryId: string | null;
  status: string;
  installationService: GarageProductInstallationServiceDto | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface GarageProductDetailResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageProductDetailDto;
  metadata: null;
}

/** GET /api/v1/garage-services/{id} — chi tiết dịch vụ (nhân công). */
export interface GarageServiceDetailDto {
  id: string;
  garageBranchId: string;
  name: string;
  description: string | null;
  laborPrice: GarageCatalogPriceDto;
  serviceCategoryId: string | null;
  serviceCategoryName: string | null;
  estimatedDurationMinutes: number | null;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface GarageServiceDetailResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageServiceDetailDto;
  metadata: null;
}

/** GET /api/v1/garage-bundles/{id} — chi tiết combo kèm danh sách items. */
export interface GarageBundleItemDto {
  id: string;
  productId: string | null;
  serviceId: string | null;
  includeInstallation: boolean;
  sortOrder: number;
  itemName: string;
  materialPrice: GarageCatalogPriceDto | null;
  laborPrice: GarageCatalogPriceDto | null;
}

export interface GarageBundleDetailDto {
  id: string;
  garageBranchId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  discountAmount: number | null;
  discountPercent: number | null;
  subTotal: number;
  finalPrice: number;
  currency: string;
  status: string;
  items: GarageBundleItemDto[];
  createdAt: string;
  updatedAt: string | null;
}

export interface GarageBundleDetailResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: GarageBundleDetailDto;
  metadata: null;
}

export const GarageService = {
  getGarages: async (params: GaragesQueryParams) => {
    const res = await api8080Service.get<GaragesListResponse>("/api/v1/garages", params);
    return res.data;
  },

  getMyGarage: async () => {
    const res = await api8080Service.get<GarageMeResponse>("/api/v1/garages/me");
    return res.data;
  },

  getGarageById: async (id: string) => {
    const res = await api8080Service.get<GarageDetailResponse>(`/api/v1/garages/${id}`);
    return res.data;
  },

  createGarage: async (payload: CreateGaragePayload) => {
    const res = await api8080Service.post<GarageCreateResponse>("/api/v1/garages", payload);
    return res.data;
  },

  updateGarage: async (id: string, payload: UpdateGaragePayload) => {
    const res = await api8080Service.put<GarageUpdateResponse>(`/api/v1/garages/${id}`, payload);
    return res.data;
  },

  patchGarageStatus: async (id: string, payload: PatchGarageStatusPayload) => {
    const res = await api8080Service.patch<GarageStatusPatchResponse>(
      `/api/v1/garages/${id}/status`,
      payload,
    );
    return res.data;
  },

  resubmitGarage: async (id: string) => {
    const res = await api8080Service.patch<GarageResubmitResponse>(`/api/v1/garages/${id}/resubmit`);
    return res.data;
  },

  lookupBusinessByTaxCode: async (taxCode: string) => {
    const encoded = encodeURIComponent(taxCode.trim());
    const res = await api8080Service.get<GarageBusinessLookupResponse>(
      `/api/v1/garages/business-lookup/${encoded}`,
    );
    return res.data;
  },

  getGarageBranches: async (garageId: string, params: GarageBranchesQueryParams) => {
    const res = await api8080Service.get<GarageBranchesListResponse>(
      `/api/v1/garages/${garageId}/branches`,
      params,
    );
    return res.data;
  },

  getGarageBranchesMaps: async (params: GarageBranchesMapsQueryParams) => {
    const res = await api8080Service.get<GarageBranchesMapsListResponse>(
      "/api/v1/garages/branches/maps",
      params,
    );
    return res.data;
  },

  createGarageBranch: async (garageId: string, payload: CreateGarageBranchPayload) => {
    const res = await api8080Service.post<GarageBranchCreateResponse>(
      `/api/v1/garages/${garageId}/branches`,
      payload,
    );
    return res.data;
  },

  /** Chi nhánh của user đăng nhập (garage staff / branch context). */
  getMyGarageBranch: async () => {
    const res = await api8080Service.get<GarageBranchMeResponse>("/api/v1/garages/branches/me");
    return res.data;
  },

  getGarageBranchById: async (garageId: string, branchId: string) => {
    const res = await api8080Service.get<GarageBranchDetailResponse>(
      `/api/v1/garages/${garageId}/branches/${branchId}`,
    );
    return res.data;
  },

  updateGarageBranch: async (
    garageId: string,
    branchId: string,
    payload: UpdateGarageBranchPayload,
  ) => {
    const res = await api8080Service.put<GarageBranchUpdateResponse>(
      `/api/v1/garages/${garageId}/branches/${branchId}`,
      payload,
    );
    return res.data;
  },

  deleteGarageBranch: async (garageId: string, branchId: string) => {
    const res = await api8080Service.delete<GarageBranchDeleteResponse>(
      `/api/v1/garages/${garageId}/branches/${branchId}`,
    );
    return res.data;
  },

  patchGarageBranchStatus: async (
    garageId: string,
    branchId: string,
    payload: PatchGarageBranchStatusPayload,
  ) => {
    const res = await api8080Service.patch<GarageBranchStatusPatchResponse>(
      `/api/v1/garages/${garageId}/branches/${branchId}/status`,
      payload,
    );
    return res.data;
  },

  getGarageCatalog: async (branchId: string, params: GarageCatalogQueryParams) => {
    const res = await api8080Service.get<GarageCatalogListResponse>(`/api/v1/garage-catalog/${branchId}`, params);
    return res.data;
  },

  getGarageProductById: async (id: string) => {
    const res = await api8080Service.get<GarageProductDetailResponse>(`/api/v1/garage-products/${id}`);
    return res.data;
  },

  getGarageServiceById: async (id: string) => {
    const res = await api8080Service.get<GarageServiceDetailResponse>(`/api/v1/garage-services/${id}`);
    return res.data;
  },

  getGarageBundleById: async (id: string) => {
    const res = await api8080Service.get<GarageBundleDetailResponse>(`/api/v1/garage-bundles/${id}`);
    return res.data;
  },
};

export default GarageService;
