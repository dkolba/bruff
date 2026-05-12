# Event Bus Logging

## Goal

Provide a zero-dependency, in-process event bus that any code in the workspace can use to emit typed log events. The imperative shell (`@bruff/game-element`'s `GameElement`) subscribes to the bus and forwards every event to the browser console using the appropriate `console` method for the event's level. This gives the rest of the app a single, well-typed `log({ level, message, context })` call site without coupling emitters to the console (or any other sink).

## User-visible behaviour

- A new module exposes `log({ level, message, source?, context? })` that records a log event on a process-wide event bus. Calling `log` never throws.
- `level` is one of `"debug" | "info" | "warn" | "error"`.
- An `onLog(handler)` subscription helper returns a cleanup function that removes the handler.
- When a `GameElement` is connected to the DOM, log events are forwarded to the matching `console` method (`debug`, `info`, `warn`, `error`).
- When the same `GameElement` is removed from the DOM, its console-forwarding subscription is detached. Subsequent `log()` calls do not reach that detached element.
- The console line includes the level, message, and (when supplied) the `source` and `context` fields, so a developer can tell where the log came from at a glance.
- Multiple subscribers receive the same event; subscriber order matches registration order.
- `log()` calls before any subscriber is attached do not error and are simply unobserved (matches native `EventTarget` semantics — there is no replay buffer).
- Repository guidance documents the event-bus boundary: production logging emits through `log()`, `console.*` is isolated to the console sink, and pure layers/skills remain no-log.

## Out of scope

- Persisting or buffering events for late subscribers (no replay).
- Forwarding logs to remote sinks (Faro, Sentry, custom HTTP endpoints). The bus is the seam that makes those additions trivial later, but they are not in this feature.
- Worker-thread bridging via `postMessage`. The design must not preclude it, but no worker code ships in this feature.
- A generic, multi-channel typed event bus. Only the `"log"` channel is defined here. The bus implementation is generic enough that other channels can be added later without rework, but no other channels exist yet.
- A `Result<T, E>` / `Option<T>` rollout. Those types are aspirational in `CLAUDE.md` but not yet adopted in `@bruff/utils`. Introducing them here would balloon scope; this feature stays consistent with current code (functions return `void` or values, no throws on the bus path).
- Branded types for `LogLevel` etc. The discriminated string union is sufficient and matches existing util style.

## Open questions (resolved)

- **Q: Where does the bus live — new package or inside `@bruff/utils`?**
  A: Inside `@bruff/utils` under `module/event-bus/`. Precedent: `canvas-resize-listener.ts` already lives in utils despite touching `addEventListener`. A new package's overhead (workspace entry, tsconfig, vitest config, eslint config, three-browser test runner) is not justified by a handful of files.
- **Q: Should `emit`/`on` be generic over arbitrary event types, or scoped to log events?**
  A: Scoped. We expose `log()` and `onLog()` only. The internal `EventTarget` instance stays private to the module so future channels can be added without leaking the transport. No `emit(name, payload)` public API in this feature.
- **Q: How does the `GameElement` avoid duplicate console output if multiple instances mount?**
  A: Each instance subscribes on `connectedCallback` and unsubscribes on `disconnectedCallback`. If two `GameElement`s are mounted simultaneously, each event prints twice — accepted as a known, low-risk behaviour because the app has one `GameElement` in practice. A module-level "subscribe once" guard would require module-level mutable state (violates C-19) for negligible benefit.
- **Q: Should `log()` be allowed in effects and shell-adjacent utility code?**
  A: Yes. Effects and shell-adjacent utilities may emit typed log events instead of calling `console.*` directly. Pure core/state/input/render code should still avoid logging side effects.
- **Q: Should the initial migration include existing direct `console.*` call sites?**
  A: Yes. `packages/game/lib/effects/entry.ts`, `packages/game/lib/effects/loop.ts`, and `packages/utils/module/canvas/canvas-resize-listener.ts` are part of this feature so all existing app logs flow through the bus before `GameElement` forwards them to the console.
- **Q: Should AGENTS and local skill guidance mention the new event-bus boundary?**
  A: Yes. Root/package AGENTS files should state that production logging uses `log()` and that `console.*` is isolated to `consoleLogHandler`. Local skills that guide shell wiring or layer audits should reflect the same boundary while preserving no-logging rules for pure domain work.
- **Q: What happens if a subscriber throws?**
  A: `EventTarget`'s `dispatchEvent` swallows listener exceptions and reports them via `window.onerror`. This is acceptable browser-native behaviour; we do not wrap or re-throw.

## Edge cases

- `log()` invoked with no current subscribers — no error, event dispatched into the void.
- `log()` invoked with an empty `message` string — still dispatched verbatim; consumer decides how to render.
- `log()` invoked from inside a subscriber (re-entrant logging) — supported by `EventTarget`, no special handling needed; risk of infinite recursion is the caller's responsibility.
- `disconnectedCallback` invoked without a matching `connectedCallback` — must be a no-op (no stored cleanup function to call).
- Multiple connect → disconnect cycles on the same `GameElement` — each cycle subscribes and unsubscribes cleanly; no listener leaks.
- An `onLog` cleanup function called twice — idempotent (second call is a no-op).
- A subscriber that calls its own cleanup mid-dispatch — safe under `EventTarget` semantics.
- `console.debug` is silenced by default in many browsers; emitting `level: "debug"` events is therefore intentionally a near-no-op visually. This is documented but not "fixed".
- Existing setup failure, custom element registration, touch input, and canvas resize logs keep their observable intent while switching from direct `console.*` calls to `log()`.
- Documentation for future contributors must not imply that `@bruff/utils` is pure-only or that `GameElement` only mounts a canvas; both now include narrow shell-adjacent logging responsibilities.

## Verification

- `log()` no-op with no subscribers → `packages/utils/module/event-bus/event-bus.test.ts` (`returns undefined and does not throw when no subscribers exist`).
- `level` constrained to debug/info/warn/error → `packages/utils/module/event-bus/log-level.ts`; exercised by `packages/utils/module/event-bus/console-log-handler.test.ts` table-driven level routing test.
- `onLog(handler)` returns cleanup unsubscribe function → `packages/utils/module/event-bus/event-bus.ts`; validated by unsubscribe and double-unsubscribe tests in `packages/utils/module/event-bus/event-bus.test.ts`.
- Connected `GameElement` forwards to console by level → `packages/game-element/module/game-element.test.ts` (forwards log events while connected).
- Removed `GameElement` stops forwarding → `packages/game-element/module/game-element.test.ts` (stops forwarding after disconnect).
- Console call includes level/message and optional source/context → `packages/utils/module/event-bus/console-log-handler.test.ts` (without metadata + with metadata cases).
- Multiple subscribers receive same event in registration order → `packages/utils/module/event-bus/event-bus.test.ts` (registration order assertion).
- Pre-subscription `log()` calls are unobserved and non-throwing → `packages/utils/module/event-bus/event-bus.test.ts` (no subscribers case).
- Edge case: empty message still dispatched → covered by generic dispatch path in `packages/utils/module/event-bus/event-bus.ts` and single-subscriber test payload equality semantics.
- Edge case: re-entrant logging supported by EventTarget semantics → not explicitly unit-tested; left to platform behavior noted in design.
- Edge case: disconnected without prior connect no-op → `packages/game-element/module/game-element.test.ts` (disconnectedCallback no-op).
- Edge case: connect/disconnect cycles cleanly resubscribe → `packages/game-element/module/game-element.test.ts` (resubscribes after reconnect).
- Edge case: cleanup called twice idempotent → `packages/utils/module/event-bus/event-bus.test.ts` (double-unsubscribe).
- Existing direct console call migrations → `packages/game/lib/effects/entry.test.ts`, `packages/game/lib/effects/loop.test.ts`, and `packages/utils/module/canvas/canvas-resize-listener.test.ts`.
- Affected package gates run on 2026-05-12 → `@bruff/utils` format/lint/test/typecheck passed; `@bruff/game` format/lint/test/typecheck/build passed; `@bruff/game-element` format/lint/test/typecheck passed. `@bruff/utils` and `@bruff/game-element` have no package-level build script.
- Contributor guidance audit → `AGENTS.md`, `packages/game/AGENTS.override.md`, `packages/utils/AGENTS.override.md`, `packages/game-element/AGENTS.override.md`, `.agents/skills/verify-layers/SKILL.md`, and `.agents/skills/roguelike-feature/SKILL.md` updated to describe the event-bus logging boundary.
