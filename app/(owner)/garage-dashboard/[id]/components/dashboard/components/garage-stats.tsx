import { Activity, Building2, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGarageStatusLabelVi } from "@/lib/api/services/fetchGarage";
import type { MockOwnerGarage } from "@/lib/mocks/owner-garage-mock";

interface GarageStatsProps {
  garage: MockOwnerGarage | null;
  branchCount: number;
}

export function GarageStats({ garage, branchCount }: GarageStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="border-border/70 bg-card/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chi nhánh</CardTitle>
          <Building2 className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{branchCount}</p>
          <CardDescription>Đang hoạt động (mock)</CardDescription>
        </CardContent>
      </Card>
      <Card className="border-border/70 bg-card/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trạng thái garage</CardTitle>
          <Activity className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{getGarageStatusLabelVi(garage?.status)}</p>
          <CardDescription>{garage?.taxCode ? `MST ${garage.taxCode}` : "Mock"}</CardDescription>
        </CardContent>
      </Card>
      <Card className="border-border/70 bg-card/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Khách / lượt xem</CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">—</p>
          <CardDescription>Kết nối API sau</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
