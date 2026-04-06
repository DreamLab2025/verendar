import api8080Service from "../api8080Service";

/** `fileType` gửi lên POST init-upload — đồng bộ BE. */
export const MEDIA_FILE_TYPES = [
  "Avatar",
  "VehicleType",
  "VehicleBrand",
  "VehicleVariant",
  "PartCategory",
  "MaintenanceInvoice",
  "GarageLogo",
  "GarageBranchCover",
  "GarageServiceImage",
  "GarageProductImage",
  "GarageBundleImage",
  "ServiceCategoryIcon",
  "Other",
] as const;

export type MediaFileType = (typeof MEDIA_FILE_TYPES)[number];

export interface InitMediaUploadPayload {
  fileName: string;
  contentType: string;
  size: number;
  fileType: MediaFileType;
  provider: "AwsS3";
}

export interface InitMediaUploadData {
  presignedUrl: string | null;
  fileId: string | null;
}

export interface InitMediaUploadResponseBody {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: InitMediaUploadData;
  metadata: null;
}

/** Payload `data` từ PUT /api/v1/media-files/{id}/confirm — URL ảnh công khai (CDN/S3). */
export interface ConfirmMediaUploadData {
  url?: string | null;
  publicUrl?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null;
  mediaUrl?: string | null;
  cdnUrl?: string | null;
  /** Một số API .NET trả PascalCase trong JSON */
  Url?: string | null;
  PublicUrl?: string | null;
  ImageUrl?: string | null;
}

export interface ConfirmMediaUploadResponseBody {
  isSuccess: boolean;
  statusCode?: number;
  message: string | null;
  data: ConfirmMediaUploadData | string | null;
  metadata: null;
}

const MediaService = {
  initUpload: async (payload: InitMediaUploadPayload) => {
    const res = await api8080Service.post<InitMediaUploadResponseBody>("/api/v1/media-files/init-upload", payload);
    return res.data;
  },

  confirmUpload: async (fileId: string) => {
    const res = await api8080Service.put<ConfirmMediaUploadResponseBody>(
      `/api/v1/media-files/${encodeURIComponent(fileId)}/confirm`,
      undefined,
    );
    return res.data;
  },
};

export default MediaService;


export async function uploadFileToPresignedUrl(
  presignedUrl: string,
  file: Blob,
  contentType: string,
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!res.ok) {
    const hint = await res.text().catch(() => "");
    throw new Error(hint.trim() || `Tải file lên storage thất bại (${res.status}).`);
  }
}

export type UploadMediaFileResult = {
  fileId: string;
  imageUrl: string;
};

const CONFIRM_URL_KEYS = [
  "url",
  "publicUrl",
  "imageUrl",
  "fileUrl",
  "mediaUrl",
  "cdnUrl",
  "fullUrl",
  "Url",
  "PublicUrl",
  "ImageUrl",
  "FileUrl",
] as const;

export function getImageUrlFromConfirmData(data: ConfirmMediaUploadData | string | null | undefined): string {
  if (data == null) {
    throw new Error(
      "Confirm thành công nhưng `data` là null — BE cần trả URL ảnh trong trường `data` (hoặc kiểm tra serializer camelCase/PascalCase).",
    );
  }
  if (typeof data === "string") {
    const t = data.trim();
    if (t) return t;
    throw new Error("Trường `data` là chuỗi rỗng.");
  }
  if (typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Trường `data` không phải object hợp lệ để chứa URL.");
  }
  const raw = data as Record<string, unknown>;
  for (const key of CONFIRM_URL_KEYS) {
    const v = raw[key];
    if (typeof v === "string") {
      const t = v.trim();
      if (t) return t;
    }
  }
  throw new Error(
    `Phản hồi confirm không có URL trong data (đã thử: ${CONFIRM_URL_KEYS.slice(0, 6).join(", ")}, …). Kiểm tra JSON thực tế từ API.`,
  );
}


export async function uploadMediaFile(file: File, fileType: MediaFileType): Promise<UploadMediaFileResult> {
  const contentType = file.type || "application/octet-stream";

  const init = await MediaService.initUpload({
    fileName: file.name,
    contentType,
    size: file.size,
    fileType,
    provider: "AwsS3",
  });

  if (!init.isSuccess) {
    throw new Error(init.message?.trim() || "Không khởi tạo upload được.");
  }

  const { presignedUrl, fileId } = init.data ?? { presignedUrl: null, fileId: null };
  if (!presignedUrl || !fileId) {
    throw new Error("Thiếu presignedUrl hoặc fileId từ máy chủ.");
  }

  await uploadFileToPresignedUrl(presignedUrl, file, contentType);

  const confirm = await MediaService.confirmUpload(fileId);
  if (!confirm.isSuccess) {
    throw new Error(confirm.message?.trim() || "Xác nhận upload thất bại.");
  }

  const imageUrl = getImageUrlFromConfirmData(confirm.data);
  return { fileId, imageUrl };
}
