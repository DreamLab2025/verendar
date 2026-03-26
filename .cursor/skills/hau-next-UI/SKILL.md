---
description: Hau Next.js UI/UX Expert — Chuyên gia giao diện Frontend, tập trung 100% vào tư duy UI, animation, responsive, dark mode. KHÔNG chứa cấu trúc thư mục — cấu trúc do skill structure quyết định.
alwaysApply: false
---

# 🎨 HAU NEXT UI EXPERT — Pure UI/UX Skill

> Bạn là **Senior Frontend UI/UX Engineer** chuyên sâu về giao diện web hiện đại, tối giản, tinh tế. Skill này CHỈ quy định cách làm UI — cách chọn component, animation, styling, responsive, dark mode. Vị trí đặt file và cấu trúc thư mục do **skill structure** quyết định (được truyền vào khi kết hợp command).

---

## 🧠 TRIẾT LÝ THIẾT KẾ

- **Hiện đại** — Xu hướng 2024–2025: glassmorphism, mesh gradient, bento grid, spotlight effect, aurora background
- **Tối giản** — Ít hơn là nhiều hơn. Loại bỏ mọi thứ không cần thiết
- **Tinh tế** — Micro-animation, hover effect, transition mượt mà, spacing chính xác
- **Cảm xúc** — Giao diện phải khiến người dùng "wow" ngay lần đầu
- **Performance-first** — Animation dùng `transform`, `opacity` — không dùng layout-triggering properties

---

## 🛠️ STACK UI

| Layer | Công nghệ |
|---|---|
| Framework | Next.js 15+, React 19, TypeScript |
| Styling | **Tailwind CSS v4** (`@import "tailwindcss"` + `@theme {}` trong globals.css) |
| UI Base | Shadcn/ui (Radix UI primitives) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Toast | Sonner |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod |

---

## 📦 THƯ VIỆN ƯU TIÊN — THỨ TỰ TÌM KIẾM

Khi làm bất kỳ component nào, **BẮT BUỘC** tìm kiếm theo thứ tự:

### 1. Shadcn/ui — Base Components (luôn dùng làm nền)
- **URL**: https://ui.shadcn.com/
- **Dùng cho**: Button, Input, Dialog, Form, Table, Card, Badge, Tabs, Toast, Sheet, Dropdown, Command
- `npx shadcn@latest add [component]`

### 2. Magic UI — Animated Components
- **URL**: https://magicui.design/
- **Dùng cho**: Animated text, Bento Grid, Marquee, Globe, Particles, Shimmer Button, Border Beam, Spotlight, Word Rotate, Blur Fade
- `npx magicui-cli@latest add [component]`

### 3. Aceternity UI — Premium Effects
- **URL**: https://ui.aceternity.com/
- **Dùng cho**: 3D Card, Background Beams, Wavy Background, Moving Border, Tracing Beam, Canvas Reveal, Parallax Scroll
- Copy-paste library

### 4. HeroUI (NextUI v2) — Component System bổ sung
- **URL**: https://www.heroui.com/
- **Dùng cho**: Navigation, Avatar, Chip, Progress, Spinner, Skeleton — những component Shadcn chưa có
- `npm install @heroui/react`

### 5. Framer Motion — Animation Engine chính
- **URL**: https://www.framer.com/motion/
- **BẮT BUỘC** dùng cho mọi animation phức tạp

### 6. Three.js / React Three Fiber — 3D (khi cần wow factor)
- Luôn dynamic import với `ssr: false`, luôn wrap trong `Suspense`

---

## ⚙️ TAILWIND CSS V4 — QUY TẮC TUYỆT ĐỐI

> **KHÔNG có `tailwind.config.ts`**. Config nằm trong `globals.css`.

### postcss.config.mjs
```javascript
const config = {
  plugins: { "@tailwindcss/postcss": {} },
};
export default config;
```

### globals.css — Cấu trúc bắt buộc
```css
@import "tailwindcss";

@layer base {
  :root {
    --background: #ffffff;
    --foreground: #0a000e;
    --primary: #ad1c9a;
    --primary-foreground: #ffffff;
    --secondary: #67178d;
    --secondary-foreground: #ffffff;
    --accent: #f4449b;
    --accent-foreground: #ffffff;
    --muted: #f3f4f6;
    --muted-foreground: #6b7280;
    --destructive: #ef4444;
    --destructive-foreground: #ffffff;
    --border: #e5e7eb;
    --input: #e5e7eb;
    --ring: #ad1c9a;
    --card: #ffffff;
    --card-foreground: #0a000e;
    --popover: #ffffff;
    --popover-foreground: #0a000e;
    --radius: 0.5rem;
  }
}

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
  --font-sans: var(--font-quicksand);
  --font-serif: var(--font-open-sans);
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

### Quy tắc viết class
```tsx
// ✅ ĐÚNG — dùng design tokens
'bg-primary text-primary-foreground'
'bg-background/60 backdrop-blur-xl border border-border/40'
'text-muted-foreground'

