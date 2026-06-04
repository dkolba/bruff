# Event Bus Logging — Design

> Later update: `log()` and `onLog()` remain on the universal `@bruff/utils` root export, but `consoleLogHandler` now exports from `@bruff/utils/dom`. The private bus transport is now an in-memory subscriber list rather than `EventTarget` / `CustomEvent`, so Node.js consumers can import the root export safely.

## Layer assignment

| Module                                                  | Package               | Layer                                                                                                                                  |
| ------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `module/event-bus/log-level.ts`                         | `@bruff/utils`        | Pure data — exports the `LogLevel` discriminated string union.                                                                         |
| `module/event-bus/log-event.ts`                         | `@bruff/utils`        | Pure data — exports the `LogEvent` `Readonly` record type.                                                                             |
| `module/event-bus/event-bus.ts`                         | `@bruff/utils`        | Shell-ish service — owns the private `EventTarget` instance and exposes `log()` / `onLog()`. Same tier as `canvas-resize-listener.ts`. |
| `module/event-bus/console-log-handler.ts`               | `@bruff/utils`        | Pure mapper — `(event) => void` that picks the right `console` method. Console is a side effect, but the function has no other state.  |
| Extension to `module/game-element.ts`                   | `@bruff/game-element` | Imperative shell — wires `onLog(consoleLogHandler)` into `connectedCallback` / `disconnectedCallback`.                                 |
| `lib/effects/entry.ts` log migration                    | `@bruff/game`         | Effects entry — emits custom element registration logs through `log()` instead of `console.info`.                                      |
| `lib/effects/loop.ts` log migration                     | `@bruff/game`         | Effects loop — emits setup failure and touch input logs through `log()` instead of `console.*`.                                        |
| `module/canvas/canvas-resize-listener.ts` log migration | `@bruff/utils`        | Shell-adjacent canvas utility — emits resize logs through `log()` instead of `console.info`.                                           |

The bus singleton is the only piece of "module-level service state" introduced. C-19 forbids _exported_ module-level mutable bindings; the `EventTarget` instance here is **not exported** — only the `log` / `onLog` functions are. The instance is encapsulated, frozen behind the module boundary, and identical in spirit to a closure-over-private-state factory invoked once at module load.

## Public API surface

### `@bruff/utils` (added)

```ts
// log-level.ts
export type LogLevel = "debug" | "info" | "warn" | "error";

// log-event.ts
export type LogEvent = Readonly<{
  level: LogLevel;
  message: string;
  source?: string;
  context?: Readonly<Record<string, unknown>>;
}>;

// event-bus.ts
export const log: (event: LogEvent) => void;
export const onLog: (handler: (event: LogEvent) => void) => () => void;

// console-log-handler.ts
export const consoleLogHandler: (event: LogEvent) => void;
```

`index.ts` re-exports `log`, `onLog`, `consoleLogHandler`, and the `LogLevel` / `LogEvent` types (using `export type`, per C-6).

### `@bruff/game-element` (modified)

`GameElement` gains a private instance field that holds the unsubscribe function returned by `onLog`. `connectedCallback` subscribes; `disconnectedCallback` unsubscribes. No other public API change — `static template()` and the rest stay identical.

## Data flow

```
caller code            @bruff/utils                       @bruff/game-element
-----------            ------------                       -------------------
log({...})  ─────────► dispatchEvent(CustomEvent)
                              │
                              ▼
                       internal EventTarget
                              │
                              │ (each registered handler)
                              ▼
                     consoleLogHandler(event) ◄─────────  GameElement subscribed
                              │                            via onLog(consoleLogHandler)
                              ▼
                       console.{debug,info,warn,error}
```

`emit` / `on` are intentionally _not_ exported. The transport is `EventTarget` today and may become `BroadcastChannel` or `Worker.postMessage` later — keeping the surface narrow protects callers from that swap.

Existing effect and shell-adjacent call sites emit structured log events:

