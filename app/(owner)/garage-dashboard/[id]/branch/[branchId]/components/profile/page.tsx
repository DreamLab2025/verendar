import { BranchProfileCard } from "./components/branch-card";
import { BranchProfileHeader } from "./components/branch-profile-header";

export default async function BranchProfilePage({
  params,
}: {
  params: Promise<{ id: string; branchId: string }>;
}) {
  const { id, branchId } = await params;

  return (
    <div className="space-y-6">
      <BranchProfileHeader garageId={id} branchId={branchId} />
      <BranchProfileCard garageId={id} branchId={branchId} />
    </div>
  );
}
