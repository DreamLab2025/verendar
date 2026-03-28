# Plan: Garage + chi nhánh (theo mô hình Company / Dashboard-Company)

## Mục tiêu

Áp dụng cùng ý tưởng routing như `saler/company` và `saler/dashboard-company`: một lớp **chọn ngữ cảnh**, một lớp **làm việc** gắn ID cố định trong URL.

## Phân lớp URL (đề xuất)

| Lớp | Vai trò | Ví dụ |
|-----|---------|--------|
| Danh sách / chọn garage | User chọn garage (sở hữu / tham gia) | `/garage` hoặc `/owner/garage` |
| Dashboard garage | Toàn bộ module sau khi đã có `garageId` | `/dashboard-garage/[garageId]/...` |
| Chi nhánh (nếu dữ liệu tách theo branch) | Segment con hoặc filter | `/dashboard-garage/[garageId]/branches/[branchId]/...` |

- Root `/dashboard-garage` (không có id): redirect về `/garage` (giống `dashboard-company` → `company`).
- Mọi menu sidebar build href có prefix `garageId` (và `branchId` nếu dùng nested).

## Chi nhánh: nested route hay filter?

- **Nested `[branchId]`** khi: phân quyền, báo cáo, kho, lịch hẹn… gắn chặt từng chi nhánh; cần share link đúng ngữ cảnh.
- **Query / state (`?branchId=` hoặc context)** khi: chỉ là bộ lọc trên cùng dataset garage, không cần URL độc lập cho từng chi nhánh.

## Layout & UI

- Layout danh sách garage: sidebar đơn giản (hoặc header-only), tập trung vào chọn garage.
- Layout dashboard: sidebar riêng (nav theo module), breadcrumb theo `garageId` / `branchId`.
- Fullscreen cho form dài (tạo/sửa) giống pattern `properties/new` / `properties/action` nếu có màn tương tự.

## State & API

- Mọi hook fetch: nhận `garageId` (và `branchId` nếu có) từ `useParams()` hoặc props; tránh chỉ lưu trong memory không đồng bộ URL.
- Invalidate React Query theo key có `garageId` / `branchId` để đổi garage/branch không dính cache sai.

## Việc cần làm (checklist)

- [ ] Chốt tên route và segment (`garage`, `dashboard-garage`, `branches`).
- [ ] Tạo `app/.../garage/page.tsx` (danh sách + điều hướng vào dashboard).
- [ ] Tạo `app/.../dashboard-garage/layout.tsx` + `app-sidebar` (hoặc tái cấu trúc component dùng chung).
- [ ] Tạo `dashboard-garage/[garageId]/page.tsx` (home dashboard).
- [ ] Quyết định và implement nhánh: `[branchId]` nested hoặc filter.
- [ ] Team / branch switcher trong sidebar (tương tự `team-switcher`).
- [ ] Redirect guard: không có quyền garage → về danh sách hoặc 403.

## Ghi chú

Tách codebase garage khỏi `saler` nếu là product/route group khác; tránh trùng middleware và layout nếu không cùng role.
