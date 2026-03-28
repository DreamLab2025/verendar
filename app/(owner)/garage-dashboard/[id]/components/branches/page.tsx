import { GarageDashboardBranchesList } from "./components/garage-dashboard-branches-list";
import { GarageDashboardBranchesPageHeader } from "./components/garage-dashboard-branches-page-header";
import { mockOwnerBranches } from "@/lib/mocks/owner-garage-mock";

export default function GarageDashboardBranchesPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <GarageDashboardBranchesPageHeader />
      <GarageDashboardBranchesList branches={mockOwnerBranches} />
    </div>
  );
}
