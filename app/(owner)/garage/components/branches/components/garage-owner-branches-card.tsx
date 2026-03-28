import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockOwnerBranch } from "@/lib/mocks/owner-garage-mock";

import { GarageOwnerBranchCard } from "./garage-owner-branch-card";

interface GarageOwnerBranchesCardProps {
  branches: MockOwnerBranch[];
}

export function GarageOwnerBranchesCard({ branches }: GarageOwnerBranchesCardProps) {
  return (
    <Card className="border-border/80 bg-card/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Các chi nhánh của tôi</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="grid gap-4 sm:grid-cols-2">
          {branches.map((branch) => (
            <li key={branch.id}>
              <GarageOwnerBranchCard branch={branch} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
