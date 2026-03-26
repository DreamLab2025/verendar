// /**
//  * User Vehicle Service - API calls for user vehicles
//  */

// import api8080Service from "../api8080Service";

// import { UserVehicle } from "./fetchUsers";
// import { BaseQueryParams, PaginationMetadata } from "../apiService";
// import { OdometerHistoryItem } from "@/components/widget/odometer/OdometerHistoryChart";
// import { TrackingCycleSummary } from "./fetchVehiclePart";

// interface CreateUserVehicleRequest {
//   vehicleVariantId: string;
//   licensePlate: string;
//   nickname: string;
//   vinNumber: string;
//   purchaseDate: string;
//   currentOdometer: number;
// }

// interface CreateUserVehicleResponse {
//   isSuccess: boolean;
//   message: string;
//   data: UserVehicle;
//   metadata: unknown;
// }

// interface UserVehicleListResponse {
//   isSuccess: boolean;
//   message: string;
//   data: UserVehicle[];
//   metadata: PaginationMetadata;
// }

// interface UserVehicleQueryParams extends BaseQueryParams {
//   [key: string]: string | number | boolean | null | undefined | string[];
// }

// interface DeleteUserVehicleResponse {
//   isSuccess: boolean;
//   message: string;
//   data: string;
//   metadata: null;
// }

// export interface UserVehiclePart {
//   id: string;
//   partCategoryId: string;
//   partCategoryName: string;
//   partCategoryCode: string;
//   iconUrl: string;
//   isDeclared: boolean;
//   description: string;
//   /** Chu kỳ theo dõi hiện tại; null/undefined nếu chưa khai báo / chưa thiết lập */
//   activeCycle?: TrackingCycleSummary | null;
// }

// // ==================== Odometer Update ====================


// // ==================== Odometer History ====================



// export const UserVehicleService = {
//   // ==================== Vehicle CRUD ====================

//   createUserVehicle: async (payload: CreateUserVehicleRequest) => {
//     const response = await api8080Service.post<CreateUserVehicleResponse>("/api/v1/user-vehicles", payload);
//     return response.data;
//   },

//   getUserVehicles: async (params: UserVehicleQueryParams) => {
//     const response = await api8080Service.get<UserVehicleListResponse>("/api/v1/user-vehicles", params);
//     return response.data;
//   },

//   deleteUserVehicle: async (id: string) => {
//     const response = await api8080Service.delete<DeleteUserVehicleResponse>(`/api/v1/user-vehicles/${id}`);
//     return response.data;
//   },

//   // ==================== Vehicle Parts ====================

//   // ==================== AI Analysis ====================

//   // ==================== Tracking & Reminders ====================

//   // ==================== Odometer ====================
// };

// export default UserVehicleService;
