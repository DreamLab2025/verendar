import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGarageStatusLabelVi, isGarageStatusActive, type GarageMeDto } from "@/lib/api/services/fetchGarage";

interface GarageOwnerMyGarageCardProps {
  garage: GarageMeDto;
  dashboardHref: string;
}

export function GarageOwnerMyGarageCard({ garage, dashboardHref }: GarageOwnerMyGarageCardProps) {
  const businessName = garage.businessName ?? "Garage";
  const shortName = garage.shortName ?? "—";

  return (
    <Card className="border-border/80 bg-card/80 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Garage của tôi</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Link
          href={dashboardHref}
          className="group block rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 transition-all duration-200 hover:border-primary/35 hover:shadow-md">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-accent/5" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary shadow-inner">
                  <Building2 className="size-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold md:text-xl">{businessName}</p>
                  <p className="text-sm text-muted-foreground">{shortName}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Badge variant={isGarageStatusActive(garage.status) ? "default" : "secondary"}>
                  {getGarageStatusLabelVi(garage.status)}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-1.5">
                  Vào dashboard
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
            <div className="relative mt-4 space-y-2 border-t border-border/50 pt-4 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Mã số thuế:</span> {garage.taxCode ?? "—"}
              </p>
              <p>
                <span className="font-medium text-foreground">Số chi nhánh:</span> {garage.branchCount}
              </p>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
