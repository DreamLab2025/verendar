# Styled Components — Mobile-First Responsive Patterns

## Breakpoint System (shared theme)

```ts
// theme/breakpoints.ts
export const bp = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

export const mq = {
  sm: `@media (min-width: ${bp.sm})`,
  md: `@media (min-width: ${bp.md})`,
  lg: `@media (min-width: ${bp.lg})`,
  xl: `@media (min-width: ${bp.xl})`,
  mobile: `@media (max-width: 767px)`,
} as const;
```

Always import `mq` from the theme — never hardcode raw pixel values.

---

## Mobile-First Component Pattern

```tsx
import styled from "styled-components";
import { mq } from "@/theme/breakpoints";

// ✅ Mobile base, desktop override
const PageLayout = styled.div`
  display: flex;
  flex-direction: column; /* mobile: stack */
  gap: 16px;
  padding: 16px;

  ${mq.md} {
    flex-direction: row; /* desktop: side by side */
    gap: 32px;
    padding: 48px 80px;
  }
`;

const Sidebar = styled.aside`
  display: none; /* hidden on mobile */

  ${mq.md} {
    display: block;
    width: 256px;
    flex-shrink: 0;
  }
`;

const Main = styled.main`
  width: 100%;
  min-width: 0; /* prevent flex overflow */
`;
```

---

## Touch-Safe Button Base

```tsx
const TouchButton = styled.button`
  /* Minimum touch target */
  min-height: 44px;
  min-width: 44px;
  padding: 10px 20px;

  /* Prevent tap highlight flash on iOS */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation; /* disable double-tap zoom */

  /* Active state for touch feedback */
  &:active {
    opacity: 0.75;
    transform: scale(0.97);
  }

  cursor: pointer;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
`;

const FullWidthButton = styled(TouchButton)`
  width: 100%;

  ${mq.md} {
    width: auto;
  }
`;
```

---

## Show / Hide by Breakpoint

```tsx
const MobileOnly = styled.div`
  display: block;
  ${mq.md} { display: none; }
`

const DesktopOnly = styled.div`
  display: none;
  ${mq.md} { display: block; }
`

// Usage
<MobileOnly><BottomTabBar /></MobileOnly>
<DesktopOnly><Sidebar /></DesktopOnly>
```

---

## Responsive Typography

```tsx
const Heading = styled.h1`
  font-size: 1.75rem; /* 28px mobile */
  line-height: 1.2;

  ${mq.md} {
    font-size: 2.5rem;
  } /* 40px tablet */
  ${mq.lg} {
    font-size: 3.5rem;
  } /* 56px desktop */
`;

const BodyText = styled.p`
  font-size: 1rem; /* 16px — prevents iOS input zoom */
  line-height: 1.6;
`;
```

---

## Safe Area (iOS notch / home bar)

```tsx
const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;

  /* iOS safe area */
  padding-bottom: env(safe-area-inset-bottom);

  display: flex;
  ${mq.md} {
    display: none;
  } /* hide on desktop */
`;

const FixedHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-top: env(safe-area-inset-top);
  z-index: 40;
`;
```

---

## Viewport Height Fix (mobile browser chrome)

```tsx
// globals.css or createGlobalStyle
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    --vh: 1vh; /* updated by JS — see react-mobile-patterns.md */
  }

  .full-screen {
    height: calc(var(--vh, 1vh) * 100);
  }
`;
```

---

## Horizontal Scroll Row

```tsx
const ScrollRow = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 8px; /* prevent shadow/border clipping */

  &::-webkit-scrollbar {
    display: none;
  }

  /* Prevent last item from clipping */
  &::after {
    content: "";
    min-width: 16px;
  }
`;
```

---

## Styled Components + Tailwind Coexistence

When both are used in the same project:

```tsx
// Use Tailwind for layout/spacing utilities
// Use Styled Components for complex stateful or animated styles

const AnimatedCard = styled.div<{ $isOpen: boolean }>`
  transform: ${p => p.$isOpen ? 'translateY(0)' : 'translateY(100%)'};
  transition: transform 300ms ease;
`

// Then apply Tailwind for spacing/color
<AnimatedCard $isOpen={open} className="bg-white rounded-2xl p-4 shadow-lg">
```
