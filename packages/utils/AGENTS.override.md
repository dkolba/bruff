# `@bruff/utils`

This package contains shared, reusable utilities.

- **Language**: **TypeScript**.
- **Purpose**: To house generic pure functions (e.g., data manipulation, math helpers) and small shell-adjacent browser services that are reusable across the workspace.
- **Typing**: While using `.ts` files, all type information **must be declared using TSDoc annotations**.
- **Style**: Must adhere to the "double quotes" and "two-space indentation" rule.

## Logging Event Bus

- **U-1 (MUST)** Production logging flows through `module/event-bus/`. Export `log()` / `onLog()` for emitters and subscribers; do not expose the private transport.
- **U-2 (MUST)** `consoleLogHandler` is the only production utility that calls `console.*`. Other utilities emit log events with `log()`.
- **U-3 (MUST)** Pure helpers must stay pure. Only shell-adjacent utilities may emit log events.
