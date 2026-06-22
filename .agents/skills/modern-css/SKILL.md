---
name: modern-css
description: Write cutting-edge and modern native CSS. Apply this skill whenever writing, reviewing, or refactoring CSS for components, layouts, design systems, or theming, even if the user doesn't say "modern CSS" explicitly. Covers a self-contained design-token scale (color, size, shadow, ease, type), cascade layers (@layer), @scope for component isolation (donut scopes, :scope specificity, scoping proximity), container queries, :has(), OKLCH/color-mix, native nesting, subgrid, fluid typography via clamp(), scroll-driven animations, logical properties, and concrete native replacements for SCSS mixins, maps, and variables.
---

# Modern CSS (2026 Edition)

Write clean, high-performance, maintainable CSS using **only the native web platform**. No build step (Sass/Less), no utility-first framework (Tailwind), no runtime style library (CSS-in-JS), and **no third-party token package either** — not even a CSS-only one. Everything below is plain `.css` you write and own.

The token scale conventions here (numbered size/color steps, named shadow/ease tiers, etc.) are inspired by the kind of taxonomy popularized by open-source CSS variable libraries — borrow the *naming pattern*, not the dependency. Hand-roll your own `:root` scale once per project; it's a few hundred lines you fully control, versus a package you import.

## Table of Contents

1. Hand-Rolled Design Tokens (the Library-Inspired Pattern)
2. Layer Architecture
3. `@scope` — Component Isolation
4. Container Queries
5. `:has()` — The Parent Selector
6. Color: OKLCH and `color-mix()`
7. Fluid Typography & Spacing
8. Logical Properties
9. `:where()` and `:is()`
10. Native CSS Nesting
11. Layout: Grid First, Subgrid, Flexbox for Alignment
12. Dynamic Viewport Units
13. Scroll-Driven Animations
14. `@property` — Typed Custom Properties
15. Anchor Positioning
16. Replacing SCSS — Reference Table
17. Layout Primitives (Objects Layer)
18. Putting It Together: Token + Theme Baseline
19. Modern Reset
20. Quick Reference: Do This, Not That
21. Agent Implementation Checklist

---

## Core Philosophy

1. **Hand-roll one small token file, once.** Define your own numbered scales for color, space, type, shadow, and motion directly in `:root`. This replaces both a Sass `$variables` file and a third-party CSS-variable package — no import, no version to track, no bytes you didn't write yourself.
2. **Leverage the platform.** CSS now handles nesting, scoping, container queries, color manipulation, and typed properties natively. Don't reach for a preprocessor first.
3. **Container over viewport.** Components should respond to their *parent container* (`@container`), not the global viewport (`@media`). This makes components genuinely reusable.
4. **Control the cascade explicitly.** Use `@layer` to define a specificity hierarchy upfront. Eliminates `!important` wars and BEM gymnastics.
5. **Fluid, not stepped.** Use `clamp()`, `min()`, `max()` for typography and spacing that scale continuously, not just at fixed breakpoints.
6. **Logical, not physical.** Use `margin-inline`, `padding-block`, `inset-inline-start` instead of `left`/`right`/`top`/`bottom` — RTL and writing-mode support for free.
7. **Runtime composition.** CSS custom properties cascade dynamically at runtime. Prefer `var(--param)` over Sass compile-time parameters.
8. **Scope, don't over-specify.** Use `@scope` to isolate component styles without high-specificity selectors — it's Baseline 2025 and safe to rely on.
9. **Progressive enhancement.** Build a solid baseline, then layer in enhancements with `@supports`.

---

## 1. Hand-Rolled Design Tokens (the Library-Inspired Pattern)

A well-known category of open-source CSS variable packages popularized a useful *taxonomy*: numbered steps for color and size (`--gray-1` … `--gray-9`, `--size-1` … `--size-8`), named tiers for shadow and easing (`--shadow-1` … `--shadow-3`), and fluid scales built from `clamp()`. That naming pattern is worth copying. The dependency is not — it's trivial to write the same shape of scale yourself, fully self-contained, in well under 100 lines.

Write this once per project, in a `tokens` layer, with **zero imports**:

