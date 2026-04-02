import { AdminFeedbackList } from "@/features/user-feedback/admin-feedback-list";

export const metadata = {
  title: "Quản lý phản hồi | Verendar Admin",
  description: "Quản lý phản hồi của hệ thống Verendar",
};

export default function AdminFeedbackPage() {
  return (
    <div className="flex-1 p-4 md:px-8 md:py-6">
      <AdminFeedbackList />
    </div>
  );
}
