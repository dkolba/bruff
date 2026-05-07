---
paths:
  - "packages/game-element/**/*.*"
---

# `@bruff/game-element` — Imperative Shell

This package is the **imperative shell** in the Functional Core / Imperative Shell pattern. It provides `GameElement`, the Web Component base class that mounts a full-viewport canvas inside an open shadow DOM.

- **Language**: TypeScript with TSDoc annotations.
- **Role**: The only place where shadow-DOM creation, canvas mounting, and Web Component lifecycle code lives. Pure game logic in `@bruff/game` consumes the canvas reference through this boundary and never touches the DOM directly.

## Package-specific allowances

- **GE-1** The `this` keyword is permitted here (per C-18's carve-out) — Web Component lifecycle methods (`connectedCallback`, `disconnectedCallback`, etc.) require it. It remains forbidden everywhere else.
- **GE-2** DOM access (`document`, `window`, `customElements`, `ShadowRoot`, `HTMLElement`) is allowed. This is the only package besides `@bruff/arcade` where it is.

## Package-specific obligations

- **GE-3 (MUST)** `connectedCallback` is idempotent — calling it more than once must not recreate the shadow root.
- **GE-4 (MUST)** Tests run in a real browser via Vitest + Playwright provider. Coverage thresholds are 100% for branches, functions, lines, and statements.
- **GE-5 (MUST)** No game logic, no `GameState`, no actions, no rendering decisions. This package is purely structural — it exposes a canvas, nothing more.
