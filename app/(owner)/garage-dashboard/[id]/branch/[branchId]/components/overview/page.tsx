export default async function BranchOverviewPage({
    params,
}: {
  params: Promise<{ id: string; branchId: string }>;
}) {

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Tổng quan</h2>
        <p className="text-sm text-muted-foreground md:text-base">
          Coming soon...
        </p>
      </div>
    </div>
  );
}
