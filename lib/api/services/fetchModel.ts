import api8080Service from "../api8080Service";
import { PaginationMetadata, RequestParams } from "../apiService";

export type TransmissionType = "Manual" | "Automatic" | "Sport" | "Electric";

export interface VehicleModelVariant {
  id: string;
  vehicleModelId: string;
  color: string;
  hexCode: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface VehicleModel {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  typeId: string;
  typeName: string;
  releaseYear: number;
  fuelType: number;
  fuelTypeName: string;
  transmissionType: number;
  transmissionTypeName: string;
  engineDisplacementDisplay: string | null;
  engineCapacity: number | null;
  // oilCapacity: number | null;
  // tireSizeFront: string | null;
  // tireSizeRear: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// export interface VehicleModel {
//   id: string;
//   name: string;
//   brandId: string;
//   brandName: string;
//   typeId: string;
//   typeName: string;
//   releaseYear: number;
//   fuelType: number;
//   fuelTypeName: string;
//   transmissionType: number;
//   transmissionTypeName: string;
//   engineDisplacementDisplay: string | null;
//   engineCapacity: number | null;
//   oilCapacity: number | null;
//   tireSizeFront: string | null;
//   tireSizeRear: string | null;
//   createdAt: string;
//   updatedAt: string | null;
//   variants: VehicleModelVariant[]; 
//   imageUrl?: string | null;
// }


export interface ModelListResponse {
  isSuccess: boolean;
  message: string;
  data: VehicleModel[];
  metadata: PaginationMetadata;
}

export interface ModelQueryParams extends RequestParams {
  TypeId?: string;
  BrandId?: string;
  ModelName?: string;
  Color?: string;
  TransmissionType?: TransmissionType;
  EngineDisplacement?: number;
  ReleaseYear?: number;
  PageNumber: number;
  PageSize: number;
  IsDescending?: boolean;
}
export interface CreateModelRequest {
  name: string;
  brandId: string;
  typeId: string;
  releaseYear: number;
  fuelType: string;
  transmissionType: string;
  images: {
    color: string;
    hexCode: string;
    imageUrl: string;
  }[];
  engineDisplacement: number;
  engineCapacity: number;
  oilCapacity: number;
  tireSizeFront: string;
  tireSizeRear: string;
}

export interface UpdateModelRequest {
  name: string;
  brandId: string;
  typeId: string;
  releaseYear: number;
  fuelType: string;
  transmissionType: string;
  images: {
    color: string;
    hexCode: string;
    imageUrl: string;
  }[];
  engineDisplacement: number;
  engineCapacity: number;
  oilCapacity: number;
  tireSizeFront: string;
  tireSizeRear: string;
}

export interface ModelDetailResponse {
  isSuccess: boolean;
  message: string;
  data: VehicleModel;
  metadata: null;
}

export interface ModelMutationResponse {
  isSuccess: boolean;
  message: string;
  data: VehicleModel | null;
  metadata: null;
}



export const ModelService = {
  getModels: async (params: ModelQueryParams) => {
    const response = await api8080Service.get<ModelListResponse>("/api/v1/models", params);
    return response.data;
  },
  getModelById: async (id: string) => {
    const response = await api8080Service.get<ModelDetailResponse>(`/api/v1/models/${id}`);
    return response.data;
  },

  createModel: async (data: CreateModelRequest) => {
    const response = await api8080Service.post<ModelMutationResponse>("/api/v1/models", data);
    return response.data;
  },

  updateModel: async (id: string, data: UpdateModelRequest) => {
    const response = await api8080Service.put<ModelMutationResponse>(`/api/v1/models/${id}`, data);
    return response.data;
  },

  deleteModel: async (id: string) => {
    const response = await api8080Service.delete<ModelMutationResponse>(`/api/v1/models/${id}`);
    return response.data;
  },
};

export default ModelService;
