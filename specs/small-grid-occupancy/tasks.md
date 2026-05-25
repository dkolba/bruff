# Small Grid Occupancy Tasks

Each task is ordered and file-scoped. Follow TDD inside each implementation step: add the stub, add the failing behaviour test, then implement the smallest code that turns the gate green. If the package coverage gate prevents committing a red test alone, keep the test-before-code order in the diff and commit the paired green change.

- [x] T1 — Add `BOARD_COLUMNS`, `BOARD_ROWS`, and `CURRENT_STATE_VERSION` constants in `packages/game/lib/core/constants.ts`.
- [x] T2 — Add grid state types in `packages/game/lib/core/types.ts` by introducing `Board` and `GridCell`, adding `board` to `GameState`, and replacing actor pixel fields with `cell`.
- [x] T3 — Add `grid.ts` stubs in `packages/game/lib/state/grid.ts` for `cellForAction`, `cellsEqual`, and `isCellInsideBoard`.
- [x] T4 — Add unit tests for grid helpers in `packages/game/lib/state/grid.test.ts`.
- [x] T5 — Implement grid helpers in `packages/game/lib/state/grid.ts`.
- [x] T6 — Add `occupancy.ts` stubs in `packages/game/lib/state/occupancy.ts` for enemy and actor occupancy queries.
- [x] T7 — Add unit tests for occupancy queries in `packages/game/lib/state/occupancy.test.ts`.
- [x] T8 — Implement occupancy queries in `packages/game/lib/state/occupancy.ts`.
- [x] T9 — Update initial grid state in `packages/game/lib/state/create-initial-state.ts` and expectations in `packages/game/lib/state/create-initial-state.test.ts`.
- [x] T10 — Add player grid movement tests in `packages/game/lib/state/update-player.test.ts` for accepted movement, board blocks, enemy blocks, and `playerMoved`.
- [x] T11 — Refactor `packages/game/lib/state/update-player.ts` to apply one-cell grid movement through `grid.ts` and `occupancy.ts`.
- [x] T12 — Update player movement property tests in `packages/game/lib/state/update-player.property.test.ts` to assert board bounds and accepted movement semantics.
- [x] T13 — Add enemy destination tests in `packages/game/lib/state/move-enemy-toward-player.test.ts` for horizontal priority, vertical priority, tie priority, and overlapping defensive input.
- [x] T14 — Refactor `packages/game/lib/state/move-enemy-toward-player.ts` to return deterministic grid-cell destinations.
- [x] T15 — Add enemy occupancy resolution tests in `packages/game/lib/state/update-enemies.test.ts` for player blocks, enemy blocks, same-destination priority, and `spawnOrder` order.
- [x] T16 — Refactor `packages/game/lib/state/update-enemies.ts` to resolve sequential grid movement only after accepted player movement.
- [x] T17 — Update enemy movement property tests in `packages/game/lib/state/update-enemies.property.test.ts` to assert board bounds, stable enemy count, and unique occupied cells.
- [x] T18 — Update `packages/game/lib/state/advance-game-state.test.ts` for blocked-input enemy advancement and frame-index expectations.
- [x] T19 — Add version 1 migration tests in `packages/game/lib/state/migrations.test.ts`.
- [x] T20 — Implement `migrateV1toV2` in `packages/game/lib/state/migrations.ts`.
- [x] T21 — Update replay version parsing in `packages/game/lib/state/replay-fixture.ts` and `packages/game/lib/state/replay-fixture.test.ts` for `CURRENT_STATE_VERSION`.
- [x] T22 — Update replay fixtures and replay tests in `packages/game/tests/fixtures/canonical-replay.json`, `packages/game/lib/state/run-replay.test.ts`, `packages/game/lib/state/run-replay.property.test.ts`, and `packages/game/lib/state/replay.test.ts`.
- [x] T23 — Update the canonical replay snapshot in `packages/game/tests/snapshots/canonical-replay.json`.
- [x] T24 — Update render projection tests in `packages/game/lib/render/project-render-commands.test.ts` for cell-to-pixel rectangle mapping.
- [x] T25 — Refactor `packages/game/lib/render/project-render-commands.ts` to derive foreground rectangles from `state.board`, `state.canvas`, and actor cells.
- [x] T26 — Update render and effects tests in `packages/game/lib/render/render-stats.test.ts`, `packages/game/lib/effects/render.test.ts`, `packages/game/lib/effects/frame-step-driver.test.ts`, and `packages/game/lib/effects/test-api/attach-test-api.test.ts` for grid-shaped `GameState` literals.
- [x] T27 — Update `packages/game/README.md` to describe grid movement, board state, and version 2 replay semantics.
- [x] T28 — Run `CI=true pnpm --filter @bruff/game run format`, `CI=true pnpm --filter @bruff/game run lint`, `CI=true pnpm --filter @bruff/game run typecheck`, and `CI=true pnpm --filter @bruff/game run test`; fix failures in the files touched by T1-T27.
- [x] T29 — Review `specs/small-grid-occupancy/spec.md` and append a `## Verification` section mapping each accepted behaviour to tests or gates.
- [ ] T30 — Review `specs/small-grid-occupancy/design.md` and update any drift found during implementation.