```css
@layer tokens {
  :root {
    /* ---- Color steps — write your own OKLCH ramp per hue you need ---- */
    --gray-0:  oklch(99% 0.002 250);
    --gray-1:  oklch(96% 0.004 250);
    --gray-2:  oklch(91% 0.006 250);
    --gray-3:  oklch(83% 0.008 250);
    --gray-4:  oklch(72% 0.010 250);
    --gray-5:  oklch(60% 0.012 250);
    --gray-6:  oklch(48% 0.014 250);
    --gray-7:  oklch(36% 0.014 250);
    --gray-8:  oklch(26% 0.012 250);
    --gray-9:  oklch(16% 0.010 250);

    --violet-3: oklch(78% 0.14 295);
    --violet-6: oklch(58% 0.20 295);
    --violet-9: oklch(32% 0.16 295);

    --red-6:   oklch(58% 0.21 25);
    --green-6: oklch(62% 0.17 150);

    /* ---- Size steps — rem-based, like a numbered spacing scale ---- */
    --size-1: 0.25rem;
    --size-2: 0.5rem;
    --size-3: 0.75rem;
    --size-4: 1rem;
    --size-5: 1.5rem;
    --size-6: 2rem;
    --size-7: 3rem;
    --size-8: 4rem;

    /* ---- Fluid size steps — clamp()-based, for hero-scale spacing ---- */
    --size-fluid-1: clamp(1rem, 2vw, 1.5rem);
    --size-fluid-2: clamp(1.5rem, 3vw, 2rem);
    --size-fluid-3: clamp(2rem, 4vw, 3rem);

    /* ---- Type scale ---- */
    --font-size-0: 0.75rem;
    --font-size-1: 1rem;
    --font-size-2: 1.25rem;
    --font-size-3: 1.5rem;
    --font-size-4: 2rem;
    --font-size-fluid-1: clamp(1.25rem, 1rem + 1vw, 1.75rem);
    --font-size-fluid-2: clamp(2rem, 1.5rem + 2.5vw, 3.5rem);
    --font-lineheight-tight: 1.1;
    --font-lineheight-base: 1.5;

    /* ---- Shadow tiers — tune one color/strength pair, derive the rest ---- */
    --shadow-color: 250 10% 10%;
    --shadow-strength: 6%;
    --shadow-1: 0 1px 2px hsl(var(--shadow-color) / calc(var(--shadow-strength) + 6%));
    --shadow-2: 0 4px 12px hsl(var(--shadow-color) / calc(var(--shadow-strength) + 8%));
    --shadow-3: 0 12px 32px hsl(var(--shadow-color) / calc(var(--shadow-strength) + 10%));

    /* ---- Easing tiers ---- */
    --ease-1: cubic-bezier(0.25, 0, 0.5, 1);
    --ease-2: cubic-bezier(0.3, 0, 0.4, 1);
    --ease-out-3: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-spring-2: cubic-bezier(0.5, 1.5, 0.4, 1);

    /* ---- Radii ---- */
    --radius-1: 4px;
    --radius-2: 12px;
    --radius-3: 24px;
    --radius-round: 9999px;

    /* ---- Aspect ratios ---- */
    --ratio-square: 1;
    --ratio-widescreen: 16 / 9;
    --ratio-golden: 1.618 / 1;
  }
}
```

That's the entire "library." It costs nothing at runtime beyond what you wrote, has no version drift, and every value is one click away in DevTools because it's literally in your stylesheet.

### Then build a semantic alias layer on top

Never reference `--gray-6` or `--violet-6` directly inside component CSS. Alias them once, theme by swapping the alias block:

```css
@layer tokens {
  :root {
    --brand:     var(--violet-6);
    --text-1:    var(--gray-9);
    --text-2:    var(--gray-7);
    --surface-1: var(--gray-0);
    --surface-2: var(--gray-1);
    --surface-3: var(--gray-2);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --brand:     var(--violet-3);
      --text-1:    var(--gray-1);
      --text-2:    var(--gray-3);
      --surface-1: var(--gray-9);
      --surface-2: var(--gray-8);
      --surface-3: var(--gray-7);
    }
  }
}
```

Components reference `var(--text-1)`, `var(--space-m)`, etc. — never raw steps, never raw literals.

