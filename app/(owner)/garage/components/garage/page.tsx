import { mockOwnerGarage } from "@/lib/mocks/owner-garage-mock";

import { GarageOwnerMyGarageCard } from "./components/garage-owner-my-garage-card";

export default function GarageOwnerGarageSectionPage() {
  const dashboardHref = `/garage-dashboard/${mockOwnerGarage.id}`;

  return <GarageOwnerMyGarageCard garage={mockOwnerGarage} dashboardHref={dashboardHref} />;
}
