"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useCreateGarageBranch } from "@/hooks/useGarage";

import { NewBranchHeader } from "./components/new-branch-header";
import { NewBranchStep1, type NewBranchAddressDraft } from "./components/new-branch-step-1";
import { NewBranchStep2 } from "./components/new-branch-step-2";
import { NewBranchStep3 } from "./components/new-branch-step-3";
import { NewBranchWizardFooter } from "./components/new-branch-wizard-footer";

const STEP_COUNT = 3;

function isStep1AddressComplete(a: NewBranchAddressDraft): boolean {
  return Boolean(a.provinceCode && a.wardCode && a.streetDetail.trim());
}

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

  const { mutateAsync: createGarageBranch, isPending: isCreatingBranch } = useCreateGarageBranch();

  const exitHref = `/garage-dashboard/${garageId}?tab=branches`;

  const goExit = useCallback(() => {
    router.push(exitHref);
  }, [router, exitHref]);

  const handleAddressChange = useCallback((next: Partial<NewBranchAddressDraft>) => {
    setAddress((prev) => ({ ...prev, ...next }));
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
        toast.error("Vui lòng chọn tỉnh/thành phố, phường/xã và nhập street detail.");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step >= STEP_COUNT) {
      try {
        await createGarageBranch({
          garageId,
          payload: {
            name: "Chi nhánh mới",
            description: "",
            coverImageUrl: "",
            phoneNumber: "",
            taxCode: "",
            address: {
              provinceCode: address.provinceCode,
              wardCode: address.wardCode,
              streetDetail: address.streetDetail.trim(),
            },
            workingHours: { schedule: {} },
          },
        });
        goExit();
      } catch {
        /* toast lỗi đã xử lý trong hook */
      }
    }
  }, [step, garageId, address, createGarageBranch, goExit]);

  const step1NextDisabled = step === 1 && !isStep1AddressComplete(address);

  return (
    <div className="flex min-h-dvh flex-col bg-muted/25">
      <NewBranchHeader garageId={garageId} exitHref={exitHref} />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background">
        <div className="w-full px-4 py-6 md:px-6">
          <div className="mx-auto w-full max-w-3xl pb-28 md:pb-32">
            {step === 1 ? <NewBranchStep1 address={address} onAddressChange={handleAddressChange} /> : null}
            {step === 2 ? <NewBranchStep2 /> : null}
            {step === 3 ? <NewBranchStep3 /> : null}
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
        nextDisabled={step1NextDisabled}
        isNextLoading={isCreatingBranch}
      />
    </div>
  );
}
