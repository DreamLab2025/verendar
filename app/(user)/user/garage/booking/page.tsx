import { redirect } from "next/navigation";

/** Đường dẫn cũ — chuyển sang checkout có stepper. */
export default async function UserGarageBookingDraftPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string }>;
}) {
  const sp = await searchParams;
  const bid = sp.branchId;
  redirect(
    bid
      ? `/user/garage/checkout?branchId=${encodeURIComponent(bid)}`
      : "/user/garage/checkout",
  );
}