### When the project genuinely needs more than ~20 colors or a generated ramp

Generate a hue ramp algorithmically with `oklch()` math instead of writing 13 hand-tuned stops, or use `color-mix()` to derive tints/shades from a single base:

```css
:root {
  --brand: oklch(58% 0.2 295);
  --brand-tint-1: color-mix(in oklch, var(--brand), white 20%);
  --brand-tint-2: color-mix(in oklch, var(--brand), white 40%);
  --brand-shade-1: color-mix(in oklch, var(--brand), black 15%);
  --brand-shade-2: color-mix(in oklch, var(--brand), black 30%);
}
```

This is the native equivalent of a Sass color-ramp function — no map, no loop, just `color-mix()` calls you can read top to bottom.

---

## 2. Layer Architecture — Start Every Project Here

Declare layer order at the very top of your root stylesheet. Later layers win over earlier ones, **regardless of specificity**.

```css
@layer reset, tokens, base, objects, components, utilities;

@import url('reset.css')      layer(reset);
@import url('tokens.css')     layer(tokens);   /* your hand-rolled scale from §1 */
@import url('base.css')       layer(base);
@import url('objects.css')    layer(objects);  /* Layout primitives */
@import url('components.css') layer(components);
@import url('utilities.css')  layer(utilities);
```

This replaces BEM-heavy and Sass-heavy architectures with an explicit, readable hierarchy.

```css
@layer components {
  .button {
    background: var(--brand);
    padding: var(--size-2) var(--size-4);
  }
}

@layer utilities {
  /* Wins over .button despite lower specificity — layer order beats it */
  .bg-alert { background: var(--red-6); }
}
```

**Key insight:** layer order determines the winner, not selector specificity. A low-specificity rule in a later layer beats a high-specificity rule in an earlier layer.

---

## 3. `@scope` — Component Isolation Without High Specificity

`@scope` is **Baseline 2025** ("Newly available" as of December 2025) — it's now safe to use as a primary tool, with awareness that very old browsers/devices won't get the scoping (but will still see the declarations, since `@scope` degrades by simply not limiting the selector rather than breaking the page).

### Syntax: standalone vs. inline

```css
/* Standalone, anywhere in your stylesheet */
@scope (scope-root) to (scope-limit) {
  /* scoped style rules */
}
```

```html
<!-- Inline: scope is the <style> element's enclosing parent, no prelude needed -->
<section class="article-body">
  <style>
    @scope {
      img { border-radius: var(--radius-2); }
    }
  </style>
</section>
```

### Donut scopes — upper bound inclusive, lower bound exclusive (by default)

```css
/* Style <img> inside .article-body, but NOT inside a <figure> */
@scope (.article-body) to (figure) {
  img {
    border: 1px solid var(--gray-6);
    border-radius: var(--radius-2);
  }
}
```

The scope root (`.article-body`) is **included**; the scope limit (`figure`) is **excluded**. To change this, combine either boundary with `> *`:

| Pattern | Effect |
|:---|:---|
| `@scope (root) to (limit > *)` | both bounds inclusive |
| `@scope (root > *) to (limit)` | both bounds exclusive |
| `@scope (root > *) to (limit > *)` | exclusive upper, inclusive lower |

### `:scope` — styling the root itself, and conditional limits

Inside an `@scope` block, `:scope` refers to the scope root and can be styled directly:

```css
@scope (.card) {
  :scope {
    background: var(--surface-2);
    border-radius: var(--radius-3);
  }

  h3 { color: var(--brand); }
}
```

`:scope` can also appear in the **scope-limit** selector to express relationships:

```css
/* `figure` is only a limit when it's a DIRECT CHILD of the scope root */
@scope (.article-body) to (:scope > figure) { /* … */ }

/* `figure` is only a limit when the scope root is nested inside .feature */
@scope (.article-body) to (.feature :scope figure) { /* … */ }
```

Scoped style rules can never select *outside* the subtree — a selector like `:scope + p` is invalid.

You can also scope to **multiple roots/limits at once** with selector lists:

```css
@scope (.article-hero, .article-body) to (figure) {
  img { border-radius: var(--radius-2); }
}
```

