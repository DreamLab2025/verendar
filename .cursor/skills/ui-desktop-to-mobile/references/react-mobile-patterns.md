# React / Next.js — Mobile UI Patterns

## 1. useMediaQuery Hook

```tsx
import { useState, useEffect } from "react";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Usage
const isMobile = useMediaQuery("(max-width: 767px)");
const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
```

---

## 2. Responsive Component Switch

```tsx
function DataDisplay({ data }: { data: Item[] }) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) return <CardList items={data} />;
  return <DataTable items={data} />;
}
```

**Note for Next.js SSR:** Use CSS `hidden/block` classes instead of JS-based switching to avoid hydration mismatch:

```tsx
// SSR-safe approach
<>
  <div className="md:hidden">
    <CardList items={data} />
  </div>
  <div className="hidden md:block">
    <DataTable items={data} />
  </div>
</>
```

---

## 3. Touch Event Handlers

```tsx
function SwipeDetector({ onSwipeLeft, onSwipeRight, children }) {
  const startX = useRef(0);

  return (
    <div
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const delta = e.changedTouches[0].clientX - startX.current;
        if (delta < -50) onSwipeLeft?.();
        if (delta > 50) onSwipeRight?.();
      }}
    >
      {children}
    </div>
  );
}
```

---

## 4. Mobile Modal / Bottom Sheet

```tsx
function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div
        className="
        relative bg-white w-full rounded-t-2xl p-6
        md:w-auto md:max-w-lg md:rounded-2xl
        max-h-[90vh] overflow-y-auto
        pb-safe
      "
      >
        {/* Drag handle (mobile only) */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
        {children}
      </div>
    </div>
  );
}
```

---

## 5. Viewport Height Fix (Mobile Browser Chrome)

```tsx
// Fix 100vh on mobile browsers (address bar issue)
useEffect(() => {
  const setVH = () => {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  };
  setVH();
  window.addEventListener("resize", setVH);
  return () => window.removeEventListener("resize", setVH);
}, []);
```

```css
/* Use --vh instead of vh */
.full-height {
  height: calc(var(--vh, 1vh) * 100);
}
```

---

## 6. Infinite Scroll (replaces pagination on mobile)

```tsx
import { useInView } from "react-intersection-observer";

function InfiniteList({ fetchMore }: { fetchMore: () => void }) {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) fetchMore();
  }, [inView]);

  return (
    <>
      {/* list items */}
      <div ref={ref} className="h-10" /> {/* sentinel */}
    </>
  );
}
// npm i react-intersection-observer
```

---

## 7. Prevent Body Scroll When Modal Open

```tsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  } else {
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  }
  return () => {
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  };
}, [isOpen]);
```
