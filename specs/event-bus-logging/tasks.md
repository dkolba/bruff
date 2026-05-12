# Event Bus Logging — Tasks

- [x] T1 — Add `LogLevel` type in `packages/utils/module/event-bus/log-level.ts`.
- [x] T2 — Add `LogEvent` type in `packages/utils/module/event-bus/log-event.ts`.
- [x] T3 — Add `isLogCustomEvent` type guard in `packages/utils/module/event-bus/is-log-custom-event.ts`.
- [x] T4 — Add unit tests for `isLogCustomEvent` covering match, wrong-name, non-CustomEvent, and malformed-detail cases in `packages/utils/module/event-bus/is-log-custom-event.test.ts`.
- [x] T5 — Implement `log` and `onLog` (with private singleton `EventTarget`) in `packages/utils/module/event-bus/event-bus.ts`.
- [x] T6 — Add unit tests for `event-bus`: emit-with-no-listeners, single subscriber receives event, unsubscribe stops delivery, multiple subscribers receive in registration order, double-unsubscribe is idempotent — in `packages/utils/module/event-bus/event-bus.test.ts`.
- [x] T7 — Implement `consoleLogHandler` in `packages/utils/module/event-bus/console-log-handler.ts` (switch on `LogLevel` → `console.{debug,info,warn,error}`; include `source` / `context` only when present).
- [x] T8 — Add unit tests for `consoleLogHandler` covering each `LogLevel`, with-and-without `source`, with-and-without `context` in `packages/utils/module/event-bus/console-log-handler.test.ts`.
- [x] T9 — Re-export `log`, `onLog`, `consoleLogHandler`, and the `LogLevel` / `LogEvent` types from `packages/utils/index.ts`.
- [x] T10 — Update `packages/utils/README.md` with an "Event bus" section documenting `log`, `onLog`, `consoleLogHandler`, `LogLevel`, `LogEvent`.
- [x] T11 — Add `@bruff/utils` workspace dependency to `packages/game-element/package.json`.
- [x] T12 — Add `#unsubscribe` field plus `onLog(consoleLogHandler)` subscription in `connectedCallback` in `packages/game-element/module/game-element.ts`, preserving the existing shadow-root idempotency guard.
- [x] T13 — Add `disconnectedCallback` to `GameElement` that calls and clears `#unsubscribe`.
- [x] T14 — Add unit tests in `packages/game-element/module/game-element.test.ts` covering: connect → log() → console method invoked at correct level; disconnect → log() → no longer reaches that instance; reconnect after disconnect re-subscribes; `disconnectedCallback` called without prior connect is a no-op.
- [x] T15 — Update `packages/game-element/README.md` with a "Console log forwarding" section noting that `GameElement` subscribes to `@bruff/utils`'s log bus while connected.
- [x] T16 — Run `pnpm run ok` (or per-package `format` / `lint` / `test` / `typecheck` / `build`) for `@bruff/utils` and `@bruff/game-element`; confirm 100% coverage thresholds still pass.
- [x] T17 — Review phase: walk `spec.md`'s "User-visible behaviour" / "Edge cases" lists and append a `## Verification` section to `spec.md` mapping each bullet to the test that proves it.