### Specificity inside `@scope` — the part people get wrong

Bare selectors and the `&` nesting selector **inside an `@scope` block behave as if `:where(:scope)` were prepended**. Since `:where()` has zero specificity, this means `&`/bare selectors at the top of a scope contribute **zero extra specificity** — the weight comes only from the rest of the selector:

```css
@scope (.article-body) {
  /* specificity 0-0-1, same as plain `img` */
  img { /* … */ }

  /* ALSO 0-0-1 — & adds nothing */
  & img { /* … */ }

  /* explicit :scope is a pseudo-class → adds 0-1-0 */
  /* :scope img → 0-1-1 */
  :scope img { /* … */ }
}
```

> ⚠️ The exact handling of `&` specificity inside `@scope` has historically varied by browser engine/version — if you need pixel-perfect cross-browser specificity guarantees today, prefer plain bare selectors over `& selector` at the top level of a scope, and verify in your target browsers.

### Scoping proximity — a new cascade criterion

`@scope` adds **scoping proximity** to the cascade: when two scopes have conflicting declarations for the same element, the one whose scope root is *closer* (fewer DOM hops) wins — **overriding source order**, but **overridden by** `!important`, cascade layers, and specificity.

```css
/* Nested theme cards: an inner .light-theme inside an outer .dark-theme
   should render with light-theme text, even though .dark-theme p
   comes later in source order. */

@scope (.light-theme) {
  :scope { background: var(--gray-0); }
  p      { color: var(--gray-9); }
}

@scope (.dark-theme) {
  :scope { background: var(--gray-9); }
  p      { color: var(--gray-0); }
}
```

The innermost `<p>` is one hop from its nearest `.light-theme` ancestor but two hops from `.dark-theme` — proximity makes the light-theme rule win, fixing a class of bugs that previously required `!important` or extra specificity hacks.

### The inheritance caveat

`@scope` limits **selector matching**, not **inheritance**. Inherited properties (`color`, `font-family`, `line-height`, etc.) still flow past a scope limit into descendants — `@scope` is not a style-containment boundary. If you need true containment, pair it with `contain: style` or reset the inherited properties explicitly at the limit.

### When to reach for `@scope`

- Theming nested/overlapping sections (light card inside dark page, etc.)
- Styling third-party or CMS-generated markup where you can't add classes deep in the tree
- Component libraries where you want `img`, `a`, `h2` etc. to be styled *only* within the component root, without writing `.my-component img`
- Donut scopes: style "everything except the nested widget" cleanly

---

## 4. Container Queries (`@container`)

The biggest layout paradigm shift since Flexbox/Grid. Components respond to their **container**, not the viewport.

```css
/* 1. Name the container */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* 2. Base styles */
.card {
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

/* 3. Respond to the container's size */
@container card (width > 420px) {
  .card {
    flex-direction: row;
    align-items: center;
  }
}
```

Use `container-type: inline-size` for width-responsive components; use `size` only when you genuinely need both dimensions. **Container queries are always preferred over `@media` for component-level layout** — a card should look the same whether it's in a 3-column grid or a narrow sidebar, driven by its own box, not the viewport.

---

## 5. `:has()` — The Parent Selector

```css
/* Pad a card differently when it contains an image */
.card:has(img) { padding: 0; overflow: hidden; }

/* Form validation state without JS */
fieldset:has(input:invalid:not(:focus)) {
  border-color: var(--red-6);
}

/* Theme toggle via a checkbox — no JS class toggling */
body:has(#dark-mode:checked) {
  --surface-1: var(--gray-9);
  --text-1: var(--gray-0);
}

/* Style nav chrome when a mobile menu is open */
nav:has([aria-expanded="true"]) .nav__overlay { display: block; }
```

`:has()` replaces an enormous amount of JavaScript state management. Pair it with accessibility attributes (`[aria-expanded]`, `[aria-selected]`, `:checked`, `:invalid`) for accessible, JS-free UI state.

---

## 6. Color: OKLCH and `color-mix()`

OKLCH gives perceptually uniform brightness — adjusting lightness predictably, without HSL's muddy midpoints. Write your hand-rolled color steps (§1) in `oklch()`, and derive variants at the point of use rather than hand-tuning extra stops:

