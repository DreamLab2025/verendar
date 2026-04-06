"use client";

import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  uploadMediaFile,
  type MediaFileType,
  type UploadMediaFileResult,
} from "@/lib/api/services/fetchMedia";

export type UploadMediaVariables = {
  file: File;
  fileType: MediaFileType;
};

export type UseMediaUploadMutationOptions = Omit<
  UseMutationOptions<UploadMediaFileResult, Error, UploadMediaVariables>,
  "mutationFn"
>;

/**
 * Mutation: init presigned → PUT S3 → confirm — trả về `fileId`.
 */
export function useMediaUploadMutation(
  options?: UseMediaUploadMutationOptions,
): UseMutationResult<UploadMediaFileResult, Error, UploadMediaVariables> {
  const { onError: userOnError, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ file, fileType }) => uploadMediaFile(file, fileType),
    onError: (err, vars, ctx, mutationCtx) => {
      toast.error(err.message || "Upload thất bại.");
      userOnError?.(err, vars, ctx, mutationCtx);
    },
  });
}

export {
  getImageUrlFromConfirmData,
  MEDIA_FILE_TYPES,
  type MediaFileType,
  uploadMediaFile,
  uploadFileToPresignedUrl,
} from "@/lib/api/services/fetchMedia";

export { default as MediaService } from "@/lib/api/services/fetchMedia";
