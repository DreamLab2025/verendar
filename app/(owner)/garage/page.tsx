import GarageOwnerBranchesSectionPage from "./components/branches/page";
import GarageOwnerGarageSectionPage from "./components/garage/page";

export default function OwnerGaragePage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <GarageOwnerGarageSectionPage />
      <GarageOwnerBranchesSectionPage />
    </div>
  );
}
