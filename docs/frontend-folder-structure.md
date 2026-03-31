# Cấu trúc thư mục Frontend (Next.js App Router)

Tài liệu mô tả cách tổ chức code UI sau refactor: **tách surface Desktop / Mobile theo feature**, không gom hết vào một “responsive file” duy nhất. **`hooks/` và `lib/` giữ nguyên**, không di chuyển.

---

## Nguyên tắc

| Nguyên tắc | Mô tả |
|------------|--------|
| **Feature-first** | Nhóm theo luồng nghiệp vụ (`user-home`, `vehicle-create`), không nhóm theo `Desktop`/`Mobile` ở cấp cao nhất. |
| **Surface trong feature** | Trong mỗi feature: thư mục `desktop/` và `mobile/` (hoặc file orchestrator gọi cả hai). |
| **`components/shell/`** | Khung layout (nền, bottom nav, vùng scroll) — **không** chứa logic xe / form tạo xe. |
| **`components/shared/`** | Component dùng **nhiều feature** hoặc “atom” dùng chung (badge, dialog, tab con, …). |
| **`components/ui/`** | Design system (Radix/Shadcn) — không business. |
| **`hooks/` + `lib/`** | Data layer, API, config — **import từ feature/component qua `@/hooks/...`, `@/lib/...`**. |

---

## Sơ đồ thư mục (rút gọn)

```text
app/
  (user)/
    layout.tsx              # Bọc shell user
    page.tsx                # Server Component — chỉ `return <UserHomePageClient />`
    vehicle/[vehicleId]/
      page.tsx              # Server Component — chỉ `return <VehicleDetailPageClient />`
  layout.tsx                # Root + RootShell

components/
  shell/                      # Layout “khung”
    root-shell.tsx
    user-layout-surfaces.tsx
    mobile-bottom-nav.tsx
  shared/                     # Dùng chung nhiều luồng
    LicensePlateBadge.tsx
    UpdateOdometerDialog.tsx
    DesktopCenterOverviewTab.tsx   # (có thể đổi tên/di chuyển dần vào feature)
    …
  ui/                         # Button, Dialog primitive, Tabs, …
  odometer/                   # Widget odometer (drum, …)
  app-sidebar.tsx             # (các layout khác nếu có)

features/
  user-home/
    index.ts                  # Barrel export công khai
    types.ts                  # UserHomeSharedProps
    user-home-page.client.tsx # Logic hooks/state trang home (`"use client"`)
    vehicle-detail-page.client.tsx  # Trang chi tiết xe (`"use client"`)
    user-home-views.tsx       # UserHomeMobileView + UserHomeDesktopView
    desktop/
      center-panel.tsx        # Panel giữa (trước: DesktopCenterPanel)
      vehicle-column.tsx      # Cột xe (trước: DesktopVehicleColumn)
      right-panel.tsx         # Cột phải (trước: DesktopRightPanel)
    mobile/
      vehicle-home.tsx        # Home danh sách xe mobile (trước: MobileVehicleHome)

  vehicle-create/
    index.ts
    create-vehicle-flow.tsx   # Luồng tạo xe (trước: DesktopCreateVehicleFlow)

hooks/                        # Không đổi
lib/                          # Không đổi
```

---

## App Router: tránh `"use client"` trên `page.tsx`

- **`page.tsx`** nên là **Server Component** (không khai báo `"use client"`) để sau này có thể thêm `metadata`, fetch server, v.v.
- Toàn bộ **hooks / `useState` / `useParams` / React Query** đặt trong file **`*.client.tsx`** trong `features/…`, đầu file có `"use client"`.
- `page.tsx` chỉ import và render: `return <UserHomePageClient />`.

Các route user đã áp dụng: `app/(user)/page.tsx`, `app/(user)/vehicle/[vehicleId]/page.tsx`.

---

## Import gợi ý

```ts
// Home (mobile + desktop views)
import { UserHomeMobileView, UserHomeDesktopView } from "@/features/user-home";

// Panel giữa / cột (khi cần import trực tiếp)
import { CenterPanel, VehicleColumn, RightPanel } from "@/features/user-home";

// Luồng tạo xe
import { CreateVehicleFlow } from "@/features/vehicle-create";

// Shell
import { UserLayoutSurfaces } from "@/components/shell/user-layout-surfaces";
import { RootShell } from "@/components/shell/root-shell";

// Shared UI
import { LicensePlateBadge } from "@/components/shared/LicensePlateBadge";

// Data — luôn từ hooks / lib
import { useUserVehicles } from "@/hooks/useUserVehice";
```

---

## Đặt file mới ở đâu?

| Bạn đang làm | Đặt vào |
|----------------|---------|
| Màn hình / luồng mới của **home xe** (desktop hoặc mobile) | `features/user-home/desktop/` hoặc `features/user-home/mobile/` |
| Luồng **tạo / khai báo xe** | `features/vehicle-create/` |
| Component dùng ở **≥ 2 feature** khác nhau | `components/shared/` |
| Chỉ thuộc **một feature** nhưng là “tab con” của center | Có thể tạm `components/shared/` hoặc dần chuyển vào `features/user-home/desktop/` |
| **Khung** trang (nav, vùng scroll, safe area) | `components/shell/` |
| **Primitive** form / overlay | `components/ui/` |

---

## Tên export đã đổi (mapping)

| Trước | Sau |
|--------|-----|
| `DesktopCenterPanel` | `CenterPanel` |
| `DesktopVehicleColumn` | `VehicleColumn` |
| `DesktopRightPanel` | `RightPanel` |
| `MobileVehicleHome` | `VehicleHome` |
| `DesktopCreateVehicleFlow` | `CreateVehicleFlow` |

---

## Bảo trì sau này

- Thêm tính năng home: mở `features/user-home/`, chọn `desktop/` hoặc `mobile/`.
- Tránh nhét tiếp vào `shared/` nếu chỉ một feature dùng — giảm “đống chung” khó tìm.
- Giữ `app/*/page.tsx` **mỏng**: hook + compose view, ít JSX phức tạp.

---

*Tài liệu này phản ánh cấu trúc tại thời điểm tạo; nếu đổi tree, nên cập nhật file này cùng PR.*
