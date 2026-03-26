# Vehicle Maintenance Client

Frontend cho hệ thống quản lý và nhắc bảo dưỡng phương tiện, xây dựng bằng Next.js App Router.

## Tinh nang chinh

- Xac thuc nguoi dung: dang nhap, dang ky, quen mat khau, xac minh OTP, onboarding.
- Quan ly xe va thong tin lien quan: danh sach xe, chi tiet xe, lich su dong ho cong-to-met.
- Quan ly bao duong: tao moi, theo doi lich su, xem theo danh muc.
- Quan ly thong bao: danh sach thong bao, chi tiet thong bao, realtime thong qua SignalR.
- Khu vuc admin: dashboard, quan ly users, brands, models, variants, parts, products, vehicles.
- Tich hop ban do (Google Maps) cho man hinh map.

## Cong nghe su dung

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + Radix UI + Framer Motion
- TanStack Query cho quan ly state bat dong bo
- Axios cho HTTP client
- SignalR (`@microsoft/signalr`) cho realtime notifications

## Yeu cau moi truong

- Node.js 20+ (khuyen nghi dung ban LTS moi nhat)
- npm (du an dang su dung `package-lock.json`)

## Cai dat va chay du an

```bash
npm install
npm run dev
```

Mo trinh duyet tai `http://localhost:3000`.

## Scripts

- `npm run dev`: chay development server
- `npm run build`: build production
- `npm run start`: chay ban build production
- `npm run lint`: kiem tra lint

## Bien moi truong

Tao file `.env.local` o root du an va cau hinh toi thieu:

```env
NEXT_PUBLIC_API_URL_BACKEND=https://your-backend-url
NEXT_PUBLIC_API_URL_API_GATEWAY=https://your-api-gateway-url
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

Ghi chu:

- `NEXT_PUBLIC_API_URL_BACKEND`: base URL cho `apiService`.
- `NEXT_PUBLIC_API_URL_API_GATEWAY`: base URL cho API gateway va SignalR hub notifications.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: bat buoc neu su dung map feature.

## Cau truc thu muc chinh

```text
app/                # Routes theo App Router (auth, user, vehicle, admin, notifications...)
components/         # UI components va widget theo module man hinh
lib/api/            # API service wrappers (axios-based)
hubs/               # Ket noi realtime SignalR
hooks/              # Custom React hooks
providers/          # React providers (theme, query, app-level context)
types/              # Dinh nghia types dung chung
utils/              # Ham tien ich
```

## Tai lieu bo sung

- `API_CALLS.md`: tong hop cac endpoint/service dang su dung.
- `VERCEL_DEPLOY.md`: huong dan deploy len Vercel.
- `VERCEL_CONFIG_ISSUES.md`: ghi chu cac van de cau hinh da gap.

## Luu y

- Du an dang duoc to chuc theo route groups trong `app/` (`(auth)`, `(user)`, `(vehicle)`, `(admin)`, `(notifications)`).
- Khi them tinh nang moi, uu tien tach component theo widget/module de de bao tri.
