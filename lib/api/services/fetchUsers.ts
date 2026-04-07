// src/lib/api/services/fetchUsers.ts
import { ApiResponse, PaginationMetadata, RequestParams } from "../apiService";
import api8080Service from "../api8080Service";

export interface UserDto {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  emailVerified: boolean;
  phoneNumberVerified: boolean;
  roles: string[];
  createdAt: string; // ISO
  dateOfBirth?: string; // ISO
  gender?: string;
}

export type UseUsersSelected = {
  users: UsersListResponse["data"];
  metadata: UsersListResponse["metadata"];
  message: UsersListResponse["message"];
  isSuccess: UsersListResponse["isSuccess"];
};



export interface UsersListResponse {
  isSuccess: boolean;
  message: string;
  data: UserDto[];
  metadata: PaginationMetadata;
}

export interface UserDetailResponse {
  isSuccess: boolean;
  message: string;
  data: UserDto;
  metadata: null;
}

export interface UsersQueryParams extends RequestParams {
  Name?: string;
  Role?: string[];
  PageNumber: number;
  PageSize: number;
  IsDescending?: boolean;
}

export interface CreateUserRequest {
  dateOfBirth: string | null;
  email: string | null;
  fullName: string | null;
  gender: string | null;
  password: string | null;
  phoneNumber: string | null;
  roles: string[];
}

export interface UpdateUserRequest {
  dateOfBirth: string | null;
  email: string | null;
  emailVerified: boolean;
  fullName: string | null;
  gender: string | null;
  password?: string | null;
  phoneNumber: string | null;
  phoneNumberVerified: boolean;
  roles: string[];
}

export const UserService = {
  getUsers: async (params: UsersQueryParams) => {
    const res = await api8080Service.get<UsersListResponse>("/api/v1/users", params);
    return res.data;
  },
  getUserById: async (id: string) => {
    const res = await api8080Service.get<UserDetailResponse>(`/api/v1/users/${id}`);
    return res.data;
  },
  createUser: async (data: CreateUserRequest) => {
    const res = await api8080Service.post<UserDetailResponse>("/api/v1/users", data);
    return res.data;
  },
  updateUser: async (id: string, data: UpdateUserRequest) => {
    const res = await api8080Service.put<UserDetailResponse>(`/api/v1/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await api8080Service.delete<ApiResponse<boolean>>(`/api/v1/users/${id}`);
    return res.data;
  },
};

export default UserService;
