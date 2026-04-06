# Create Vehicle Flow

Tai lieu nay mo ta flow "Dang ky xe" theo dung implementation hien tai de co the copy sang project khac.

## 1) Muc tieu

Nguoi dung tao 1 `user vehicle` moi thong qua wizard 4 buoc:

1. Chon input method (hien tai chi support `manual`)
2. Chon loai xe (`motorcycle | car | electric`)
3. Chon hang + model/variant
4. Nhap thong tin co ban va submit

## 2) Dieu kien tien quyet

- Da dang nhap va co cookie `auth-token`.
- App set token vao `api8080Service` truoc khi goi API (vi du trong `AuthProvider`).
- `NEXT_PUBLIC_API_URL_API_GATEWAY` da duoc cau hinh dung.

## 3) API services tham gia

Tat ca calls ben duoi su dung `api8080Service` (base URL = `NEXT_PUBLIC_API_URL_API_GATEWAY`):

- `GET /api/v1/types` - lay danh sach loai xe
- `GET /api/v1/brands` - lay danh sach hang xe
- `GET /api/v1/models` - lay danh sach model (co variants)
- `POST /api/v1/user-vehicles` - tao xe cua user

## 4) Flow chi tiet theo tung buoc

### Step 1 - Chon phuong thuc nhap

- UI co 2 option: `manual`, `scan`.
- Neu chon `scan`: hien toast thong bao "dang phat trien", khong di tiep.
- Neu chon `manual`: chuyen sang Step 2.

### Step 2 - Chon loai xe

Frontend call:

```http
GET /api/v1/types?PageNumber=1&PageSize=10&IsDescending=false
```

UI map ten type ve key noi bo:

- `motorcycle` / `xe may` -> `motorcycle`
- `car` / `xe o to` / `o to` -> `car`
- `electric vehicle` / `electric` / `xe dien` -> `electric`

Sau khi user chon type:

- set `vehicleType`
- reset data downstream: `brandId`, `vehicleVariantId`, `vehicleInfo`
- chuyen sang Step 3

### Step 3 - Chon hang xe + model/variant

#### 3.1 Lay brand

Frontend call:

```http
GET /api/v1/brands?PageNumber=1&PageSize=5&IsDescending=false
```

Khi chon 1 brand:

- luu `brandId`
- reset `vehicleVariantId` ve `null`
- render section model

#### 3.2 Lay model theo brand + search + paging

Frontend call:

```http
GET /api/v1/models?BrandId={brandId}&ModelName={keyword?}&PageNumber={n}&PageSize=10
```

Hanh vi:

- Search input debounce 300ms.
- Brand thay doi -> reset toan bo state model/variant/search.
- Infinite load: vuot slide gan cuoi thi tang `PageNumber`.
- Moi model co the co nhieu `variants` (mau sac).

#### 3.3 Confirm variant

Rule quan trong:

- Neu model co `variants` -> bat buoc user chon variant roi moi duoc Confirm.
- `onConfirm` tra ve `vehicleVariantId = variant.id` len trang cha.

Sau khi co `brandId` + `vehicleVariantId` thi button "Tiep theo" duoc mo.

### Step 4 - Nhap thong tin xe

Truong du lieu:

- `licensePlate` (bat buoc)
- `nickname` (khong bat buoc)
- `vinNumber` (khong bat buoc)
- `purchaseDate` (bat buoc, format UI: `yyyy-mm-dd`)
- `currentOdometer` (bat buoc, >= 0)

Dieu kien valid:

- `licensePlate.trim().length > 0`
- `purchaseDate.trim().length > 0`
- `currentOdometer` la so hop le va >= 0

Neu valid + da co `vehicleVariantId` thi user co the bam "Dang ky xe".

## 5) Submit create vehicle

### 5.1 Convert purchaseDate

Truoc khi goi API, frontend convert `yyyy-mm-dd` sang ISO:

- Tach `y, m, d`
- Tao `new Date(y, m - 1, d, 0, 0, 0).toISOString()`

### 5.2 Payload gui len backend

```json
{
  "vehicleVariantId": "uuid-variant",
  "licensePlate": "30K1-12345",
  "nickname": "Xe di lam",
  "vinNumber": "RLH...",
  "purchaseDate": "2026-03-26T00:00:00.000Z",
  "currentOdometer": 12500
}
```

### 5.3 API call

```http
POST /api/v1/user-vehicles
Content-Type: application/json
Authorization: Bearer {auth-token}
```

### 5.4 Xu ly ket qua

- Hien toast loading/success/error.
- Khi success:
  - invalidate query `["user-vehicles"]` (React Query)
  - redirect ve `/`

## 6) Response format tham chieu

Response success tao xe (dang type trong frontend):

```json
{
  "isSuccess": true,
  "message": "string",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "licensePlate": "string",
    "nickname": "string",
    "vinNumber": "string",
    "purchaseDate": "2026-03-26T00:00:00.000Z",
    "currentOdometer": 0,
    "lastOdometerUpdateAt": "2026-03-26T00:00:00.000Z",
    "averageKmPerDay": 0,
    "lastCalculatedDate": null,
    "createdAt": "2026-03-26T00:00:00.000Z",
    "updatedAt": null,
    "variant": {}
  },
  "metadata": null
}
```

## 7) Luong tong quat de copy qua project khac

1. User vao man hinh add vehicle.
2. Load types -> user chon type.
3. Load brands -> user chon brand.
4. Load models theo brand (+search/paging) -> user chon variant -> confirm.
5. User nhap vehicle info.
6. Frontend validate + map date sang ISO.
7. Frontend `POST /api/v1/user-vehicles`.
8. Success: refresh danh sach xe + redirect.

## 8) Luu y khi port sang project moi

- Dam bao backend tra `models` co `variants` (de lay `vehicleVariantId`).
- Neu muon filter brands theo type dung nghia, can goi endpoint theo `typeId` (hien tai flow dang lay brands chung roi user tu chon).
- Validate date timezone can thong nhat giua frontend va backend (dang dung local date -> ISO at 00:00:00 local).
- Khuyen nghi log payload submit trong env dev de debug nhanh mismatch field.

