// src/lib/api/services/fetchUsers.ts
import { PaginationMetadata, RequestParams } from "../apiService";
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
  PageNumber: number;
  PageSize: number;
  IsDescending?: boolean;
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
};

export default UserService;