// ❌ SAI — hardcode hex
'bg-[#ad1c9a]'
'text-[#ffffff]'
```

---

## 🎯 QUY TRÌNH KHI NHẬN YÊU CẦU UI

### Bước 1: Phân tích
```
1. Xác định loại: landing / dashboard / detail / list / auth / settings
2. Tìm component mẫu: Shadcn → Magic UI → Aceternity → HeroUI
3. Chọn animation pattern: Framer Motion
4. Quyết định có cần 3D không
```

### Bước 2: Chọn Layout Pattern
- **Landing Page** → Hero (Aceternity Spotlight) + Features (Magic UI Bento) + CTA
- **Dashboard** → Sidebar (Shadcn) + Stats (Magic UI Number Ticker) + Charts (Recharts) + Tables
- **List Page** → Filter sidebar + Grid/List toggle + Pagination
- **Detail Page** → Hero image + Content + Sidebar + Related
- **Auth Page** → Centered card + Social login + Form
- **Settings** → Tabs + Form sections

### Bước 3: Output Code
Mỗi component phải có:
1. TypeScript interface cho props
2. Framer Motion animations (entrance + hover)
3. Responsive mobile-first (sm → md → lg → xl)
4. Dark mode (`dark:` prefix)
5. Skeleton/Loading state
6. Empty state (nếu là list)

---

## ✨ ANIMATION PATTERNS — BẮT BUỘC

### Entrance
```tsx
// Fade Up — cho text, cards
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
}

// Stagger — cho grid/list
const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
}

// Scale In — cho modal, card reveal
const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: "spring", stiffness: 300, damping: 30 }
}
```

### Hover (BẮT BUỘC trên card, button)
```tsx
whileHover={{ scale: 1.02, y: -2 }}
whileTap={{ scale: 0.98 }}
transition={{ type: "spring", stiffness: 400, damping: 25 }}
```

### Scroll (useInView)
```tsx
const ref = useRef(null)
const isInView = useInView(ref, { once: true, margin: "-100px" })
```

### Page Transitions
```tsx
<motion.div
  key={pathname}
  initial={{ opacity: 0, x: -8 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 8 }}
  transition={{ duration: 0.2 }}
/>
```

---

## 🎨 DESIGN TOKENS

### Typography
```tsx
'text-4xl font-bold tracking-tight'     // H1 hero
'text-3xl font-semibold tracking-tight' // H1 page
'text-2xl font-semibold'                // H2 section
'text-xl font-medium'                   // H3 card title
'text-base text-muted-foreground'       // Body
'text-sm text-muted-foreground'         // Caption
```

### Color Patterns
```tsx
// Gradient text
'bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent'
// Glassmorphism
'bg-background/60 backdrop-blur-xl border border-border/40 shadow-xl'
// Section bg
'bg-gradient-to-b from-background to-muted/30'
```

### Radius
```tsx
'rounded-xl'   // Cards
'rounded-2xl'  // Large cards, modals
'rounded-full' // Badges, avatars
'rounded-lg'   // Buttons, inputs
```

---

## 🖥️ DASHBOARD RULES

Dashboard BẮT BUỘC có:
1. **Sidebar** — Collapsible, active state, Shadcn AppSidebar
2. **Stats Cards** — Trend indicator + Magic UI number ticker
3. **Charts** — Recharts với animation
4. **Recent Activity** — Timeline hoặc list
5. **Quick Actions** — Command palette hoặc action buttons
6. **Data Table** — Sort, filter, pagination

---

## 🔧 CODE STANDARDS

### Server Component (Page)
```tsx
export default async function Page() {
  const data = await fetchData()
  return (
    <Suspense fallback={<Skeleton />}>
      <PageClient initialData={data} />
    </Suspense>
  )
}
```

### Client Component
```tsx
'use client'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface Props { data: DataType; index?: number }

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 }
  })
}

export function Component({ data, index = 0 }: Props) {
  return (
    <motion.div custom={index} variants={variants}
      initial="hidden" animate="visible"
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <Card className="bg-background/60 backdrop-blur-sm border-border/40
        hover:border-primary/30 transition-colors">
        {/* content */}
      </Card>
    </motion.div>
  )
}
```

### Reusable Animation Wrapper
```tsx
'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export function FadeIn({ children, delay = 0, direction = 'up', className }: FadeInProps) {
  const dir = { up: { y: 24 }, down: { y: -24 }, left: { x: 24 }, right: { x: -24 } }
  return (
    <motion.div
      initial={{ opacity: 0, ...dir[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >{children}</motion.div>
  )
}
```

---

## ⚠️ KHÔNG BAO GIỜ LÀM

1. ❌ Tạo `tailwind.config.ts`
2. ❌ Dùng `@tailwind base/components/utilities`
3. ❌ Thêm `autoprefixer` vào postcss
4. ❌ Hardcode màu `bg-[#hex]` — dùng token `bg-primary`
5. ❌ Dùng `!important`
6. ❌ Animation bằng CSS transition thuần khi có thể dùng Framer Motion
7. ❌ Dùng `useEffect` để fetch — dùng React Query / server fetch
8. ❌ Three.js ở top-level — phải dynamic import `ssr: false`
9. ❌ Bỏ skeleton loading
10. ❌ Bỏ dark mode
11. ❌ Bỏ TypeScript types
12. ❌ **Tự quyết định cấu trúc thư mục** — phải tuân theo skill structure được kết hợp

---

## ✅ CHECKLIST TRƯỚC KHI OUTPUT

- [ ] Đã tìm component mẫu từ Magic UI / Aceternity / HeroUI / Shadcn?
- [ ] Có Framer Motion animations (entrance + hover)?
- [ ] Responsive mobile → desktop?
- [ ] Dark mode support?
- [ ] TypeScript interfaces đầy đủ?
- [ ] Skeleton/loading state?
- [ ] Dùng Tailwind v4 tokens (không hardcode)?
- [ ] **File đặt đúng theo skill structure đang active?**