```css
:root {
  --brand:       var(--violet-6);
  --brand-light: color-mix(in oklch, var(--brand), white 25%);
  --brand-dark:  color-mix(in oklch, var(--brand), black 20%);

  /* Relative color syntax for a translucent variant */
  --brand-subtle: oklch(from var(--brand) l c h / 0.12);
}

.button:hover {
  background: color-mix(in oklch, var(--brand), white 15%);
}
```

**Avoid hex and HSL for new design tokens.** OKLCH is perceptually uniform, interpolates beautifully, and is supported in all modern browsers — write it directly rather than converting from a hex value you already have.

---

## 7. Fluid Typography & Spacing with `clamp()`

One rule, no breakpoints. This is the same fluid-scale shape referenced in §1 — write it once in your tokens layer:

```css
@layer tokens {
  :root {
    --text-sm:   clamp(0.875rem, 0.8rem + 0.4vw, 1rem);
    --text-base: clamp(1rem,     0.9rem + 0.5vw, 1.25rem);
    --text-lg:   clamp(1.125rem, 1rem   + 0.7vw, 1.5rem);
    --text-xl:   clamp(1.5rem,   1.2rem + 1.5vw, 2.5rem);
    --text-2xl:  clamp(2rem,     1.5rem + 2.5vw, 4rem);

    --space-xs:  clamp(0.25rem,  0.5vw,  0.5rem);
    --space-s:   clamp(0.5rem,   1vw,    0.75rem);
    --space-m:   clamp(1rem,     2.5vw,  1.5rem);
    --space-l:   clamp(1.5rem,   4vw,    3rem);
    --space-xl:  clamp(3rem,     8vw,    6rem);
  }
}
```

