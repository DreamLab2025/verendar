import { SettingsCard } from "./components/settings-card";

export default async function GarageDashboardSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Cài đặt</h2>
        <p className="text-sm text-muted-foreground md:text-base">Cấu hình garage và tài khoản.</p>
      </div>
      <SettingsCard garageId={id} />
    </div>
  );
}
