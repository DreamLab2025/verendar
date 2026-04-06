# AI Phân tích Phụ tùng — Thay đổi API

**Cập nhật**: 2026-03-29 · **Branch**: `claude/fervent-gagarin`

---

## Tóm tắt nhanh

Luồng `POST /api/v1/ai/vehicle-questionnaire/analyze` được cải thiện:

- **AI không còn tự bịa số** — AI chỉ phân tích hành vi lái xe, backend tính toán con số dự đoán
- **Thêm khoảng dự đoán** (range) — thay vì 1 con số duy nhất, giờ có earliest/latest để hiển thị range
- **Thêm confidence tier** — `"low"` / `"medium"` / `"high"` thay thế `confidenceScore` (số)
- **Tự động cải thiện** — khi user cập nhật odometer đủ 2 lần, hệ thống tự re-analyze ngầm

---

## Thay đổi request

`vehicleModelId` **đã bị xóa khỏi request body** — backend tự lấy từ `userVehicleId`.

```json
// Trước
{
  "userVehicleId": "uuid",
  "vehicleModelId": "uuid",   // ← bỏ rồi, không cần gửi nữa
  "partCategorySlug": "engine-oil",
  "answers": []
}

// Sau
{
  "userVehicleId": "uuid",
  "partCategorySlug": "engine-oil",
  "answers": []
}
```

---

## Thay đổi response

### Các field mới trong `recommendations[0]`

| Field | Type | Ý nghĩa |
|---|---|---|
| `earliestNextOdometer` | `number` | Odometer sớm nhất nên thay (kịch bản dùng xe nhiều) |
| `latestNextOdometer` | `number` | Odometer muộn nhất nên thay (kịch bản dùng xe ít) |
| `earliestNextDate` | `string \| null` | Ngày sớm nhất (format `YYYY-MM-DD`) |
| `latestNextDate` | `string \| null` | Ngày muộn nhất (format `YYYY-MM-DD`) |
| `confidenceTier` | `"low" \| "medium" \| "high"` | Độ tin cậy của dự đoán |
| `analysisPhase` | `"baseline" \| "personalized"` | Dự đoán dựa trên chuẩn nhà sản xuất hay lịch sử thực tế |
| `rangeNarrowsWhen` | `string[]` | Gợi ý để tăng độ chính xác (hiển thị dưới dạng hint cho user) |

### Các field bị xóa

| Field | Lý do |
|---|---|
| `confidenceScore` | Thay bằng `confidenceTier` (dễ hiển thị hơn) |

### Các field giữ nguyên (backward compat)

`predictedNextOdometer`, `predictedNextDate`, `lastReplacementOdometer`, `lastReplacementDate`, `reasoning`, `needsImmediateAttention`

---

## Ví dụ response đầy đủ

```json
{
  "isSuccess": true,
  "data": {
    "recommendations": [
      {
        "partCategorySlug": "engine-oil",
        "lastReplacementOdometer": 40000,
        "lastReplacementDate": "2025-10-01",

        "predictedNextOdometer": 45000,
        "predictedNextDate": "2026-04-15",

        "earliestNextOdometer": 43500,
        "latestNextOdometer": 46500,
        "earliestNextDate": "2026-03-20",
        "latestNextDate": "2026-05-10",

        "confidenceTier": "low",
        "analysisPhase": "baseline",
        "rangeNarrowsWhen": [
          "Cập nhật odometer ít nhất 2 lần để nhận dự đoán cá nhân hóa"
        ],

        "reasoning": "Dựa trên lịch bảo dưỡng chuẩn của nhà sản xuất...",
        "needsImmediateAttention": false
      }
    ],
    "warnings": [],
    "metadata": {
      "model": "gemini-2.0-flash",
      "totalTokens": 1240,
      "totalCost": 0.00031,
      "responseTimeMs": 3200
    }
  }
}
```

---

## Hiểu `confidenceTier` và `analysisPhase`

### `analysisPhase`

| Giá trị | Ý nghĩa | Khi nào |
|---|---|---|
| `"baseline"` | Dự đoán theo chuẩn nhà sản xuất | User chưa cập nhật odometer đủ 2 lần |
| `"personalized"` | Dự đoán theo lịch sử lái xe thực tế của user | User đã có ≥ 2 lần cập nhật odometer |

### `confidenceTier`

| Giá trị | Ý nghĩa | Gợi ý hiển thị |
|---|---|---|
| `"low"` | Chưa có đủ lịch sử, dự đoán theo chuẩn | Badge vàng / cảnh báo |
| `"medium"` | Có một ít lịch sử | Badge xanh nhạt |
| `"high"` | Nhiều lịch sử, dự đoán khá chính xác | Badge xanh đậm |

### `rangeNarrowsWhen`

Mảng string gợi ý cho user. Hiển thị như tooltip hoặc hint card bên dưới kết quả.

Ví dụ:
- `"Cập nhật odometer ít nhất 2 lần để nhận dự đoán cá nhân hóa"` → khi chưa có lịch sử
- `"Cập nhật odometer thêm 1 lần nữa để nhận dự đoán cá nhân hóa"` → khi có 1 lần
- `"Cập nhật odometer thêm vài lần để thu hẹp khoảng dự đoán"` → khi có 2–4 lần
- `[]` (mảng rỗng) → khi đã có ≥ 5 lần, không cần hiển thị gì

---

## Hành vi tự động (FE không cần làm gì)

Khi user cập nhật odometer lần thứ 2 trở đi, hệ thống tự động re-analyze ngầm các phụ tùng đã được phân tích ở giai đoạn `baseline`. Sau khi xong, lần `analyze` tiếp theo của FE sẽ nhận được `analysisPhase: "personalized"` và `confidenceTier` cao hơn.

FE không cần trigger hay polling gì — chỉ cần gọi lại `analyze` như bình thường là nhận kết quả mới.
