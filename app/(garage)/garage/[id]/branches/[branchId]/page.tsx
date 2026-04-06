"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { GarageBranchDaySchedule, GarageBranchDetailDto } from "@/lib/api/services/fetchGarage";

import { useGarageBranchByIdQuery, useUpdateGarageBranch } from "@/hooks/useGarage";

import { NewBranchHeader } from "../new/components/new-branch-header";
import {
  NewBranchStep1,
  isStep1AddressComplete,
  type NewBranchAddressDraft,
} from "../new/components/new-branch-step-1";
import { NewBranchStep2, isStep2InfoComplete, type NewBranchInfoDraft } from "../new/components/new-branch-step-2";
import {
  NewBranchStep3,
  validateWorkingHoursDraft,
  workingHoursDetailToDraft,
  workingHoursDraftToPayload,
  type NewBranchWorkingHoursDraft,
  type WorkingDayKey,
} from "../new/components/new-branch-step-3";
import { NewBranchWizardFooter } from "../new/components/new-branch-wizard-footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const STEP_COUNT = 3;

function detailToAddressDraft(detail: GarageBranchDetailDto): NewBranchAddressDraft {
  const addr = detail.address;
  if (addr && typeof addr === "object" && "provinceCode" in addr) {
    return {
      provinceCode: addr.provinceCode ?? "",
      wardCode: addr.wardCode ?? "",
      streetDetail: addr.streetDetail ?? "",
    };
  }
  return { provinceCode: "", wardCode: "", streetDetail: "" };
}

function detailToBranchInfoDraft(detail: GarageBranchDetailDto): NewBranchInfoDraft {
  return {
    name: detail.name?.trim() ?? "",
    phoneNumber: detail.phoneNumber?.trim() ?? "",
    taxCode: detail.taxCode?.trim() ?? "",
    description: detail.description?.trim() ?? "",
  };
}

type GarageEditBranchWizardProps = {
  garageId: string;
  branchId: string;
  detail: GarageBranchDetailDto;
  exitHref: string;
};

