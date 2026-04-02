import { parseBranchTab } from "../components/branch-tab-config";

import BranchOverviewPage from "./components/overview/page";
import BranchProductsPage from "./components/products/page";
import BranchProfilePage from "./components/profile/page";
import BranchServicesPage from "./components/services/page";
import BranchStaffPage from "./components/staff/page";

export default async function GarageDashboardBranchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; branchId: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { id, branchId } = await params;
  const sp = await searchParams;
  const rawTab = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const tab = parseBranchTab(rawTab);

  const pageParams = Promise.resolve({ id, branchId });

  return (
    <div className="p-4 md:p-6">
      {tab === "overview" ? <BranchOverviewPage params={pageParams} /> : null}
      {tab === "profile" ? <BranchProfilePage params={pageParams} /> : null}
      {tab === "staff" ? <BranchStaffPage /> : null}
      {tab === "services" ? <BranchServicesPage params={pageParams} /> : null}
      {tab === "products" ? <BranchProductsPage params={pageParams} /> : null}
    </div>
  );
}
