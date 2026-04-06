---
name: ui-desktop-to-mobile
description: Refactor React/Next.js desktop UI to mobile with Tailwind or Styled Components. Use for layout, sidebar→bottom-tab nav, table→card, form optimization, touch targets, SSR-safe responsive.
license: Apache-2.0
version: 1.1.0
---

# UI Desktop → Mobile Refactor (React / Next.js)

Converts desktop-first React/Next.js components into mobile-optimized equivalents.
Supports **Tailwind CSS** and **Styled Components**. Applies mobile-first breakpoints,
touch UX patterns, and SSR-safe rendering strategies.

## When To Use

- Refactoring desktop React layout to mobile-first or responsive
- Converting sidebar navigation → bottom tab bar / hamburger drawer
- Converting data tables → card lists
- Optimizing forms for mobile keyboards and touch
- Fixing touch target sizes, safe areas, viewport height on mobile browsers

## Workflow Decision Tree

```
Component type?
├── Full page / layout  → references/layout-conversion.md
├── Navigation          → references/navigation-conversion.md
├── Table / Data grid   → references/table-to-card.md
└── Form                → references/form-mobile.md

CSS approach?
├── Tailwind CSS        → references/tailwind-responsive.md
└── Styled Components   → references/styled-components-responsive.md

React / Next.js patterns (hooks, SSR, bottom sheet, scroll lock)
                        → references/react-mobile-patterns.md
```

## Always-Apply Rules

| Rule                | Desktop  | Mobile                                                    |
| ------------------- | -------- | --------------------------------------------------------- |
| Touch targets       | N/A      | min 44×44px                                               |
| Font size on inputs | any      | ≥ 16px (prevents iOS zoom)                                |
| Tap spacing         | N/A      | ≥ 8px between interactive elements                        |
| Viewport meta       | —        | `width=device-width, initial-scale=1, viewport-fit=cover` |
| Images              | fixed px | `max-width: 100%` or `next/image` with `fill`             |
| Hover states        | required | add `:active` fallback                                    |
| vh units            | ok       | use `--vh` CSS var (see react-mobile-patterns.md)         |

## SSR Safety (Next.js)

Prefer CSS-based show/hide over JS `useMediaQuery` to avoid hydration mismatch:

```tsx
// ✅ SSR-safe
<div className="md:hidden"><MobileView /></div>
<div className="hidden md:block"><DesktopView /></div>

// ⚠️ Causes hydration mismatch on Next.js
const isMobile = useMediaQuery('(max-width: 767px)')
if (isMobile) return <MobileView />
```

## Scripts

- `scripts/audit_touch_targets.js` — scan project for touch targets < 44px
- `scripts/extract_breakpoints.js` — list all breakpoint usages in a file

## Assets

- `assets/mobile-checklist.md` — pre-launch mobile QA checklist
