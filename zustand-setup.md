# Hướng dẫn Zustand trong revo-land

Dự án đã khai báo **`zustand` ^5.0.3** trong `package.json`. Không cần cài thêm trừ khi bạn đang clone repo mới — khi đó chạy `npm install` là đủ.

## Vai trò trong stack

Theo convention của repo (xem `.cursor/rules/FetchAndReactQuery.mdc`):

| Loại state | Công cụ |
|------------|---------|
| Dữ liệu từ API, cache, invalidation | **TanStack React Query** (`@tanstack/react-query`) |
| Auth token / user đồng bộ cookie + header API | **Zustand** (`lib/store/authStore.ts`) |
| UI toàn cục (loading chung, lỗi API tổng quát) | **Zustand** (`lib/store/apiStore.ts`) |
| Filter / form phức tạp, nhiều component cùng đọc | **Zustand** (ví dụ `app/(user)/properties/store/useSearchStore.ts`) |
| State chỉ thuộc một component | `useState` / `useReducer` |

Zustand **không thay thế** React Query cho server state; dùng song song như hiện tại.

## Cài đặt (môi trường mới)

```bash
npm install zustand
```

Phiên bản đang lock trong repo: **5.x** (tương thích TypeScript 5.7 và React 19 của dự án).

## Vị trí file trong repo

- **Store dùng chung toàn app:** `lib/store/`  
  - `authStore.ts` — session, cookie `auth-token`, `apiService.setAuthToken`  
  - `apiStore.ts` — `isLoading`, `error`, đếm request pending  
- **Store theo feature (route group):** `app/.../store/useXxxStore.ts`  
  - Ví dụ: `useSearchStore`, `useSearchProjectsStore` — có bọc `devtools`

Khi thêm store mới: ưu tiên đặt gần feature nếu chỉ feature đó dùng; nếu nhiều khu vực dùng thì đặt dưới `lib/store/`.

## Next.js App Router và SSR

- Hook `useXxxStore` chỉ gọi trong **Client Component** (file có `'use client'`).
- Tránh đọc `window`, `document`, `localStorage` trực tiếp trong initializer của `create()` nếu module có thể import từ Server Component; bọc trong `typeof window !== 'undefined'` hoặc chạy init trong `useEffect` (pattern tương tự `authStore` với `initializeAuth`).
- Nếu cần giá trị khởi tạo từ cookie trên client, đồng bộ sau mount — không coi Zustand là nguồn sự thật trên server.

## Pattern 1: Store đơn giản (giống `apiStore`)

```typescript
import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>(set => ({
  sidebarOpen: true,
  setSidebarOpen: open => set({ sidebarOpen: open }),
}));
```

Dùng trong component:

```typescript
'use client';

import { useUiStore } from '@/lib/store/uiStore';

export function SidebarToggle() {
  const sidebarOpen = useUiStore(s => s.sidebarOpen);
  const setSidebarOpen = useUiStore(s => s.setSidebarOpen);
  return <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)}>...</button>;
}
```

**Selector (`s => s.field`)** giúp component chỉ re-render khi slice đó đổi.

## Pattern 2: `getState()` ngoài React

Dùng khi cần gọi action từ interceptor API, listener, hoặc code không có hook:

```typescript
useAuthStore.getState().logout();
useAuthStore.getState().setToken(token);
```

Cùng pattern có trong `authStore` và `hooks/useAuth.ts`.

## Pattern 3: DevTools (giống `useSearchStore`)

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface FeatureState {
  count: number;
  increment: () => void;
}

export const useFeatureStore = create<FeatureState>()(
  devtools(
    set => ({
      count: 0,
      increment: () => set(s => ({ count: s.count + 1 })),
    }),
    { name: 'feature-store' }
  )
);
```

Lưu ý: cú pháp **`create<State>()(...)`** (hai cặp ngoặc) khi dùng middleware TypeScript.

Chỉ bật devtools trong development nếu muốn giảm noise:

```typescript
const middleware = process.env.NODE_ENV === 'development' ? devtools : (fn: typeof initializer) => fn;
```

## Pattern 4: Slice lớn + nhóm `actions`

`useSearchStore` gom state theo `location`, `property`, `range`, `search` và gom hàm vào `actions` để component subscribe state mà không kéo theo toàn bộ function references nếu chọn selector đúng.

Ví dụ rút gọn:

```typescript
const count = useFeatureStore(s => s.count);
const increment = useFeatureStore(s => s.actions.increment);
```

## TypeScript

- Khai báo **`interface`** cho state + actions (đồng bộ với rule dự án).
- Tránh `any`; dùng `unknown` + narrow khi parse JSON / lỗi.
- Actions nên là hàm thuần cập nhật state qua `set`; gọi API trong action thì vẫn nên cân nhắc **React Query** cho cache và retry.

## Middleware tùy chọn

- **`persist`**: lưu một phần state xuống `localStorage` — chỉ dùng khi thật sự cần; auth hiện tại dựa **cookie** + `authStore`, không nhất thiết trùng với persist.
- **`subscribeWithSelector`**: khi cần subscribe chi tiết từng field (ít dùng hơn selector trong hook).

## Kiểm tra nhanh

1. Store mới có import từ component client-only không?
2. Có đang trùng vai trò với một `useQuery` / `useMutation` không — nếu có thì ưu tiên React Query.
3. Re-render: đã chọn selector hẹp (`s => s.x`) thay vì `useStore()` trả về cả object?

## Tham chiếu file trong repo

| File | Mô tả |
|------|--------|
| `lib/store/authStore.ts` | Store auth, cookie, JWT decode, init client |
| `lib/store/apiStore.ts` | Loading / error / pending requests |
| `app/(user)/properties/store/useSearchStore.ts` | Store lớn + `devtools` |
| `app/(user)/projects/store/useSearchProjectsStore.ts` | Store tìm kiếm projects + `devtools` |
| `hooks/useAuth.ts` | Tích hợp auth với store và cookie |

Tài liệu chính thức: [https://zustand.docs.pmnd.rs/](https://zustand.docs.pmnd.rs/)
