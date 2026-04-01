# Luồng Hiển Thị Branch → Booking

## 1. Tìm kiếm Branch (Public, không cần auth)

### Map Search
**Endpoint**: `GET /api/v1/garages/branches/maps`

**Request** (`BranchMapSearchRequest`):
| Field | Mô tả | Default |
|---|---|---|
| `Lat` / `Lng` | Tọa độ tâm map | optional |
| `Address` | Địa chỉ text (geocode tự động) | optional |
| `RadiusKm` | Bán kính tìm kiếm (1–200 km) | 10 |
| `PageNumber` / `PageSize` | Phân trang | — |

**Flow xử lý**:
1. Nếu chỉ có `Address` → geocode qua Location service lấy `Lat`/`Lng`
2. Tính **bounding box** từ tâm + bán kính (xấp xỉ phẳng)
3. Query branch nằm trong bounding box, chỉ lấy `Status = Active`
4. Bulk fetch rating từ bảng reviews

**Response** (`BranchMapItemResponse`):
- `Id`, `Name`, `Slug`, `CoverImageUrl`
- `Address` (ProvinceCode, WardCode, StreetDetail)
- `Latitude`, `Longitude`
- `MapLinks` (Google Maps, Apple Maps, Waze, OpenStreetMap)
- `PhoneNumber`, `Status`
- `Garage` (Id, BusinessName, Slug, LogoUrl)
- `AverageRating`, `ReviewCount`

### Branch Detail
**Endpoint**: `GET /api/v1/garages/{garageId}/branches/{branchId}`

Trả thêm so với map item:
- `WorkingHours` — lịch mở/đóng theo từng ngày trong tuần (`OpenTime`, `CloseTime`, `IsClosed`)
- `Description`, `TaxCode`

---

## 2. Tạo Booking (Cần auth)

**Endpoint**: `POST /api/v1/bookings`

**Request** (`CreateBookingRequest`):
```
GarageBranchId     // branch muốn đặt (required)
UserVehicleId      // xe của user (required)
ScheduledAt        // thời gian hẹn UTC, phải là tương lai (required)
Note               // ghi chú (optional)
Items[]
  └─ ProductId OR ServiceId OR BundleId  // chọn đúng 1
     IncludeInstallation                 // kèm lắp đặt (chỉ áp dụng Product)
     SortOrder                           // thứ tự hiển thị
```

**Validation chain** (theo thứ tự):
1. Branch tồn tại + `Status = Active`
2. Garage cha `Status = Active`
3. Xe thuộc về user — call sang Vehicle service (`IVehicleGarageClient`)
4. `Items` không rỗng
5. `ScheduledAt > DateTime.UtcNow`
6. Resolve từng item trong branch:
   - **Product**: tồn tại + Active → lấy `MaterialPrice` + `InstallationService` labor (nếu `IncludeInstallation`)
   - **Service**: tồn tại + Active → lấy `LaborPrice`
   - **Bundle**: tồn tại + Active → tính giá có discount
   - Cộng dồn → `totalAmount`

**Sau khi tạo**:
- `Status = Pending`
- Lưu `VehicleSnapshotJson` (ảnh chụp thông tin xe tại thời điểm đặt)
- Publish **`BookingCreatedEvent`**

---

## 3. Booking Lifecycle

```
Pending
  │
  │  Owner/Manager assign mechanic
  │  → PATCH /bookings/{id}/assign
  ↓
Confirmed  ──── [BookingConfirmedEvent]
  │
  │  Mechanic bắt đầu làm
  │  → PATCH /bookings/{id}/status  { Status: InProgress }
  ↓
InProgress  ─── [BookingStatusChangedEvent]
  │
  │  Mechanic hoàn thành
  │  → PATCH /bookings/{id}/status  { Status: Completed, CurrentOdometer }
  ↓
Completed  ──── [BookingCompletedEvent]

Bất kỳ trước Completed:
  → DELETE /bookings/{id}?reason=...
  → Cancelled  ─── [BookingCancelledEvent]
```

### Sự kiện & Consumer

| Event | Publisher | Consumer chính |
|---|---|---|
| `BookingCreatedEvent` | Garage | Notification (thông báo user) |
| `BookingConfirmedEvent` | Garage | Notification (thông báo user + mechanic) |
| `BookingStatusChangedEvent` | Garage | Notification |
| `BookingCompletedEvent` | Garage | Notification, Vehicle (cập nhật odometer + lịch sử bảo dưỡng) |
| `BookingCancelledEvent` | Garage | Notification |

---

## 4. Lưu ý / Giới hạn hiện tại

- **Không có slot/capacity check**: nhiều booking có thể đặt cùng giờ, không giới hạn số lượng đồng thời
- **Không validate `ScheduledAt` vs `WorkingHours`**: có thể đặt ngoài giờ mở cửa
- Mechanic assignment là thủ công (Owner/Manager chọn)

---

## 5. File tham khảo

| Mục đích | File |
|---|---|
| Branch map/detail endpoints | `Garage/Verendar.Garage/Apis/GarageBranchApis.cs` |
| Booking endpoints | `Garage/Verendar.Garage/Apis/BookingApis.cs` |
| Map search logic | `Garage/Verendar.Garage.Application/Services/Implements/GarageBranchService.cs` |
| Booking business logic | `Garage/Verendar.Garage.Application/Services/Implements/BookingService.cs` |
| Request/Response DTOs | `Garage/Verendar.Garage.Application/Dtos/BookingDtos.cs` |
| Branch DTOs | `Garage/Verendar.Garage.Application/Dtos/GarageBranchDtos.cs` |
| Booking entity | `Garage/Verendar.Garage.Domain/Entities/Booking.cs` |
| Events | `Garage/Verendar.Garage.Contracts/Events/` |


product phụ tùng
bundle : Combo
Service: Dịch vụ