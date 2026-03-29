# Layout Conversion: Desktop → Mobile

## Core Strategy: Mobile-First Rewrite

Always rewrite in mobile-first order: base styles = mobile, then `md:` / `@media` overrides for desktop.

---

## 1. Multi-Column Grid → Single Column Stack

**Desktop (bad on mobile):**

```css
.container {
  display: grid;
  grid-template-columns: 300px 1fr 250px;
}
```

```html
<!-- Tailwind -->
<div class="grid grid-cols-3 gap-6"></div>
```

**Mobile-first fix:**

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (min-width: 768px) {
  .container {
    flex-direction: row;
  }
}
```

```html
<!-- Tailwind -->
<div class="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-6"></div>
```

---

## 2. Sidebar + Main → Stacked / Drawer

```html
<!-- Before: fixed sidebar layout -->
<div class="flex">
  <aside class="w-64 h-screen">...</aside>
  <main class="flex-1">...</main>
</div>

<!-- After: sidebar hidden on mobile, shown on md+ -->
<div class="flex">
  <aside class="hidden md:block w-64 h-screen">...</aside>
  <main class="flex-1 w-full">...</main>
  <!-- Mobile: bottom nav or hamburger (see navigation-conversion.md) -->
</div>
```

---

## 3. Fixed Width → Fluid

```css
/* Before */
.card {
  width: 400px;
  padding: 32px;
}

/* After */
.card {
  width: 100%;
  max-width: 400px;
  padding: 16px;
}
@media (min-width: 768px) {
  .card {
    padding: 32px;
  }
}
```

---

## 4. Hero / Banner

```html
<!-- Before -->
<div class="h-[600px] flex items-center px-20">
  <h1 class="text-6xl">Title</h1>
</div>

<!-- After -->
<div class="min-h-[300px] md:h-[600px] flex items-center px-4 md:px-20">
  <h1 class="text-3xl md:text-6xl">Title</h1>
</div>
```

---

## 5. Horizontal Scroll Containers

For items that don't stack well (tags, chips, tabs):

```html
<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
  <!-- items stay in a row, user swipes -->
</div>
```

```css
.scroll-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 8px; /* prevent clipping */
}
```

---

## Spacing Scale (Desktop → Mobile)

| Desktop      | Mobile       |
| ------------ | ------------ |
| px-20 (80px) | px-4 (16px)  |
| py-16 (64px) | py-8 (32px)  |
| gap-8 (32px) | gap-4 (16px) |
| text-6xl     | text-3xl     |
| text-4xl     | text-2xl     |
| text-2xl     | text-xl      |
