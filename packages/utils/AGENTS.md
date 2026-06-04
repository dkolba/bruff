# `@bruff/utils`

This package contains shared, reusable utilities.

- **Language**: **TypeScript**.
- **Purpose**: To house generic pure functions (e.g., data manipulation, math helpers) on the universal root export and small shell-adjacent browser services on the DOM subpath export.
- **Typing**: While using `.ts` files, all type information **must be declared using TSDoc annotations**.
- **Style**: Must adhere to the "double quotes" and "two-space indentation" rule.

## Logging Event Bus

- **U-1 (MUST)** Production logging flows through `module/event-bus/`. Export `log()` / `onLog()` for emitters and subscribers; do not expose the private transport.
- **U-2 (MUST)** `consoleLogHandler` is exported only from `@bruff/utils/dom` and is the only production utility that calls `console.*`. Other utilities emit log events with `log()`.
- **U-3 (MUST)** Pure helpers must stay pure. Only shell-adjacent utilities may emit log events.

## Export Boundaries

- **U-4 (MUST)** `@bruff/utils` is universal and must be safe to import in Node.js and browsers. It must not re-export utilities that require DOM, Canvas, resize observer, animation frame, or console APIs.
- **U-5 (MUST)** `@bruff/utils/dom` is browser-only and owns DOM, Canvas, resize observer, animation, and console adapter utilities.
- **U-6 (MUST)** DOM utilities may import universal helpers from `@bruff/utils`, but universal helpers must not import from `@bruff/utils/dom` or DOM-only modules.

## Deterministic Helpers

- **U-7 (MUST)** PRNG helpers are pure value transformers. They accept explicit seed/state values, return the next state with the drawn value, and never read `Math.random()`, time, or module-level mutable state.
