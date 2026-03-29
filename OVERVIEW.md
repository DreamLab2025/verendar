# Thông báo (Notification) — hướng dẫn cho Frontend

## Gọi API nhanh

| Mục | Giá trị |
|-----|---------|
| **Base URL** (qua gateway) | `{GATEWAY}/api/v1/notifications` — ví dụ `https://...:8080/api/v1/notifications` |
| **Auth** | Header `Authorization: Bearer <access_token>` — bắt buộc cho mọi route REST bên dưới |
| **JSON** | Body/response dùng **camelCase**. Enum (priority, type, status, `level`…) là **chuỗi** (ví dụ `"High"`, `"Medium"`). |

---

## Mọi response đều bọc trong `ApiResponse`

Luôn parse lớp ngoài trước, rồi mới dùng `data` / `metadata`.

```json
{
  "isSuccess": true,
  "statusCode": 200,
  "message": "Success",
  "data": {},
  "metadata": null
}
```

- **Thành công:** `isSuccess === true`, đọc `data` (và `metadata` nếu có).
- **Lỗi:** `isSuccess === false`, xem `statusCode` + `message` (401 chưa đăng nhập, 404 không có thông báo, …).

---

## Các endpoint (copy path)

| Cách gọi | `data` khi thành công |
|----------|----------------------|
| `GET /api/v1/notifications?pageNumber=1&pageSize=10` | Mảng thông báo (xem bảng field bên dưới) |
| `GET /api/v1/notifications/status` | `{ unReadCount, hasUnread }` |
| `GET /api/v1/notifications/{id}` | Một object cùng shape với phần tử trong list |
| `POST /api/v1/notifications/read-all` | Số nguyên — số bản ghi vừa đánh dấu đã đọc |
| `POST /api/v1/notifications/{id}/read` | `true` / `false` |
| `DELETE /api/v1/notifications/{id}` | `true` — xóa mềm |

**Phân trang (chỉ list):** `pageNumber` ≥ 1, `pageSize` 1…100 (mặc định backend thường 10). Khi có phân trang, **`metadata`** là object phân trang:

| Field `metadata` | Ý nghĩa |
|------------------|---------|
| `pageNumber`, `pageSize` | Trang hiện tại |
| `totalItems` | Tổng số bản ghi |
| `totalPages` | Tổng số trang |
| `hasNextPage`, `hasPreviousPage` | Có trang sau/trước |

---

## Shape từng thông báo (`data[]` hoặc `data` chi tiết)

Dùng chung cho **list** và **detail** (cùng tên field):

| Field | Kiểu gợi ý | Ghi chú FE |
|-------|------------|------------|
| `id` | `string` (UUID) | Dùng cho `GET /{id}`, mark read, delete |
| `title`, `message` | `string` | List vẫn có đủ để hiển thị dòng |
| `notificationType`, `priority`, `status` | `string` (enum) | Priority: `Low` \| `Medium` \| `High` |
| `entityType` | `string \| null` | Deep link / context |
| `entityId` | `string \| null` (UUID) | |
| `actionUrl` | `string \| null` | URL điều hướng nếu có |
| `isRead` | `boolean` | |
| `readAt` | `string \| null` (ISO date) | |
| `createdAt` | `string` (ISO date) | |
| **`maintenanceItems`** | `array \| null` | **Quan trọng — xem mục sau** |

### `maintenanceItems[]` (khi có dữ liệu)

| Field | Ghi chú |
|-------|---------|
| `partCategoryName` | Tên nhóm phụ tùng |
| `description` | Mô tả (optional) |
| `currentOdometer`, `targetOdometer` | Số km |
| `percentageRemaining` | Phần trăm còn lại (decimal) |
| `estimatedNextReplacementDate` | ISO date hoặc null |
| `level` | Chuỗi enum nhắc (từ Vehicle contracts, ví dụ mức nhắc) |

---

## Luồng UI khuyến nghị

1. **Trang danh sách:** `GET .../notifications?pageNumber=&pageSize=` — render `title`, `message`, `isRead`, `createdAt`, badge từ `GET .../status` nếu cần.
2. **Không dựa vào `maintenanceItems` trên list** — API luôn trả `maintenanceItems: null` ở danh sách (tối ưu payload).
3. **Khi mở chi tiết / expand:** `GET .../notifications/{id}` — lúc này mới có `maintenanceItems` (mảng) cho thông báo bảo dưỡng có payload.
4. **Đánh dấu đọc:** `POST .../{id}/read` hoặc `POST .../read-all` rồi cập nhật local state / refetch `status`.

---

## SignalR (realtime)

- URL: `{GATEWAY}/hubs/notifications`.
- JWT: với path bắt đầu bằng `/hubs`, backend đọc token từ **`?access_token=<jwt>`** hoặc header **`Authorization: Bearer <jwt>`** (SignalR client thường dùng query vì một số transport không gửi header được).

---

## TypeScript gợi ý (rút gọn)

```ts
type ApiResponse<T> = {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T;
  metadata?: PagingMeta | null;
};

type PagingMeta = {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  priority: string;
  status: string;
  entityType: string | null;
  entityId: string | null;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  maintenanceItems: MaintenanceLine[] | null;
};

type MaintenanceLine = {
  partCategoryName: string;
  description: string | null;
  currentOdometer: number;
  targetOdometer: number;
  percentageRemaining: number;
  estimatedNextReplacementDate: string | null;
  level: string;
};
```

---

_Cập nhật theo backend Notification service._