| File                                                     | Event                                                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `packages/game/lib/effects/entry.ts`                     | `{ level: "info", message: "bruff game v<version> was defined", source: "@bruff/game/effects/entry" }` |
| `packages/game/lib/effects/loop.ts` setup failure        | `{ level: "error", message: "setup failed", source: "@bruff/game/effects/loop", context: { error } }`  |
| `packages/game/lib/effects/loop.ts` touch input          | `{ level: "info", message: "touch", source: "@bruff/game/effects/loop", context: { actionType } }`     |
| `packages/utils/module/canvas/canvas-resize-listener.ts` | `{ level: "info", message: "elementResized", source: "@bruff/utils/canvas" }`                          |

## Internal implementation sketch

```ts
// event-bus.ts
const LOG_EVENT_NAME = "bruff:log";

const createLogBus = (): {
  log: (event: LogEvent) => void;
  onLog: (handler: (event: LogEvent) => void) => () => void;
} => {
  const bus = new EventTarget();

  const dispatch = (event: LogEvent): void => {
    bus.dispatchEvent(
      new CustomEvent<LogEvent>(LOG_EVENT_NAME, { detail: event }),
    );
  };

  const subscribe = (handler: (event: LogEvent) => void): (() => void) => {
    const listener = (raw: Event): void => {
      if (raw instanceof CustomEvent) {
        handler(raw.detail as LogEvent); // narrowed; see note below
      }
    };
    bus.addEventListener(LOG_EVENT_NAME, listener);
    return () => bus.removeEventListener(LOG_EVENT_NAME, listener);
  };

  return { log: dispatch, onLog: subscribe };
};

const bus = createLogBus();
export const log = bus.log;
export const onLog = bus.onLog;
```

Note on the narrowing: `CustomEvent.detail` is typed as the generic parameter of `CustomEvent<T>`, but TypeScript does not preserve that type through `EventTarget`'s generic-erased `addEventListener`. We construct the events ourselves and only listen to our private event name, so the runtime invariant holds. The codebase forbids `as` casts (TypeScript Rule 2) — the design uses a user-defined type guard `isLogCustomEvent(raw): raw is CustomEvent<LogEvent>` (TypeScript Rule 3, "Allowed Patterns") to satisfy the lint rule without a cast. The guard checks `raw instanceof CustomEvent` and `typeof raw.detail === "object"` and shape-checks `level` / `message`.

```ts
// console-log-handler.ts
export const consoleLogHandler = (event: LogEvent): void => {
  const sink = pickConsoleSink(event.level);
  if (event.context !== undefined || event.source !== undefined) {
    sink(formatPrefix(event), event.message, {
      source: event.source,
      context: event.context,
    });
  } else {
    sink(formatPrefix(event), event.message);
  }
};
```

`pickConsoleSink` is a small `switch` on the (closed, four-member) `LogLevel` union; it returns `console.debug | console.info | console.warn | console.error`. `formatPrefix` returns `[debug]` / `[info]` / etc.

## GameElement changes

```ts
export class GameElement extends HTMLElement {
  #unsubscribe?: () => void;

  connectedCallback() {
    if (!this.shadowRoot) {
      // …existing shadow-root creation…
    }
    if (!this.#unsubscribe) {
      this.#unsubscribe = onLog(consoleLogHandler);
    }
  }

  disconnectedCallback() {
    if (this.#unsubscribe) {
      this.#unsubscribe();
      this.#unsubscribe = undefined;
    }
  }

  static template(): string {
    /* unchanged */
  }
}
```

The `!this.#unsubscribe` guard preserves GE-3 (`connectedCallback` idempotent) for the new behaviour as well as the existing shadow-root logic. `disconnectedCallback` is new but trivially correct: no-op if never connected.

