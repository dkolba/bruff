# Event Bus Logging — Acceptance

Each criterion must be backed by an automated test. The test file is named in `[brackets]`.

## A1 — `log()` is a no-op when no subscribers are attached

[`packages/utils/module/event-bus/event-bus.test.ts`]

Given no calls to `onLog` have happened,
When `log({ level: "info", message: "noop" })` is called,
Then it returns `undefined` without throwing.

## A2 — A single subscriber receives the exact event

[`packages/utils/module/event-bus/event-bus.test.ts`]

Given `onLog(handler)` was called with a `vi.fn()`,
When `log({ level: "warn", message: "hello", source: "test", context: { id: 1 } })` is called,
Then `handler` is called once with an event object whose fields equal the input verbatim.

## A3 — Unsubscribe stops further delivery

[`packages/utils/module/event-bus/event-bus.test.ts`]

Given `cleanup = onLog(handler)` and one prior `log()` was delivered,
When `cleanup()` is called and then `log()` is called again,
Then `handler` total invocation count remains at 1.

## A4 — Multiple subscribers receive each event in registration order

[`packages/utils/module/event-bus/event-bus.test.ts`]

Given `onLog(a)` then `onLog(b)` were called,
When `log({ level: "info", message: "x" })` is called,
Then `a` was called before `b` (verified by `mock.invocationCallOrder`).

## A5 — Double-unsubscribe is idempotent

[`packages/utils/module/event-bus/event-bus.test.ts`]

Given `cleanup = onLog(handler)`,
When `cleanup()` is called twice,
Then no error is thrown and subsequent `log()` calls do not reach `handler`.

## A6 — `consoleLogHandler` routes each level to the matching `console` method

[`packages/utils/module/event-bus/console-log-handler.test.ts`]

For each level in `["debug", "info", "warn", "error"]`,
Given `vi.spyOn(console, level)`,
When `consoleLogHandler({ level, message: "m" })` is called,
Then `console[level]` is called exactly once.

## A7 — `consoleLogHandler` includes `source` and `context` only when present

[`packages/utils/module/event-bus/console-log-handler.test.ts`]

When called without `source` or `context`, the spy receives only `(prefix, message)`.
When called with both, the spy receives `(prefix, message, { source, context })`.

## A8 — `GameElement` forwards log events to the matching `console` method while connected

[`packages/game-element/module/game-element.test.ts`]

Given a `GameElement` is connected to the document,
When `log({ level: "error", message: "boom" })` is called,
Then `console.error` was called.

## A9 — `GameElement` stops forwarding after `disconnectedCallback`

[`packages/game-element/module/game-element.test.ts`]

Given a connected `GameElement` is removed from the DOM,
When `log({ level: "info", message: "after" })` is called,
Then the prior `console.info` invocation count is unchanged.

## A10 — `GameElement` re-subscribes on reconnect

[`packages/game-element/module/game-element.test.ts`]

Given a `GameElement` was connected, disconnected, then re-appended to the DOM,
When `log({ level: "info", message: "again" })` is called,
Then `console.info` is called for that event.

## A11 — `disconnectedCallback` without prior `connectedCallback` is a no-op

[`packages/game-element/module/game-element.test.ts`]

Given a `GameElement` constructed but never appended to the DOM,
When `disconnectedCallback()` is invoked manually,
Then no error is thrown.

## A12 — Coverage thresholds remain 100%

[`pnpm run test` for both `@bruff/utils` and `@bruff/game-element`]

The vitest coverage gate (`branches/functions/lines/statements = 100`) passes for both packages with the new files included.

## A13 — Linting and typechecking pass

[`pnpm run lint`, `pnpm run typecheck`]

No `as` casts, no `any`, no module-level `let`, no exported mutable bindings introduced.
