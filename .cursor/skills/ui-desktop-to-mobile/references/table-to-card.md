# Table → Card/List Conversion (React/Next.js)

## Strategy Decision

| Table type          | Mobile pattern                            |
| ------------------- | ----------------------------------------- |
| Simple ≤ 3 cols     | Horizontal scroll table                   |
| Rich data + actions | Dual render (table desktop / card mobile) |
| Comparison          | Stacked key-value card                    |
| Long lists          | Virtualized card list                     |

---

## 1. Horizontal Scroll Table (simplest — Tailwind)

```tsx
<div className="overflow-x-auto -mx-4 px-4">
  {" "}
  {/* negative margin = edge-to-edge */}
  <table className="min-w-[560px] w-full text-sm border-collapse">{/* table unchanged */}</table>
</div>
```

---

## 2. Dual Render — Tailwind (SSR-safe for Next.js)

```tsx
// components/UserList.tsx
type User = { id: string; name: string; email: string; status: "active" | "inactive"; role: string };

function StatusBadge({ status }: { status: User["status"] }) {
  return (
    <span
      className={`
      inline-flex px-2 py-0.5 rounded-full text-xs font-medium
      ${status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}
    `}
    >
      {status}
    </span>
  );
}

function UserCard({ user }: { user: User }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-semibold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <StatusBadge status={user.status} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">{user.role}</span>
        <div className="flex gap-2">
          <button className="min-h-[36px] px-3 text-sm text-blue-600 font-medium active:opacity-70">Edit</button>
          <button className="min-h-[36px] px-3 text-sm text-red-500 font-medium active:opacity-70">Delete</button>
        </div>
      </div>
    </div>
  );
}

export function UserList({ users }: { users: User[] }) {
  return (
    <>
      {/* Mobile: card list — SSR-safe with CSS */}
      <div className="flex flex-col gap-3 md:hidden">
        {users.map((u) => (
          <UserCard key={u.id} user={u} />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-500 text-xs uppercase tracking-wide">
              <th className="py-3 px-4 font-medium">Name</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Role</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                <td className="py-3 px-4 text-gray-500">{u.email}</td>
                <td className="py-3 px-4 text-gray-500">{u.role}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={u.status} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-3">
                    <button className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button className="text-red-500 hover:underline text-sm">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

---

## 3. Dual Render — Styled Components

```tsx
import styled from "styled-components";
import { mq } from "@/theme/breakpoints";

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  ${mq.md} {
    display: none;
  }
`;

const TableWrapper = styled.div`
  display: none;
  ${mq.md} {
    display: block;
    overflow-x: auto;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
```

---

## 4. Swipeable Delete Row (touch gesture)

```tsx
"use client";
import { useRef, useState } from "react";

export function SwipeableCard({ onDelete, children }: { onDelete: () => void; children: React.ReactNode }) {
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const THRESHOLD = 80;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete background */}
      <div
        className="absolute right-0 inset-y-0 w-20 bg-red-500
                      flex items-center justify-center text-white text-sm font-medium"
      >
        Delete
      </div>

      {/* Card */}
      <div
        className="relative bg-white transition-transform"
        style={{ transform: `translateX(${Math.min(0, offset)}px)` }}
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX;
        }}
        onTouchMove={(e) => {
          setOffset(e.touches[0].clientX - startX.current);
        }}
        onTouchEnd={() => {
          if (offset < -THRESHOLD) onDelete();
          setOffset(0);
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

---

## 5. Pagination → Load More (mobile UX)

```tsx
// Replace pagination controls with Load More button on mobile
export function PaginatedList({ items, total, onLoadMore }: { items: Item[]; total: number; onLoadMore: () => void }) {
  return (
    <>
      <div className="flex flex-col gap-3">
        {items.map((i) => (
          <ItemCard key={i.id} item={i} />
        ))}
      </div>
      {items.length < total && (
        <button
          onClick={onLoadMore}
          className="w-full mt-4 min-h-[48px] rounded-xl border border-gray-300
                     text-sm font-medium text-gray-700 active:bg-gray-50"
        >
          Load more ({total - items.length} remaining)
        </button>
      )}
    </>
  );
}
```
