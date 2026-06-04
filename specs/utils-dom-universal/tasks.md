# Utils DOM and Universal Exports Tasks

- [x] T1 — Add a Node Vitest config and script in `packages/utils/vitest.node.config.ts` and `packages/utils/package.json`
- [x] T2 — Add a Node-mode universal import smoke test in `packages/utils/module/universal-export.node.test.ts`
- [x] T3 — Refactor the log event bus transport in `packages/utils/module/event-bus/event-bus.ts` to remove `EventTarget` and `CustomEvent`
- [x] T4 — Update event-bus tests in `packages/utils/module/event-bus/event-bus.test.ts` for the DOM-free transport behavior
- [x] T5 — Remove unused CustomEvent narrowing code from `packages/utils/module/event-bus/is-log-custom-event.ts` and `packages/utils/module/event-bus/is-log-custom-event.test.ts`
- [x] T6 — Add the DOM barrel export in `packages/utils/dom.ts`
- [x] T7 — Restrict the universal barrel in `packages/utils/index.ts` to Node-safe exports
- [x] T8 — Declare public subpath exports in `packages/utils/package.json`
- [x] T9 — Update utils documentation in `packages/utils/README.md` and `packages/utils/AGENTS.md`
- [x] T10 — Move DOM helper imports and mocks in `packages/game/lib/effects/curtain-up.ts` and `packages/game/lib/effects/curtain-up.test.ts` to `@bruff/utils/dom`
- [x] T11 — Move animation imports and mocks in `packages/game/lib/effects/frame-step-driver.ts` and `packages/game/lib/effects/loop.test.ts` to `@bruff/utils/dom`
- [x] T12 — Move console log adapter imports in `packages/game-element/module/game-element.ts` to `@bruff/utils/dom`
- [x] T13 — Update game import boundary docs in `packages/game/AGENTS.md`
- [x] T14 — Update game-element import boundary docs in `packages/game-element/AGENTS.md` and `packages/game-element/README.md`
- [x] T15 — Check Vite dependency optimization handling in `packages/arcade/vite.config.ts` for `@bruff/utils/dom`
- [x] T16 — Verify package gates for `packages/utils` and record any required follow-up in `specs/utils-dom-universal/tasks.md`
- [x] T17 — Verify affected consumer gates for `packages/game`, `packages/game-element`, `packages/sigil`, and `packages/arcade` and record any required follow-up in `specs/utils-dom-universal/tasks.md`
