import { mockOwnerBranches } from "@/lib/mocks/owner-garage-mock";

import { GarageOwnerBranchesCard } from "./components/garage-owner-branches-card";

export default function GarageOwnerBranchesSectionPage() {
  return <GarageOwnerBranchesCard branches={mockOwnerBranches} />;
}
