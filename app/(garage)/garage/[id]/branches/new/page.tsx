"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { GarageBranchDaySchedule } from "@/lib/api/services/fetchGarage";

import { useCreateGarageBranch } from "@/hooks/useGarage";

import { NewBranchHeader } from "./components/new-branch-header";
import {
  NewBranchStep1,
  isStep1AddressComplete,
  type NewBranchAddressDraft,
} from "./components/new-branch-step-1";
import {
  NewBranchStep2,
  createEmptyBranchInfoDraft,
  isStep2InfoComplete,
  type NewBranchInfoDraft,
} from "./components/new-branch-step-2";
import {
  NewBranchStep3,
  createDefaultWorkingHoursDraft,
  validateWorkingHoursDraft,
  workingHoursDraftToPayload,
  type NewBranchWorkingHoursDraft,
  type WorkingDayKey,
} from "./components/new-branch-step-3";
import { NewBranchWizardFooter } from "./components/new-branch-wizard-footer";

const STEP_COUNT = 3;

export default function GarageNewBranchPage() {
  const params = useParams();
  const router = useRouter();
  const garageId = typeof params.id === "string" ? params.id : "";
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<NewBranchAddressDraft>({
    provinceCode: "",
    wardCode: "",
    streetDetail: "",
  });
  const [branchInfo, setBranchInfo] = useState(createEmptyBranchInfoDraft);
  const [workingHours, setWorkingHours] = useState<NewBranchWorkingHoursDraft>(createDefaultWorkingHoursDraft);

  const { mutateAsync: createGarageBranch, isPending: isCreatingBranch } = useCreateGarageBranch();

  const exitHref = `/garage-dashboard/${garageId}?tab=branches`;

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
    if (!garageId) {
      toast.error("Thiếu mã garage.");
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
        await createGarageBranch({
          garageId,
          payload: {
            name: branchInfo.name.trim(),
            description: branchInfo.description.trim(),
            coverImageUrl: branchInfo.coverImageUrl.trim() || null,
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
  }, [step, garageId, address, branchInfo, workingHours, createGarageBranch, goExit]);

  const step1NextDisabled = step === 1 && !isStep1AddressComplete(address);
  const step2NextDisabled = step === 2 && !isStep2InfoComplete(branchInfo);
  const nextDisabled = step1NextDisabled || step2NextDisabled;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-muted/25">
      <NewBranchHeader garageId={garageId} exitHref={exitHref} />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background [scrollbar-gutter:stable]">
        <div className="w-full px-4 py-6 md:px-6">
          <div className="mx-auto w-full max-w-3xl pb-28 md:pb-32">
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
        nextLabel={step >= STEP_COUNT ? "Hoàn tất" : "Tiếp theo"}
        nextDisabled={nextDisabled}
        isNextLoading={isCreatingBranch}
      />
    </div>
  );
}