function GarageEditBranchWizard({ garageId, branchId, detail, exitHref }: GarageEditBranchWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<NewBranchAddressDraft>(() => detailToAddressDraft(detail));
  const [branchInfo, setBranchInfo] = useState<NewBranchInfoDraft>(() => detailToBranchInfoDraft(detail));
  const [workingHours, setWorkingHours] = useState<NewBranchWorkingHoursDraft>(() =>
    workingHoursDetailToDraft(detail.workingHours),
  );

  const { mutateAsync: updateGarageBranch, isPending: isUpdatingBranch } = useUpdateGarageBranch();

  const goExit = useCallback(() => {
    router.push(exitHref);
  }, [router, exitHref]);

  const handleAddressChange = useCallback((next: Partial<NewBranchAddressDraft>) => {
    setAddress((prev) => ({ ...prev, ...next }));
  }, []);

  const handleBranchInfoChange = useCallback((next: Partial<NewBranchInfoDraft>) => {
    setBranchInfo((prev) => ({ ...prev, ...next }));
  }, []);

  const handleWorkingDayChange = useCallback((dayKey: WorkingDayKey, value: GarageBranchDaySchedule) => {
    setWorkingHours((prev) => ({ ...prev, [dayKey]: value }));
  }, []);

  const handleBack = useCallback(() => {
    if (step <= 1) {
      goExit();
      return;
    }
    setStep((s) => s - 1);
  }, [step, goExit]);

  const handleNext = useCallback(async () => {
    if (!garageId || !branchId) {
      toast.error("Thiếu mã garage hoặc chi nhánh.");
      return;
    }

    if (step === 1) {
      if (!isStep1AddressComplete(address)) {
        toast.error(
          "Vui lòng chọn tỉnh/thành phố, phường/xã và nhập địa chỉ chi tiết có số nhà (chữ số).",
        );
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!isStep2InfoComplete(branchInfo)) {
        toast.error("Vui lòng nhập tên chi nhánh và số điện thoại.");
        return;
      }
      setStep(3);
      return;
    }

    if (step >= STEP_COUNT) {
      const hoursError = validateWorkingHoursDraft(workingHours);
      if (hoursError) {
        toast.error(hoursError);
        return;
      }
      try {
        await updateGarageBranch({
          garageId,
          branchId,
          payload: {
            name: branchInfo.name.trim(),
            description: branchInfo.description.trim(),
            coverImageUrl: detail.coverImageUrl ?? null,
            phoneNumber: branchInfo.phoneNumber.trim(),
            taxCode: branchInfo.taxCode.trim(),
            address: {
              provinceCode: address.provinceCode,
              wardCode: address.wardCode,
              streetDetail: address.streetDetail.trim(),
            },
            workingHours: workingHoursDraftToPayload(workingHours),
          },
        });
        goExit();
      } catch {
        /* toast lỗi đã xử lý trong hook */
      }
    }
  }, [
    step,
    garageId,
    branchId,
    address,
    branchInfo,
    workingHours,
    updateGarageBranch,
    goExit,
    detail,
  ]);

  const step1NextDisabled = step === 1 && !isStep1AddressComplete(address);
  const step2NextDisabled = step === 2 && !isStep2InfoComplete(branchInfo);
  const nextDisabled = step1NextDisabled || step2NextDisabled;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-muted/25">
      <NewBranchHeader garageId={garageId} exitHref={exitHref} />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background [scrollbar-gutter:stable]">
        <div className="w-full px-4 py-6 md:px-6">
          <div className="mx-auto w-full max-w-3xl pb-28 md:pb-32">
            <p className="mb-4 text-sm font-medium text-primary">Sửa chi nhánh</p>
            {step === 1 ? <NewBranchStep1 address={address} onAddressChange={handleAddressChange} /> : null}
            {step === 2 ? <NewBranchStep2 info={branchInfo} onInfoChange={handleBranchInfoChange} /> : null}
            {step === 3 ? (
              <NewBranchStep3 schedule={workingHours} onDayChange={handleWorkingDayChange} />
            ) : null}
          </div>
        </div>
      </main>

      <NewBranchWizardFooter
        currentStep={step}
        onBack={handleBack}
        onNext={() => {
          void handleNext();
        }}
        nextLabel={step >= STEP_COUNT ? "Lưu thay đổi" : "Tiếp theo"}
        nextDisabled={nextDisabled}
        isNextLoading={isUpdatingBranch}
      />
    </div>
  );
}

export default function GarageEditBranchPage() {
  const params = useParams();
  const garageId = typeof params.id === "string" ? params.id : "";
  const branchId = typeof params.branchId === "string" ? params.branchId : "";

  const branchQuery = useGarageBranchByIdQuery(garageId || undefined, branchId || undefined, Boolean(garageId && branchId));
  const detail = branchQuery.data?.data;

  const exitHref = `/garage-dashboard/${garageId}?tab=branches`;

  if (!garageId || !branchId) {
    return (
      <div className="flex h-dvh items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Thiếu tham số đường dẫn.</p>
      </div>
    );
  }

  if (branchQuery.isPending && !detail) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-muted/25">
        <NewBranchHeader garageId={garageId} exitHref={exitHref} />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-3xl space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-10 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (branchQuery.isError || !detail) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-muted/25">
        <NewBranchHeader garageId={garageId} exitHref={exitHref} />
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-6">
          <p className="text-center text-sm text-destructive">
            {branchQuery.error != null && typeof branchQuery.error === "object" && "message" in branchQuery.error
              ? String((branchQuery.error as { message?: unknown }).message)
              : "Không tải được chi nhánh."}
          </p>
          <Button type="button" variant="outline" onClick={() => void branchQuery.refetch()}>
            Thử lại
          </Button>
        </main>
      </div>
    );
  }

  return (
    <GarageEditBranchWizard
      key={branchId}
      garageId={garageId}
      branchId={branchId}
      detail={detail}
      exitHref={exitHref}
    />
  );
}
