import { GarageDashboardHomeNextStepsCard } from "./components/garage-dashboard-home-next-steps-card";
import { GarageDashboardHomeStatsGrid } from "./components/garage-dashboard-home-stats-grid";
import { getMockOwnerGarageById, mockOwnerBranches } from "@/lib/mocks/owner-garage-mock";

export default async function GarageDashboardHomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const garage = getMockOwnerGarageById(id);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <GarageDashboardHomeStatsGrid garage={garage} branchCount={mockOwnerBranches.length} />
      <GarageDashboardHomeNextStepsCard />
    </div>
  );
}
