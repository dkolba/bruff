# RenderCommand — Tasks

Each task is ordered and file-scoped. Follow TDD inside each implementation step: add the stub, add the failing behaviour test, then implement the smallest code that turns the gate green. If the package coverage gate prevents committing a red test alone, keep the test-before-code order in the diff and commit the paired green change.

- [x] T1 — Add `projectRenderCommands(state)` stub in `packages/game/lib/render/project-render-commands.ts`.
- [x] T2 — Add unit tests for `projectRenderCommands` in `packages/game/lib/render/project-render-commands.test.ts` covering player command, zero enemies, multiple enemies in array order, and deterministic output for the same state.
- [x] T3 — Implement `projectRenderCommands` in `packages/game/lib/render/project-render-commands.ts` using the existing `RenderCommand` union from `packages/game/lib/core/actions.ts`.
- [x] T4 — Add `renderStatsForState(state)` stub in `packages/game/lib/render/render-stats.ts`.
- [ ] T5 — Add unit tests for `renderStatsForState` in `packages/game/lib/render/render-stats.test.ts` covering initial frame, zero enemies, nonzero enemies, and `playerDrawn: true`.
- [ ] T6 — Implement `renderStatsForState` in `packages/game/lib/render/render-stats.ts`.
- [ ] T7 — Add `executeRenderCommand` and `executeRenderCommands` stubs in `packages/game/lib/effects/execute-render-command.ts`.
- [ ] T8 — Add browser-provider tests for `executeRenderCommand` and `executeRenderCommands` in `packages/game/lib/effects/execute-render-command.test.ts` covering `clear`, `fill-rect`, and command order.
- [ ] T9 — Implement `executeRenderCommand` and `executeRenderCommands` in `packages/game/lib/effects/execute-render-command.ts`.
- [ ] T10 — Refactor `packages/game/lib/effects/render.ts` to call `projectRenderCommands`, `executeRenderCommands`, and `renderStatsForState` while preserving its public signature.
- [ ] T11 — Update `packages/game/lib/effects/render.test.ts` to assert the adapter still draws the player and enemies and returns the same `RenderStats`.
- [ ] T12 — Run `CI=true pnpm --filter @bruff/game run format`, `CI=true pnpm --filter @bruff/game run lint`, `CI=true pnpm --filter @bruff/game run typecheck`, and `CI=true pnpm --filter @bruff/game run test`; fix failures in the files touched by T1-T11.
- [ ] T13 — Run `CI=true pnpm --filter @bruff/arcade run test` to verify state-first E2E render stats and the frozen replay checkpoint still pass for available local browser projects.
- [ ] T14 — Review `specs/render-command/spec.md` and append a `## Verification` section mapping each user-visible behaviour and edge case to the test or gate that proves it.
- [ ] T15 — Review `specs/render-command/design.md` and update any drift found while implementing T1-T13.
