import type { PaginationMetadata, RequestParams } from "../apiService";
import api8080Service from "../api8080Service";

/** Vai trò thành viên chi nhánh theo BE */
export enum BranchMemberRole {
  Manager = "Manager",
  Mechanic = "Mechanic",
}

export const BRANCH_MEMBER_ROLE_LABEL_VI: Record<BranchMemberRole, string> = {
  [BranchMemberRole.Manager]: "Quản lý",
  [BranchMemberRole.Mechanic]: "Thợ máy",
};

export function getBranchMemberRoleLabelVi(role: string | null | undefined): string {
  if (role == null || role === "") return "—";
  if (Object.values(BranchMemberRole).includes(role as BranchMemberRole)) {
    return BRANCH_MEMBER_ROLE_LABEL_VI[role as BranchMemberRole];
  }
  return role;
}

/** Trạng thái thành viên chi nhánh — PATCH /api/v1/members/{id}/status */
export enum BranchMemberStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export const BRANCH_MEMBER_STATUS_LABEL_VI: Record<BranchMemberStatus, string> = {
  [BranchMemberStatus.Active]: "Đang hoạt động",
  [BranchMemberStatus.Inactive]: "Ngưng hoạt động",
};

/** Trạng thái chỉ từ GET (không gửi trong PATCH status) */
const BRANCH_MEMBER_STATUS_EXTRA_LABEL_VI: Record<string, string> = {
  Pending: "Đang chờ",
};

export function getBranchMemberStatusLabelVi(status: string | null | undefined): string {
  if (status == null || status === "") return "—";
  const s = status.trim();
  if (Object.values(BranchMemberStatus).includes(s as BranchMemberStatus)) {
    return BRANCH_MEMBER_STATUS_LABEL_VI[s as BranchMemberStatus];
  }
  if (s in BRANCH_MEMBER_STATUS_EXTRA_LABEL_VI) {
    return BRANCH_MEMBER_STATUS_EXTRA_LABEL_VI[s]!;
  }
  return s;
}

/** Một bản ghi thành viên chi nhánh — GET /api/v1/members */
export interface BranchMemberDto {
  id: string;
  userId: string;
  branchId: string;
  garageId: string;
  role: BranchMemberRole | string;
  status: BranchMemberStatus | string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
}

export interface BranchMembersListResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: BranchMemberDto[];
  metadata: PaginationMetadata | null;
}

/** Query GET /api/v1/members — tên param theo BE */
export interface BranchMembersQueryParams extends RequestParams {
  garageId: string;
  branchId: string;
  PageNumber: number;
  PageSize: number;
  IsDescending?: boolean;
}

/** Body POST /api/v1/members?garageId=… */
export interface CreateBranchMemberPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: BranchMemberRole | string;
  branchId: string;
}

export interface BranchMemberCreateResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: BranchMemberDto;
  metadata: null;
}

/** Body PATCH /api/v1/members/{id}/status */
export interface UpdateBranchMemberStatusPayload {
  status: BranchMemberStatus;
}

export interface BranchMemberStatusUpdateResponse {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: BranchMemberDto;
  metadata: null;
}

export const BranchMemberService = {
  getMembers: async (params: BranchMembersQueryParams) => {
    const res = await api8080Service.get<BranchMembersListResponse>("/api/v1/members", params);
    return res.data;
  },

  /** POST /api/v1/members?garageId=… */
  createMember: async (garageId: string, payload: CreateBranchMemberPayload) => {
    const q = new URLSearchParams({ garageId });
    const res = await api8080Service.post<BranchMemberCreateResponse>(
      `/api/v1/members?${q.toString()}`,
      payload,
    );
    return res.data;
  },

  /** PATCH /api/v1/members/{id}/status */
  updateMemberStatus: async (memberId: string, payload: UpdateBranchMemberStatusPayload) => {
    const res = await api8080Service.patch<BranchMemberStatusUpdateResponse>(
      `/api/v1/members/${memberId}/status`,
      payload,
    );
    return res.data;
  },
};

export default BranchMemberService;
