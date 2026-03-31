import { redirect } from "next/navigation";

/** Không có garageId trong URL — quay lại màn chọn / xem garage (theo pland.md). */
export default function GarageDashboardIndexPage() {
  redirect("/garage");
}
