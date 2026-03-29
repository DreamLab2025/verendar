# Tailwind CSS — Mobile-First Responsive Patterns

## Breakpoint Reference

| Prefix | Min-width | Device                     |
| ------ | --------- | -------------------------- |
| (none) | 0px       | Mobile (base)              |
| `sm:`  | 640px     | Large phone / small tablet |
| `md:`  | 768px     | Tablet                     |
| `lg:`  | 1024px    | Desktop                    |
| `xl:`  | 1280px    | Large desktop              |

**Rule:** Write base classes for mobile, add `md:` / `lg:` for larger screens.

---

## Common Conversion Patterns

```html
<!-- Columns -->
<div class="flex flex-col md:flex-row gap-4">
  <!-- Show/Hide -->
  <nav class="hidden md:flex">
    <!-- desktop only -->
    <button class="block md:hidden">
      <!-- mobile only -->

      <!-- Typography -->
      <h1 class="text-2xl md:text-4xl lg:text-6xl font-bold">
        <p class="text-sm md:text-base">
          <!-- Spacing -->
        </p>

        <section class="px-4 py-6 md:px-12 md:py-16">
          <div class="p-4 md:p-8">
            <!-- Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Width -->
              <div class="w-full md:w-1/2 lg:w-1/3">
                <div class="max-w-sm mx-auto md:max-w-none">
                  <!-- Position/Fixed -->
                  <nav class="fixed bottom-0 left-0 right-0 md:static"></nav>
                </div>
              </div>
            </div>
          </div>
        </section>
      </h1>
    </button>
  </nav>
</div>
```

---

## Touch Target Enforcement

```html
<!-- Minimum 44px touch target -->
<button class="min-h-[44px] min-w-[44px] px-4 py-2">Click</button>
<a class="inline-flex items-center min-h-[44px] px-4">Link</a>
```

---

## Tailwind Config: Custom Breakpoints

```js
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      xs: "375px", // small phones
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
};
```

---

## Container with Mobile Padding

```html
<!-- Consistent padding across breakpoints -->
<div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- content -->
</div>
```

---

## Safe Area (iOS Notch / Home Bar)

Install plugin: `npm i tailwindcss-safe-area`

```js
// tailwind.config.js
plugins: [require("tailwindcss-safe-area")];
```

```html
<div class="pb-safe">
  <!-- padding-bottom: env(safe-area-inset-bottom) -->
  <div class="pt-safe-or-4"><!-- max of safe area or 1rem --></div>
</div>
```

Without plugin:

```html
<style>
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>
```

---

## Aspect Ratios for Media

```html
<!-- Responsive video embed -->
<div class="aspect-video w-full">
  <iframe class="w-full h-full" src="..."></iframe>
</div>

<!-- Square image -->
<div class="aspect-square w-full overflow-hidden rounded-xl">
  <img class="w-full h-full object-cover" src="..." />
</div>
```
