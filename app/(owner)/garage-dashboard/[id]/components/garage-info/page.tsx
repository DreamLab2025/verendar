import { GarageInfoCard } from "./components/garage-info-card";
import { GarageInfoHeader } from "./components/garage-info-header";

export default async function GarageDashboardGarageInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <GarageInfoHeader garageId={id} />
      <GarageInfoCard garageId={id} />
    </div>
  );
}
