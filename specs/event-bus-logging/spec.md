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

## Out of scope

- Persisting or buffering events for late subscribers (no replay).
- Forwarding logs to remote sinks (Faro, Sentry, custom HTTP endpoints). The bus is the seam that makes those additions trivial later, but they are not in this feature.
- Worker-thread bridging via `postMessage`. The design must not preclude it, but no worker code ships in this feature.
- A generic, multi-channel typed event bus. Only the `"log"` channel is defined here. The bus implementation is generic enough that other channels can be added later without rework, but no other channels exist yet.
- Replacing existing direct `console.*` calls in the codebase (e.g. `canvas-resize-listener.ts`'s `console.info`). Migrations happen in follow-up work, not this feature.
- A `Result<T, E>` / `Option<T>` rollout. Those types are aspirational in `CLAUDE.md` but not yet adopted in `@bruff/utils`. Introducing them here would balloon scope; this feature stays consistent with current code (functions return `void` or values, no throws on the bus path).
- Branded types for `LogLevel` etc. The discriminated string union is sufficient and matches existing util style.

## Open questions (resolved)

- **Q: Where does the bus live — new package or inside `@bruff/utils`?**
  A: Inside `@bruff/utils` under `module/event-bus/`. Precedent: `canvas-resize-listener.ts` already lives in utils despite touching `addEventListener`. A new package's overhead (workspace entry, tsconfig, vitest config, eslint config, three-browser test runner) is not justified by a handful of files.
- **Q: Should `emit`/`on` be generic over arbitrary event types, or scoped to log events?**
  A: Scoped. We expose `log()` and `onLog()` only. The internal `EventTarget` instance stays private to the module so future channels can be added without leaking the transport. No `emit(name, payload)` public API in this feature.
- **Q: How does the `GameElement` avoid duplicate console output if multiple instances mount?**
  A: Each instance subscribes on `connectedCallback` and unsubscribes on `disconnectedCallback`. If two `GameElement`s are mounted simultaneously, each event prints twice — accepted as a known, low-risk behaviour because the app has one `GameElement` in practice. A module-level "subscribe once" guard would require module-level mutable state (violates C-19) for negligible benefit.
- **Q: Should `log()` be allowed to be called from pure-core game code in `@bruff/game`?**
  A: Yes, treated as the same allowance the codebase already grants `console.info` (see `canvas-resize-listener.ts`). Logging is the canonical "small, observable side effect" exception. Stricter purity (a `Writer` monad) is out of scope.
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
