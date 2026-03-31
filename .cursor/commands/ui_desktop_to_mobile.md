---
description: Kích hoạt UI Desktop → Mobile — refactor responsive, sidebar/drawer, bảng→card, form & touch, Tailwind/Styled Components, SSR-safe. Dùng khi tối ưu mobile cho React/Next.js.
---

Kích hoạt skill **UI Desktop → Mobile** từ `.cursor/skills/ui-desktop-to-mobile/SKILL.md` và các `references/*.md` tương ứng.

<request>
$input
</request>

## Rules

- Đọc và tuân thủ **SKILL.md** (workflow, bảng Always-Apply, SSR).
- Chọn nhánh đúng:
  - Layout / trang → `references/layout-conversion.md`
  - Navigation → `references/navigation-conversion.md`
  - Table / grid → `references/table-to-card.md`
  - Form → `references/form-mobile.md`
  - Tailwind → `references/tailwind-responsive.md`
  - Styled Components → `references/styled-components-responsive.md`
  - Hooks, bottom sheet, `--vh`, scroll lock → `references/react-mobile-patterns.md`
- **Touch**: tối thiểu **44×44px**; input **≥ 16px** (tránh zoom iOS); khoảng cách tap **≥ 8px**.
- **SSR (Next.js)**: ưu tiên ẩn/hiện bằng class responsive (`md:hidden` / `hidden md:block`), tránh `useMediaQuery` gây lệch hydrate trừ khi có chiến lược rõ.
- Cần audit touch: có thể chạy `scripts/audit_touch_targets.js` trong thư mục skill (hoặc mô tả output cho user).
- **Cấu trúc file**: giữ convention dự án; không đổi kiến trúc thư mục trừ khi user yêu cầu.
