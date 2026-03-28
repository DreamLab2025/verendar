import { MapPin, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockOwnerBranch } from "@/lib/mocks/owner-garage-mock";
import { cn } from "@/lib/utils";

interface GarageDashboardBranchCardProps {
  branch: MockOwnerBranch;
}

export function GarageDashboardBranchCard({ branch }: GarageDashboardBranchCardProps) {
  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <CardTitle className="text-base">{branch.name}</CardTitle>
        <Badge variant="outline" className={cn(branch.status === "Active" && "border-primary/40 text-primary")}>
          {branch.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p className="flex gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {branch.address}
        </p>
        <p className="flex gap-2">
          <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
          {branch.phoneNumber}
        </p>
      </CardContent>
    </Card>
  );
}
