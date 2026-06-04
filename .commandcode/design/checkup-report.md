# SILO Design Checkup Report

**Date**: 2026-06-04
**Score**: 35/60

## Vital Signs

| Vital | Status | Score /10 | Evidence |
|---|---|---|---|
| Intentionality | Healthy | 10 | Consistent dark iOS PWA language: rounded-xl/2xl cards, 3-tier elevation, amber accent, safe-area handling, tabular-nums for money |
| Readability | Watch | 5 | text-tertiary (#636366) fails WCAG AA on surface-elevated (#1c1c1e): ~2.1:1 (needs 4.5:1). text-secondary (#8e8e93) borderlines at ~3.9:1 |
| Usability | Watch | 5 | Solid mobile nav patterns (bottom sheet, FAB, tab bar). Weak: budget input uses browser prompt(), delete has no undo, no focus-visible rings on buttons |
| Responsiveness | Watch | 5 | Excellent iOS PWA orchestration with safe-area insets. But `user-scalable=no` + `maximum-scale=1.0` blocks zoom for low-vision users |
| Speed | Healthy | 10 | Vite build is fast, IndexedDB is snappy, no layout shift, SVG animation uses stroke-dasharray transitions (no layout triggers) |
| Accessibility | Critical | 0 | No visible focus indicators (outline-none everywhere), no aria-labels on icon buttons, donut chart is invisible to screen readers, no prefers-reduced-motion, SVG icons lack accessible names |

## Critical Issues

### 1. No keyboard navigation path
No element has visible focus indicators. `outline-none` on inputs, no `focus-visible` ring on buttons. A keyboard user can Tab into the app but cannot tell where they are.

**Fix**: Add `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface` to all interactive elements. Remove `outline-none` from text inputs or add a matching focus-visible style.

### 2. Text contrast failures
`text-tertiary` (#636366) on `surface-elevated` (#1c1c1e): contrast ratio ~2.1:1. Fails WCAG AA for both normal and large text. Used extensively for labels, helper text, and secondary information.

**Fix**: Lighten text-tertiary to at least #98989e (4.5:1) or #a3a3a8 (5.0:1).

### 3. Invisible donut chart to screen readers
The stats SVG donut chart has no `<title>`, no `role`, no `aria-label`. A screen reader user gets nothing.

**Fix**: Add `role="img"` and `<title>` element with a text summary like "Spending breakdown: Food 45%, Transport 30%, …"

### 4. No motion respect
Animations play regardless of `prefers-reduced-motion`. The fade-in, slide-up, spin, and donut chart transitions ignore the user's OS setting.

**Fix**: Add `@media (prefers-reduced-motion: reduce)` that disables animations, or use `motion-safe:` Tailwind prefixes.

### 5. Icon accessibility
Lucide-react icons render as SVGs without `aria-hidden` or accessible names. Icon-only buttons (X close, Trash delete, ← → arrows) have no `aria-label`.

**Fix**: Add `aria-label` to every icon-only button. Add `aria-hidden="true"` to decorative icons.

### 6. Zoom disabled
`user-scalable=no` and `maximum-scale=1.0` prevent pinch-to-zoom — an accessibility blocker for low-vision users who need to enlarge content.

**Fix**: Remove both restrictions. Keep `viewport-fit=cover` for notch handling.

## Watch Items

**Browser prompt() for budget** — functional but breaks the dark design language. Replace with an inline edit or bottom sheet for consistency.

**Delete has no undo** — a 3-second toast with "Undo" would be a safer pattern than confirm-then-reload.

**`text-[10px]` and `text-[11px]` sizes** — below Apple HIG minimum of 11pt. These are used for tertiary labels, not body text, but they're still small. Consider bumping to 11px/12px minimum.

## Prescriptions

1. Add `focus-visible` rings to all interactive elements (accessibility)
2. Lighten `text-tertiary` to meet WCAG AA (readability)
3. Add `aria-label` to all icon-only buttons (accessibility)
4. Add accessible name to donut chart SVG (accessibility)
5. Respect `prefers-reduced-motion` (accessibility)
6. Remove `user-scalable=no` (accessibility)
