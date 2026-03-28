import type { MockOwnerBranch } from "@/lib/mocks/owner-garage-mock";

import { GarageDashboardBranchCard } from "./garage-dashboard-branch-card";

interface GarageDashboardBranchesListProps {
  branches: MockOwnerBranch[];
}

export function GarageDashboardBranchesList({ branches }: GarageDashboardBranchesListProps) {
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {branches.map((branch) => (
        <li key={branch.id}>
          <GarageDashboardBranchCard branch={branch} />
        </li>
      ))}
    </ul>
  );
}