`#unsubscribe` is a `private` (ECMAScript private) field — not exported, not module-level, instance-scoped. That keeps C-19 satisfied (module-level state is forbidden; instance state in the imperative shell is fine — the project's only declared instance state today, but allowed by GE-1).

## Contributor Guidance Updates

| File                                        | Required guidance                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                 | Production logging uses the event bus; direct `console.*` is limited to the console sink and tests.      |
| `packages/game/AGENTS.md`                   | `log()` is allowed only from `effects/` or the entry point; pure layers remain no-log.                   |
| `packages/utils/AGENTS.md`                  | `@bruff/utils` includes pure helpers plus shell-adjacent browser/logging services.                       |
| `packages/game-element/AGENTS.md`           | `GameElement` owns the `onLog(consoleLogHandler)` subscription lifecycle while connected.                |
| `.agents/skills/verify-layers/SKILL.md`     | Layer audits check that pure layers do not import `log()` and production code avoids direct `console.*`. |
| `.agents/skills/roguelike-feature/SKILL.md` | New shell diagnostics use `log()` from `@bruff/utils`, not direct `console.*` calls.                     |

## Tradeoffs and alternatives considered

### Where the bus lives

- **Chosen — inside `@bruff/utils/module/event-bus/`.** Consistent with `canvas-resize-listener.ts` (also touches the DOM). No new workspace package overhead. Cost: `@bruff/utils`'s "pure FP helpers" framing gets slightly muddier, but the README already documents shell-ish helpers (`getShadowGameRoot`, `canvasResizeListener`).
- **Rejected — new `@bruff/event-bus` package.** Cleanest layering (utils stays pure), but ~6 boilerplate files (package.json, tsconfig, vitest config, eslint config, README, index.ts) and a workspace-map update for ~150 lines of code. Premature abstraction by O-7.
- **Rejected — inside `@bruff/game-element`.** GE-5 forbids "no game logic, no rendering decisions" but does not forbid utility services; however, this would force `@bruff/game` to depend on `@bruff/game-element` to log, inverting the natural dependency direction (Stable Dependencies Principle). Bad shape.

### Bus surface (generic vs scoped)

- **Chosen — `log` / `onLog` only, transport private.** Smallest API. Future channels can be added by exporting more `(emitX, onX)` pairs without leaking `EventTarget` semantics to callers.
- **Rejected — generic `emit(name, payload)` / `on(name, handler)` keyed by string.** Matches the user's reference snippet, but requires either (a) a registry of channel-to-payload types (more code, more types to maintain) or (b) `unknown`/`any` payloads, which violates the "no `any`" rule and pushes runtime checks onto every subscriber. YAGNI: only one channel exists today.

### `GameElement` subscription lifecycle

- **Chosen — subscribe in `connectedCallback`, unsubscribe in `disconnectedCallback`, instance field tracks state.** Standard Web Components pattern; aligns with GE-3 idempotency; no module-level mutable state.
- **Rejected — module-level `subscribed = false` guard inside `game-element.ts`.** Single global subscription, no duplicate logs, but introduces module-level `let` (C-19) and surprises tests that mount and unmount instances.
- **Rejected — auto-subscribe at module import.** Side effect on import; surprising and untestable in isolation.

### Type safety of `CustomEvent.detail`

- **Chosen — user-defined type guard, no `as` cast.** Satisfies "Disallowed Patterns" and keeps the runtime check explicit. ~5 extra lines of code.
- **Rejected — `as LogEvent` cast on `event.detail`.** Smaller, but explicitly forbidden ("`value as Type`" is in the Disallowed Patterns list).
- **Rejected — Zod / typed schema validation.** New runtime dep; massive overkill for a closed-world event constructed inside the same module.

## Reuse map

- `packages/game/lib/effects/entry.ts` — existing custom-element registration log migrated to `log()`.
- `packages/game/lib/effects/loop.ts` — existing setup failure and touch input logs migrated to `log()`.
- `packages/utils/module/canvas/canvas-resize-listener.ts` — existing canvas resize log migrated to `log()`.
- `packages/utils/module/canvas/create-canvas-resize-observer.ts` — precedent for constructing `CustomEvent` and wiring through `EventTarget`-shaped APIs.
- `packages/utils/module/get-shadow-game-root.ts` — example of TSDoc + arrow-function style to mirror.
- `packages/game-element/module/game-element.ts` — file we extend; current `connectedCallback` shape and idempotency guard are the model for the new branch.
- `packages/utils/index.ts` — top-level re-export pattern; new symbols added here.
- `packages/utils/vitest.config.ts` — 100% coverage thresholds apply to new files automatically (they live under `module/`).
- `packages/game-element/vitest.config.ts` — same, for the `GameElement` change.
