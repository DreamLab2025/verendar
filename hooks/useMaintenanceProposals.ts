"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PatchMaintenanceProposalPayload } from "@/lib/api/services/fetchMaintenanceProposals";
import MaintenanceProposalService from "@/lib/api/services/fetchMaintenanceProposals";

const DEFAULT_PAGE_SIZE = 10;

export function useMaintenanceProposalsQuery(
  vehicleId: string | undefined,
  page: number,
  pageSize = DEFAULT_PAGE_SIZE,
) {
  return useQuery({
    queryKey: ["maintenance-proposals", vehicleId, page, pageSize],
    queryFn: async () => {
      const body = await MaintenanceProposalService.getList(vehicleId!, {
        PageNumber: page,
        PageSize: pageSize,
        IsDescending: true,
      });
      if (!body.isSuccess) {
        throw new Error(body.message?.trim() || "Không tải được danh sách đề xuất bảo dưỡng.");
      }
      return body;
    },
    enabled: Boolean(vehicleId),
    staleTime: 30_000,
  });
}

export function usePatchMaintenanceProposalMutation(vehicleId: string | undefined) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      proposalId,
      payload,
    }: {
      proposalId: string;
      payload: PatchMaintenanceProposalPayload;
    }) => MaintenanceProposalService.patchProposal(vehicleId!, proposalId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["maintenance-proposals", vehicleId] });
    },
  });
}

export function useApplyMaintenanceProposalMutation(vehicleId: string | undefined) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (proposalId: string) => MaintenanceProposalService.applyProposal(vehicleId!, proposalId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["maintenance-proposals", vehicleId] });
    },
  });
}

export { DEFAULT_PAGE_SIZE };
