export default async function BranchServicesPage({
  params,
}: {
  params: Promise<{ id: string; branchId: string }>;
}) {
  await params;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Dịch vụ</h2>
        <p className="text-sm text-muted-foreground md:text-base">Dịch vụ garage cung cấp tại chi nhánh.</p>
      </div>
    </div>
  );
}