Use a fluid-scale calculator (e.g. [Utopia.fyi](https://utopia.fyi)) to derive the exact min/max/preferred values for your project's breakpoints, then paste the result here as plain custom properties — no import required. Every token flows smoothly between min and max; no stepped breakpoints needed.

---

## 8. Logical Properties

```css
/* Physical (avoid in new code) */
margin-left: 1rem;
padding-right: 2rem;
border-top: 1px solid;

/* Logical (use these instead) */
margin-inline-start: var(--size-3);  /* left in LTR, right in RTL */
padding-inline-end: var(--size-4);   /* right in LTR, left in RTL */
border-block-start: 1px solid;       /* top in horizontal writing mode */

/* Common patterns */
margin-inline: auto;             /* center horizontally */
padding-block: var(--space-m);   /* top + bottom padding */
inset-inline-start: 0;           /* left edge, RTL-safe */
```

---

## 9. `:where()` and `:is()` — Specificity Management

```css
/* :where() — specificity = 0, easy to override anywhere */
:where(h1, h2, h3, h4) {
  line-height: var(--font-lineheight-tight);
  text-wrap: balance;
}

/* Great for design systems / libraries */
:where(.prose h1, .prose h2, .prose h3) {
  margin-block-end: var(--space-s);
}

/* :is() — takes the specificity of its most specific argument */
:is(button, a.btn, [role="button"]) {
  cursor: pointer;
  user-select: none;
}
```

Use `:where()` as your default for shared base styles — they're always overridable. Use `:is()` when you want specificity to propagate. (Recall from [§3](#3-scope--component-isolation-without-high-specificity) that bare selectors inside `@scope` already behave like `:where(:scope) …` — the two mechanisms compose naturally.)

---

## 10. Native CSS Nesting

```css
.card {
  padding: var(--space-m);
  border-radius: var(--radius-2);

  /* Type selectors for descendants — no & needed */
  .card__title {
    font-size: var(--text-lg);
    color: var(--text-1);
  }

  /* Pseudo-states and combinators always need & */
  &:hover {
    box-shadow: var(--shadow-3);

    .card__title { color: var(--brand); }
  }

  /* Media/container queries nest too */
  @container card (width > 400px) {
    display: grid;
    grid-template-columns: auto 1fr;
  }
}
```

Keep nesting **max 2–3 levels**. Deep nesting recreates the BEM problem in a different form.

---

## 11. Layout: Grid First, Subgrid, Flexbox for Alignment

```css
/* Full-bleed layout with a centered content column */
.layout {
  display: grid;
  grid-template-columns:
    minmax(var(--space-m), 1fr)
    min(60ch, 100%)
    minmax(var(--space-m), 1fr);
}
.layout > * { grid-column: 2; }
.layout > .full-bleed { grid-column: 1 / -1; }

/* Responsive card grid — no media queries */
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: var(--space-m);
}

/* Subgrid — align nested card internals across a row */
.card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
}
```

Use **Flexbox** for one-dimensional UI (toolbars, nav rows, button groups, centering a single item). Use **Grid** for two-dimensional layout and anything that needs alignment across rows — and reach for **subgrid** whenever a repeated component's internal rows need to line up with its siblings.

---

## 12. Dynamic Viewport Units

```css
.hero    { min-height: 100dvh; } /* Dynamic: adjusts as browser chrome shows/hides */
.drawer  { height: 100svh; }     /* Small: assumes chrome is fully visible */
.overlay { max-height: 100lvh; } /* Large: assumes chrome is hidden */
```

Never use `100vh` for full-screen mobile layouts — it breaks when the address bar shows/hides. Use `100dvh` instead.

---

## 13. Scroll-Driven Animations

Replace heavy JS scroll listeners with pure CSS.

```css
/* Reading progress bar */
.progress {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  height: 3px;
  background: var(--brand);
  transform-origin: 0 50%;
  animation: grow-bar linear;
  animation-timeline: scroll(root);
}
@keyframes grow-bar {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

/* Fade-in on scroll entry */
.reveal {
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 10% cover 35%;
  animation-timing-function: var(--ease-out-3);
}
@keyframes fade-up {
  from { opacity: 0; translate: 0 2rem; }
  to   { opacity: 1; translate: 0 0; }
}
```

Always pair scroll-driven animations with `@media (prefers-reduced-motion: reduce)` to disable them for users who prefer it.

---

## 14. `@property` — Typed Custom Properties

Animatable, typed, scoped custom properties — useful for building your own "mixin-like" component APIs.

```css
@property --hue {
  syntax: "<number>";
  inherits: false;
  initial-value: 260;
}

@property --card-radius {
  syntax: "<length>";
  inherits: true;
  initial-value: 12px;
}

/* --hue can now be smoothly animated */
.hero {
  background: oklch(62% 0.18 var(--hue));
  animation: shift-hue 6s linear infinite;
}
@keyframes shift-hue {
  to { --hue: 360; }
}
```

Without `@property`, animating a custom property snaps instantly at 50%. With it, the browser understands the type and interpolates properly.

---

## 15. Anchor Positioning

Position floating UI relative to any anchor element — no JS, no Popper/Floating UI.

```css
.trigger {
  anchor-name: --my-popover;
}

.popover {
  position: absolute;
  position-anchor: --my-popover;
  inset-block-end: anchor(top);  /* popover sits above the trigger */
  inset-inline-start: anchor(center);
  translate: -50% 0;
  position-try-fallbacks: flip-block, flip-inline; /* auto-reposition on overflow */
}
```

Check browser support for your target audience before relying on this for critical UI; fallbacks/polyfills exist.

---

## 16. Replacing SCSS — Reference Table

| Old SCSS Pattern | Modern CSS Replacement |
|:---|:---|
| `$colors: (...)` color map | A hand-rolled numbered `--gray-1`…`--gray-9` scale (§1) + your own semantic aliases |
| `@mixin flex-center` | Utility class `.grid-center { display:grid; place-items:center }` |
| `@mixin button($bg, $fg)` | `var(--btn-bg)` / `var(--btn-fg)` set per-variant via custom properties |
| `@mixin mobile { @media ... }` | `@container (width < 500px)` |
| `@mixin card { ... }` | `@layer components { .card { ... } }` |
| `@mixin stack($gap)` | `.stack { gap: var(--stack-gap, var(--space-m)) }` + inline style override |
| Sass nesting | Native CSS nesting |
| Sass variables / `$variable` | CSS custom properties — your own `--foo: value` scale |
| `color.adjust($c, $lightness: 10%)` | `color-mix(in oklch, var(--c), white 10%)` |
| Deeply-specific selector for a subtree (`.feature > .body > img`) | `@scope (.body) { img { … } }` |
| Theming via duplicated selector blocks | `@scope` + scoping proximity |
| `@for $i from 1 through 12` | No native loop — only genuine remaining logic gap |

**The key shift:** Sass generates CSS at compile time. Modern CSS *composes behavior at runtime* via the cascade. Runtime composition is more powerful: it responds to context, inherits through the DOM, and is inspectable live in DevTools.

---

## 17. Layout Primitives (Objects Layer)

These reusable layout objects replace "layout mixins" and form the `objects` layer.

```css
@layer objects {
  /* Stack: vertical flow with consistent spacing */
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--stack-gap, var(--space-m));
  }

  /* Cluster: wrapping row of items */
  .cluster {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cluster-gap, var(--space-s));
    align-items: var(--cluster-align, center);
  }

  /* Sidebar: sidebar + main content, collapses below threshold */
  .sidebar-layout {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sidebar-gap, var(--space-m));
  }
  .sidebar-layout > :first-child {
    flex-basis: var(--sidebar-width, 20ch);
    flex-grow: 1;
  }
  .sidebar-layout > :last-child {
    flex-basis: 0;
    flex-grow: 999;
    min-inline-size: var(--content-min, 50%);
  }

  /* Center: constrained centered column */
  .center {
    box-sizing: content-box;
    max-inline-size: var(--center-max, 72ch);
    margin-inline: auto;
    padding-inline: var(--space-m);
  }

  /* Auto-grid: responsive columns, no media queries */
  .auto-grid {
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(min(var(--auto-grid-min, 250px), 100%), 1fr)
    );
    gap: var(--auto-grid-gap, var(--space-m));
  }
}
```

Customize any primitive per-instance with inline custom properties:

```html
<div class="stack" style="--stack-gap: var(--space-l)">…</div>
```

---

## 18. Putting It Together: Token + Theme Baseline

A complete, self-contained starting point — copy this into `tokens.css`, no imports involved:

```css
@layer tokens {
  :root {
    /* Color steps */
    --gray-0:  oklch(99% 0.002 250);
    --gray-1:  oklch(96% 0.004 250);
    --gray-2:  oklch(91% 0.006 250);
    --gray-7:  oklch(36% 0.014 250);
    --gray-8:  oklch(26% 0.012 250);
    --gray-9:  oklch(16% 0.010 250);
    --violet-3: oklch(78% 0.14 295);
    --violet-6: oklch(58% 0.20 295);
    --red-6:   oklch(58% 0.21 25);
    --green-6: oklch(62% 0.17 150);

    /* Semantic aliases */
    --brand:     var(--violet-6);
    --text-1:    var(--gray-9);
    --text-2:    var(--gray-7);
    --surface-1: var(--gray-0);
    --surface-2: var(--gray-1);
    --surface-3: var(--gray-2);
    --error:     var(--red-6);
    --success:   var(--green-6);

    /* Space — fluid */
    --space-xs:  clamp(0.25rem,  0.5vw,  0.5rem);
    --space-s:   clamp(0.5rem,   1vw,    0.75rem);
    --space-m:   clamp(1rem,     2.5vw,  1.5rem);
    --space-l:   clamp(1.5rem,   4vw,    3rem);
    --space-xl:  clamp(3rem,     8vw,    6rem);

    /* Typography — fluid */
    --text-sm:   clamp(0.875rem, 0.8rem + 0.4vw, 1rem);
    --text-base: clamp(1rem,     0.9rem + 0.5vw, 1.2rem);
    --text-lg:   clamp(1.125rem, 1rem   + 0.7vw, 1.5rem);
    --text-xl:   clamp(1.5rem,   1.2rem + 1.5vw, 2.25rem);
    --text-2xl:  clamp(2rem,     1.5rem + 2.5vw, 4rem);

    /* Radii */
    --radius-1: 4px;
    --radius-2: 12px;
    --radius-3: 24px;
    --radius-round: 9999px;

    /* Shadows */
    --shadow-1: 0 1px 2px oklch(0% 0 0 / 0.08);
    --shadow-2: 0 4px 12px oklch(0% 0 0 / 0.1);
    --shadow-3: 0 12px 40px oklch(0% 0 0 / 0.15);

    /* Easing */
    --ease-out-3: cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Dark mode — one block, all aliases re-pointed */
  @media (prefers-color-scheme: dark) {
    :root {
      --surface-1: var(--gray-9);
      --surface-2: var(--gray-8);
      --surface-3: var(--gray-7);
      --text-1:    var(--gray-1);
      --text-2:    var(--gray-2);
      --brand:     var(--violet-3);
    }
  }
}
```

Every component then references `var(--text-1)`, `var(--space-m)`, etc. — never raw color steps, never raw literals. Extend the color/size steps as the project grows; the whole file rarely needs to exceed 100–150 lines even for a fairly large design system.

---

## 19. Modern Reset (Minimal)

```css
@layer reset {
  *, *::before, *::after { box-sizing: border-box; }

  html {
    text-size-adjust: none;
    hanging-punctuation: first last;
  }

  body {
    min-height: 100dvh;
    margin: 0;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, p, figure, blockquote, dl { margin: 0; }

  ul[role="list"], ol[role="list"] { list-style: none; padding: 0; margin: 0; }

  img, video, canvas, svg { max-width: 100%; display: block; height: auto; }

  input, button, textarea, select { font: inherit; color: inherit; }

  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

---

## 20. Quick Reference: Do This, Not That

| Avoid | Prefer | Why |
|:---|:---|:---|
| Importing a third-party CSS variable package | A ~100-line hand-rolled token file (§1, §18) | Zero dependency, zero version drift, fully inspectable |
| `@media (max-width: 768px)` for components | `@container (width < 500px)` | Components adapt to layout context, not viewport |
| `.parent .child .grandchild` | `@scope (.parent) { .child { … } }` | Decoupled, near-zero added specificity |
| Duplicated theme selector blocks (`.dark p`, `.light p`) | `@scope (.theme-x) { p { … } }` per theme | Scoping proximity resolves nesting conflicts |
| `margin-left` / `padding-right` | `margin-inline-start` / `padding-inline-end` | RTL-safe automatically |
| `#3b82f6` / `hsl(220 90% 56%)` | `oklch(62% 0.22 250)` | Perceptually uniform, predictable |
| JS scroll listeners for animation | `animation-timeline: scroll()` / `view()` | Off-main-thread, no JS |
| JS for dark-mode class toggling | `:root { … }` + `@media (prefers-color-scheme: dark)` | Native, respects OS setting |
| Sass `$variable` / `$map` | Hand-rolled `--custom-property` scale | Runtime, cascading, DevTools-inspectable |
| `100vh` on mobile | `100dvh` | Accounts for dynamic browser chrome |
| `@mixin stack($gap)` | `.stack { gap: var(--stack-gap, var(--space-m)) }` | Runtime configurable |
| Deep nesting (4+ levels) | Max 2–3 levels | Readability, mirrors DOM depth |

---

## 21. Agent Implementation Checklist

When starting a CSS project or component:

1. **Write a self-contained token file first** (§1, §18) — numbered color/size steps in OKLCH, plus a semantic alias layer. No imports, no dependencies.
2. **Declare layer order** at the top of the root file: `@layer reset, tokens, base, objects, components, utilities;`
3. **Add a container context** on any wrapper element whose children need responsive behavior.
4. **Use `@scope`** for component isolation instead of high-specificity selectors; reach for donut scopes and scoping proximity when theming nested sections.
5. **Check for `:has()` opportunities** — any JS that adds/removes state classes is likely replaceable.
6. **Style accessibility attributes** (`[aria-expanded]`, `[aria-disabled]`, `:checked`, `[required]`) rather than custom state classes.
7. **Use logical properties** throughout — `inline`/`block` instead of `left`/`right`/`top`/`bottom`.
8. **Test reduced-motion** — every animation should have a fallback in `@media (prefers-reduced-motion: reduce)`.
9. If a project needs more colors or scales than the starter token file, **extend it by hand** (more OKLCH steps, more aliases) rather than importing a library.