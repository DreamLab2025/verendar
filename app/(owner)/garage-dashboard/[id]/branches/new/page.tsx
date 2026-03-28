import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function GarageDashboardNewBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Tạo chi nhánh</h2>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={`/garage-dashboard/${id}?tab=branches`}>Quay lại danh sách</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">Form tạo chi nhánh đang được hoàn thiện.</p>
    </div>
  );
}
