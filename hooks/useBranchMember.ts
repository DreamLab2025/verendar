"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import BranchMemberService, {
  type BranchMembersQueryParams,
  type CreateBranchMemberPayload,
  type UpdateBranchMemberStatusPayload,
} from "@/lib/api/services/fetchBranchMember";

type UseBranchMembersParams = Pick<
  BranchMembersQueryParams,
  "PageNumber" | "PageSize" | "IsDescending"
>;

export function useBranchMembersQuery(
  garageId: string | undefined,
  branchId: string | undefined,
  params: UseBranchMembersParams,
  enabled = true,
) {
  const { PageNumber, PageSize, IsDescending } = params;

  return useQuery({
    queryKey: ["members", garageId, branchId, PageNumber, PageSize, IsDescending],
    queryFn: () =>
      BranchMemberService.getMembers({
        garageId: garageId!,
        branchId: branchId!,
        PageNumber,
        PageSize,
        ...(IsDescending !== undefined ? { IsDescending } : {}),
      }),
    enabled: Boolean(garageId && branchId) && enabled,
  });
}

export function useCreateBranchMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ garageId, payload }: { garageId: string; payload: CreateBranchMemberPayload }) =>
      BranchMemberService.createMember(garageId, payload),
    onSuccess: (data, { garageId }) => {
      void queryClient.invalidateQueries({ queryKey: ["members", garageId] });
      toast.success(data.message?.trim() || "Thêm nhân viên thành công");
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error.message || "Thêm nhân viên thất bại");
    },
  });
}

export function useUpdateBranchMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      garageId: string;
      memberId: string;
      payload: UpdateBranchMemberStatusPayload;
    }) => BranchMemberService.updateMemberStatus(vars.memberId, vars.payload),
    onSuccess: (data, { garageId }) => {
      void queryClient.invalidateQueries({ queryKey: ["members", garageId] });
      toast.success(data.message?.trim() || "Cập nhật trạng thái thành công");
    },
    onError: (error: Error & { message?: string }) => {
      toast.error(error.message || "Cập nhật trạng thái thất bại");
    },
  });
}
