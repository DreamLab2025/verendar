import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function GarageDashboardHomeNextStepsCard() {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">Nhanh</CardTitle>
        <CardDescription>Các bước tiếp theo khi có API thật</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <ul className="list-inside list-disc space-y-2">
          <li>
            Đồng bộ dữ liệu garage theo{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">garageId</code> từ URL
          </li>
          <li>
            Invalidate React Query theo key có <code className="rounded bg-muted px-1 py-0.5 text-xs">garageId</code>
          </li>
          <li>Thêm chi nhánh nested hoặc filter theo pland.md</li>
        </ul>
      </CardContent>
    </Card>
  );
}
