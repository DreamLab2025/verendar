import { AdminGaragesList } from "@/features/garages-management/admin-garages-list";

export const metadata = {
  title: "Quản lý garage | Verendar Admin",
  description: "Danh sách garage trong hệ thống Verendar",
};

export default function AdminGaragesPage() {
  return (
    <div className="flex-1 p-4 md:px-8 md:py-6">
      <AdminGaragesList />
    </div>
  );
}
