# Navigation Conversion: Desktop Sidebar → Mobile (React/Next.js)

## Pattern Decision

| Desktop Nav             | Mobile Pattern          | When           |
| ----------------------- | ----------------------- | -------------- |
| Top navbar ≥ 5 links    | Hamburger + Drawer      | content sites  |
| Top navbar ≤ 4 links    | Bottom Tab Bar          | app-style      |
| Sidebar with sections   | Bottom Tab + nested     | dashboard apps |
| Sidebar with many items | Hamburger + full-screen | admin panels   |

---

## 1. Bottom Tab Bar — Tailwind

```tsx
// components/BottomTabBar.tsx
const tabs = [
  { label: "Home", icon: "🏠", href: "/" },
  { label: "Search", icon: "🔍", href: "/search" },
  { label: "Orders", icon: "📦", href: "/orders" },
  { label: "Profile", icon: "👤", href: "/profile" },
];

export function BottomTabBar() {
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-40
        flex md:hidden                   /* mobile only */
        bg-white border-t border-gray-200
        pb-[env(safe-area-inset-bottom)] /* iOS home bar */
      "
    >
      {tabs.map((tab) => (
        <a
          key={tab.href}
          href={tab.href}
          className="
            flex-1 flex flex-col items-center justify-center
            min-h-[56px] py-2 gap-1
            text-xs text-gray-500
            active:bg-gray-50
            -webkit-tap-highlight-color-transparent
          "
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          {tab.label}
        </a>
      ))}
    </nav>
  );
}

// In layout: add pb-16 md:pb-0 to <main> to avoid overlap
```

---

## 2. Bottom Tab Bar — Styled Components

```tsx
import styled from "styled-components";
import { mq } from "@/theme/breakpoints";

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 40;

  ${mq.md} {
    display: none;
  }
`;

const TabItem = styled.a`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  font-size: 12px;
  color: #6b7280;
  gap: 4px;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: #f9fafb;
  }
  &[aria-current="page"] {
    color: #2563eb;
  }
`;
```

---

## 3. Hamburger + Drawer — Tailwind (Next.js App Router)

```tsx
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Reports", href: "/reports" },
  { label: "Settings", href: "/settings" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger — 44px tap target */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-3 min-h-[44px] min-w-[44px]"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
        <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
        <span className="block w-5 h-0.5 bg-gray-700" />
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} aria-hidden />
          {/* Panel */}
          <nav
            className="
            w-72 h-full bg-white flex flex-col
            pt-[env(safe-area-inset-top)]
            pb-[env(safe-area-inset-bottom)]
          "
          >
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-semibold text-lg">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col overflow-y-auto flex-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className={`
                    px-6 py-4 text-base border-b border-gray-100
                    ${pathname === l.href ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-700"}
                    active:bg-gray-50
                  `}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Desktop nav — unchanged */}
      <nav className="hidden md:flex gap-6">
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
    </>
  );
}
```

---

## 4. Hide Sidebar, Show Mobile Nav in Layout

```tsx
// app/layout.tsx or layouts/AppLayout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white">
        <SidebarNav />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-white sticky top-0 z-30">
          <Logo />
          <MobileNav />
        </header>

        <main className="flex-1 pb-16 md:pb-0">
          {" "}
          {/* pb-16 for bottom tab */}
          {children}
        </main>

        {/* Bottom tab — mobile only */}
        <BottomTabBar />
      </div>
    </div>
  );
}
```
