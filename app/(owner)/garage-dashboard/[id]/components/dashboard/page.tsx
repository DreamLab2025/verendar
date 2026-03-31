import { getMockOwnerGarageById, mockOwnerBranches } from "@/lib/mocks/owner-garage-mock";

import { GarageStats } from "./components/garage-stats";

export default async function GarageDashboardOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const garage = getMockOwnerGarageById(id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Tổng quan</h2>
        <p className="text-sm text-muted-foreground md:text-base">Thống kê nhanh garage (mock)</p>
      </div>
      <GarageStats garage={garage} branchCount={mockOwnerBranches.length} />
    </div>
  );
}
