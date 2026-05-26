# `@bruff/game-element` — Imperative Shell

This package is the **imperative shell** in the Functional Core / Imperative Shell pattern. It provides `GameElement`, the Web Component base class that mounts a full-viewport canvas inside an open shadow DOM and forwards workspace log events to the browser console while connected.

- **Language**: TypeScript with TSDoc annotations.
- **Role**: The only place where shadow-DOM creation, canvas mounting, log-bus console forwarding, and Web Component lifecycle code lives. Pure game logic in `@bruff/game` consumes the canvas reference through this boundary and never touches the DOM directly.

## Package-specific allowances

- **GE-1** The `this` keyword is permitted here (per C-18's carve-out) — Web Component lifecycle methods (`connectedCallback`, `disconnectedCallback`, etc.) require it. It remains forbidden everywhere else.
- **GE-2** DOM access (`document`, `window`, `customElements`, `ShadowRoot`, `HTMLElement`) is allowed. Other DOM-capable shell packages, such as `@bruff/arcade` and `@bruff/sigil`, document their own narrower allowances.

## Package-specific obligations

- **GE-3 (MUST)** `connectedCallback` is idempotent — calling it more than once must not recreate the shadow root.
- **GE-4 (MUST)** Tests run in a real browser via Vitest + Playwright provider. Coverage thresholds are 100% for branches, functions, lines, and statements.
- **GE-5 (MUST)** No game logic, no `GameState`, no actions, no rendering decisions. This package is structural shell wiring only: it exposes a canvas and owns the lifecycle of the console log forwarding subscription.
- **GE-6 (MUST)** `GameElement` subscribes to `onLog(consoleLogHandler)` idempotently in `connectedCallback` and unsubscribes in `disconnectedCallback`. Import `onLog` from `@bruff/utils` and `consoleLogHandler` from `@bruff/utils/dom`. Do not add direct `console.*` calls here; console output stays behind `consoleLogHandler`.
- **GE-7 (MUST)** The optional `testApi` surface is opaque shell wiring only. `GameElement` may store and expose it per instance, but it must not import `GameState`, actions, or game logic types to do so.
