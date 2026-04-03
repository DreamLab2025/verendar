import { AdminUsersList } from "@/features/users-management/admin-users-list";

export const metadata = {
    title: "Quản lý người dùng | Verendar Admin",
    description: "Quản lý danh sách người dùng trong hệ thống Verendar",
};

export default function AdminUsersPage() {
    return (
        <div className="flex-1 p-4 md:px-8 md:py-6">
            <AdminUsersList />
        </div>
    );
}
