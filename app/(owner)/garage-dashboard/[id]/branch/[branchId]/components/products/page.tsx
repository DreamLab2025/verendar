export default async function BranchProductsPage({
  params,
}: {
  params: Promise<{ id: string; branchId: string }>;
}) {
  await params;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Sản phẩm</h2>
        <p className="text-sm text-muted-foreground md:text-base">Sản phẩm / phụ tùng tại chi nhánh.</p>
      </div>
    </div>
  );
}
