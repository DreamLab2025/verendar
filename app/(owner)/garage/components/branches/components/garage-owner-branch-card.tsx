import { MapPin, Phone, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockOwnerBranch } from "@/lib/mocks/owner-garage-mock";
import { cn } from "@/lib/utils";

interface GarageOwnerBranchCardProps {
  branch: MockOwnerBranch;
}

export function GarageOwnerBranchCard({ branch }: GarageOwnerBranchCardProps) {
  return (
    <Card className="h-full border-border/70 bg-card/60 transition-shadow hover:shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-snug">{branch.name}</CardTitle>
          <Badge variant="outline" className={cn("shrink-0", branch.status === "Active" && "border-primary/40 text-primary")}>
            {branch.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p className="flex gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary/80" aria-hidden />
          <span>{branch.address}</span>
        </p>
        <p className="flex gap-2">
          <Phone className="mt-0.5 size-4 shrink-0 text-primary/80" aria-hidden />
          <span>{branch.phoneNumber}</span>
        </p>
        <div className="flex items-center gap-2 text-foreground">
          <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
          <span className="font-medium">{branch.averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground">({branch.reviewCount} đánh giá)</span>
        </div>
      </CardContent>
    </Card>
  );
}
