import GarageDashboardBranchesPage from "./components/branches/page";
import GarageDashboardOverviewPage from "./components/dashboard/page";
import GarageDashboardGarageInfoPage from "./components/garage-info/page";
import GarageDashboardSettingsPage from "./components/settings/page";

type Tab = "overview" | "garage-info" | "branches" | "settings";

function parseTab(raw: string | string[] | undefined): Tab {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "garage-info" || v === "branches" || v === "settings") return v;
  return "overview";
}

export default async function GarageDashboardIdPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tab = parseTab(sp.tab);

  const pageParams = Promise.resolve({ id });

  return (
    <div className="p-4 md:p-6">
      {tab === "overview" ? <GarageDashboardOverviewPage params={pageParams} /> : null}
      {tab === "garage-info" ? <GarageDashboardGarageInfoPage params={pageParams} /> : null}
      {tab === "branches" ? <GarageDashboardBranchesPage /> : null}
      {tab === "settings" ? <GarageDashboardSettingsPage params={pageParams} /> : null}
    </div>
  );
}
