# Garage chi nhánh: lọc Combo / Phụ tùng / Dịch vụ theo danh mục dịch vụ

## 1. Vấn đề

**Frontend (dashboard chi nhánh → tab Dịch vụ)** đang:

- Gọi `GET /api/v1/service-categories` để hiển thị bảng danh mục.
- Cho phép chọn một danh mục và kỳ vọng **chỉ hiển thị** combo, phụ tùng và dịch vụ **thuộc danh mục đó** (theo `serviceCategoryId` — cùng khái niệm với field khi **POST** tạo mới).

**Backend hiện chưa có** hợp đồng rõ ràng để:

1. **Lọc phía server** các danh sách list theo `serviceCategoryId`, **hoặc**
2. **Trả về** field `serviceCategoryId` (và khi cần `serviceCategoryName`) trên **từng item** của list để frontend lọc đúng mà không đoán mò.

Nếu không có (1) hoặc (2), UI không thể đồng bộ với nghiệp vụ “chọn danh mục → xem đúng dữ liệu của danh mục”, đặc biệt với **combo** và **phụ tùng** (hiện thường không có field gắn danh mục trên response list).

---

## 2. Hướng xử lý đề xuất (BE)

Ưu tiên **một trong hai** (có thể làm cả hai):

| Cách                        | Mô tả                                                                                                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Query trên API list**  | Thêm tham số query tùy chọn `ServiceCategoryId` (UUID) trên các endpoint list dưới đây. Khi có giá trị, chỉ trả các bản ghi thuộc danh mục đó.                                           |
| **B. Field trên từng item** | Mỗi phần tử trong `data[]` của response list có `serviceCategoryId` (nullable nếu chưa gán danh mục). Khuyến nghị thêm `serviceCategoryName` (nullable) để hiển thị không cần join thêm. |

- **A** giảm payload và đúng nghiệp vụ filter.
- **B** giúp frontend lọc/cache và hiển thị cột “Danh mục” ngay cả khi không gọi filter.

---

## 3. Endpoint cần thống nhất

Các endpoint list theo chi nhánh (đã có hoặc tương đương):

| Endpoint                      | Nội dung list                      |
| ----------------------------- | ---------------------------------- |
| `GET /api/v1/garage-bundles`  | Combo theo chi nhánh               |
| `GET /api/v1/garage-products` | Phụ tùng / sản phẩm theo chi nhánh |
| `GET /api/v1/garage-services` | Dịch vụ (nhân công) theo chi nhánh |

Tham số chung hiện có (ví dụ): `branchId`, `activeOnly`, `PageNumber`, `PageSize`, `IsDescending`, …

### 3.1. Tham số query cần bổ sung (nếu làm phương án A)

| Tên (query)         | Kiểu            | Bắt buộc | Ý nghĩa                                                                                                                               |
| ------------------- | --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ServiceCategoryId` | `uuid` (string) | Không    | Khi có: chỉ trả item có `serviceCategoryId` trùng giá trị. Khi không có: giữ hành vi hiện tại (toàn bộ theo chi nhánh + filter khác). |

**Lưu ý đặt tên:** thống nhất **PascalCase** như các query khác (`PageNumber`, `branchId` tùy convention repo — giữ đúng chuẩn đang dùng trên gateway).

---

## 4. Field cần có trên từng phần tử `data[]` (nếu làm phương án B hoặc bổ sung)

Để đồng bộ với **POST** (body thường có `serviceCategoryId`) và với màn **chọn danh mục**:

| Field                 | Kiểu               | Áp dụng                              | Ghi chú                                                                                          |
| --------------------- | ------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `serviceCategoryId`   | `uuid` \| `null`   | Bundle, Product, Service (list item) | Khóa ngoại logic tới `GET /api/v1/service-categories`. Null = chưa gán danh mục hoặc dữ liệu cũ. |
| `serviceCategoryName` | `string` \| `null` | Tùy chọn, mọi loại                   | Denormalize để UI không cần gọi thêm master.                                                     |

**Riêng `garage-services`:** response list hiện đã có thể có `serviceCategoryId` / `serviceCategoryName` — cần **đảm bảo** luôn điền đúng khi tạo/cập nhật từ phía BE.

**Riêng `garage-bundles` và `garage-products`:** cần **thiết kế model + migration** nếu hiện chưa có cột / field này — đây là phần FE đang thiếu để lọc theo danh mục.

---

## 5. Mapping với luồng POST (thống nhất contract)

Khi tạo mới (POST) combo / product / service cho chi nhánh, body nên có (hoặc đã có):

- `serviceCategoryId` (UUID) — bắt buộc hoặc optional tùy nghiệp vụ; **GET list nên trả lại cùng field** để dashboard và báo cáo khớp.

Yêu cầu: **cùng một ý nghĩa và cùng tên field** (`serviceCategoryId`) giữa POST response / GET detail / GET list.

---

## 6. Tóm tắt gửi BE

1. **Vấn đề:** FE cần lọc hoặc hiển thị combo / product / service theo **danh mục dịch vụ** (`service-categories`); BE chưa có **filter list theo danh mục** và/hoặc chưa **trả `serviceCategoryId`** trên bundle & product list.
2. **Yêu cầu:**
   - (Khuyến nghị) Hỗ trợ query `ServiceCategoryId` trên `garage-bundles`, `garage-products`, `garage-services`.
   - Trả `serviceCategoryId` (và nên có `serviceCategoryName`) trên mỗi item list khi có dữ liệu.
3. **Mục tiêu:** Dashboard chọn một dòng trong bảng `service-categories` thì chỉ thấy (hoặc thấy đúng nhãn) combo / phụ tùng / dịch vụ thuộc danh mục đó, thống nhất với field dùng khi tạo mới.

---

_Tài liệu này mô tả nhu cầu phía frontend; điều chỉnh tên query/param nếu API gateway của dự án quy ước khác (camelCase vs PascalCase)._
