/** Nhãn trạng thái booking & ánh xạ thanh tiến trình (yêu cầu / chi tiết). */

export function bookingStatusPillLabel(status: string): string {
  const map: Record<string, string> = {
    Pending: "Chờ xử lý",
    AwaitingConfirmation: "Chờ XL",
    Confirmed: "Đã xác nhận",
    InProgress: "Đang làm",
    Completed: "Xong",
    Cancelled: "Đã hủy",
  };
  return map[status] ?? status;
}

/** Nhãn đầy đủ (badge, danh sách). */
export function bookingStatusLabelVi(status: string): string {
  const map: Record<string, string> = {
    Pending: "Chờ xử lý",
    AwaitingConfirmation: "Chờ xác nhận",
    Confirmed: "Đã xác nhận",
    InProgress: "Đang xử lý",
    Completed: "Hoàn thành",
    Cancelled: "Đã hủy",
  };
  return map[status] ?? status;
}

/** Cột đang active trên thanh 3 mốc (0–2). */
export function statusToMilestoneIndex(status: string): number {
  if (status === "Cancelled") return -1;
  if (status === "Completed") return 2;
  if (status === "InProgress") return 1;
  if (status === "Confirmed") return 0;
  if (status === "Pending" || status === "AwaitingConfirmation") return 0;
  return 0;
}

/** Nhãn từng cột — cột 0 khi đang chờ xác nhận khác với khi đã qua bước đó. */
export function milestoneLabelAtIndex(index: number, status: string, activeIndex: number): string {
  if (index === 0) {
    if (activeIndex === 0 && (status === "Pending" || status === "AwaitingConfirmation")) return "Chờ xác nhận";
    return "Đã xác nhận";
  }
  if (index === 1) return "Đang xử lý";
  return "Hoàn tất";
}
