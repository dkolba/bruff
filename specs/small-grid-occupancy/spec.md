# Small Grid Occupancy Spec

## Goal

Modify `@bruff/game` so movement happens on a small, discrete tactical grid instead of continuous canvas pixels. The player and enemies occupy whole grid cells, move one orthogonal cell per logical turn, remain inside the grid, and cannot move into a cell already occupied by another actor. Actor gameplay state is grid-only: `GameState.board` and every actor `cell` are required, and `Player` / `Enemy` no longer carry legacy `xPos` / `yPos` fields.

## User-Visible Behaviour

- The play area behaves as a small board of discrete cells.
- The player moves one cell up, down, left, or right for each accepted movement input.
- A player movement input that would leave the board is rejected; the player stays in the current cell.
- A player movement input that would enter an enemy-occupied cell is rejected; the player stays in the current cell.
- Enemies move only on logical turns after accepted player movement.
- Each enemy moves at most one orthogonal cell per enemy turn.
- An enemy move that would leave the board is rejected for that enemy.
- An enemy move that would enter the player cell or another enemy cell is rejected for that enemy.
- Multiple enemies never end a turn in the same cell.
- The render output shows the player and enemies snapped to the grid rather than drifting across fractional or arbitrary pixel positions.
- Replay fixtures and deterministic test stepping continue to produce the same final state for the same seed and input sequence.
- Test-loaded states must use the current grid-only state shape; old/gridless loaded states are rejected by TypeScript rather than handled by runtime fallbacks.

## Broughlike Constraints

- The first board size should be small enough for dense tactics; use a `7x7` grid unless design work finds a concrete reason to choose `5x5` or `6x6`.
- Movement remains four-directional; diagonal movement is out of scope.
- The feature does not add a free wait action. No-input frames remain render-only and do not advance the simulation.
- Occupancy itself is the initial source of pressure: actors block cells, restrict routes, and make position matter.
- Enemy behaviour should remain deterministic and simple enough to test from literal board examples.
- The player should always know current actor positions from the rendered board.

## Out Of Scope

- Combat, health, death, capture, or game-over rules.
- Enemy attacks, ranged threats, telegraphs, or damage zones.
- Procedural level generation.
- Obstacles, walls, doors, pickups, score objects, or extraction goals.
- Diagonal movement, push, pull, swap, blink, or other positional powers.
- New input bindings or changes to keyboard/touch normalisation.
- Browser-only collision logic; movement legality must be pure game state logic.
- Screenshot-based gameplay assertions.
- Compatibility with version 1 pixel-position `GameState` values.
- Runtime migration from old/gridless loaded states.

## Resolved Questions

- **What happens when the player attempts to move into an enemy?** The move is blocked. The player remains in the current cell and no collision side effect occurs.
- **What happens when an enemy attempts to move into the player?** The move is blocked. Combat and loss states are out of scope.
- **What happens when two enemies choose the same destination?** Earlier enemies by deterministic turn order keep priority; later enemies are blocked from entering an already reserved cell.
- **What determines enemy turn order?** Existing `spawnOrder` determines enemy movement priority.
- **Do enemies move after blocked player input?** No. Enemies move only after accepted player movement, preserving the no-free-wait constraint without letting wall bumps advance danger.
- **Does a no-input frame advance the simulation?** No. It remains render-only as described by the current package README.
- **Is the grid stored in domain state or inferred only during render?** The game must treat grid position as the gameplay source of truth. Pixel positions exist only in render commands and input event coordinates, not actor state.
- **Does this require a replay state version bump?** Yes. Removing compatibility fields changes the serialized state shape, so the current state version advances to the next version and old fixtures are not accepted.
- **Are old/gridless loaded states still supported through the browser test API?** No. `loadState` is a typed current-state hook and callers must provide board and actor cells.

## Edge Cases

- The player starts at a valid cell inside the board.
- Every enemy starts at a valid cell inside the board.
- Initial state contains no overlapping actors.
- A movement input at the board edge keeps the actor in place.
- A blocked player movement does not set player movement as accepted for enemy advancement.
- An enemy blocked by the player remains in its current cell.
- An enemy blocked by a previously moved enemy remains in its current cell.
- An enemy blocked by an unmoved enemy remains in its current cell.
- Two enemies may not swap cells in the same enemy turn.
- An enemy may not move into a cell vacated earlier in the same enemy turn if doing so would create ambiguous simultaneous movement; enemy movement is resolved sequentially by `spawnOrder`.
- The render projection remains deterministic for a given `GameState`.
- Replay fixtures with movement inputs remain deterministic under grid-only semantics.
- Replay fixtures and final-state snapshots assert actor cells rather than actor pixel coordinates.

## Acceptance Criteria

- Unit tests cover player movement to an empty adjacent cell.
- Unit tests cover player movement blocked by board bounds.
- Unit tests cover player movement blocked by enemy occupancy.
- Unit tests cover an enemy moving one orthogonal cell toward the player.
- Unit tests cover an enemy blocked by the player.
- Unit tests cover two enemies selecting the same destination and resolving by `spawnOrder`.
- Property tests assert all actors remain within grid bounds after any movement sequence.
- Property tests assert no two actors occupy the same cell after any movement sequence.
- Replay tests cover a short deterministic sequence with at least one blocked player move and one blocked enemy move.
- Render projection tests assert grid cells map to stable pixel rectangles without fractional drift.

## Notes For Design

- Use the `roguelike-feature` workflow to assign state and render responsibilities before implementation.
- Use pure state modules for board topology, actor occupancy, and movement legality.
- Preserve the existing input action vocabulary (`move-up`, `move-down`, `move-left`, `move-right`) unless design uncovers a current-state issue.
- Keep broughlike depth focused on occupancy and turn pressure for this feature; additional tactical verbs should come later as separate specs.

## Verification

- Player one-cell movement and board/enemy blocking are covered by `packages/game/lib/state/update-player.test.ts` and `packages/game/lib/state/update-player.property.test.ts`.
- Enemy orthogonal destination priority is covered by `packages/game/lib/state/move-enemy-toward-player.test.ts`.
- Enemy player blocks, enemy blocks, same-destination priority, and `spawnOrder` ordering are covered by `packages/game/lib/state/update-enemies.test.ts`.
- Enemy count, board bounds, and unique occupied cells are covered by `packages/game/lib/state/update-enemies.property.test.ts`.
- Blocked-only player input not advancing enemies and frame-index behavior are covered by `packages/game/lib/state/advance-game-state.test.ts`.
- Runtime version 1 migration has been removed; old replay versions are rejected by `packages/game/lib/state/replay-fixture.test.ts`.
- Version 3 replay parsing, blocked player movement, blocked enemy movement, and deterministic final state are covered by `packages/game/lib/state/replay-fixture.test.ts`, `packages/game/lib/state/run-replay.test.ts`, `packages/game/lib/state/run-replay.property.test.ts`, `packages/game/lib/state/replay.test.ts`, and the canonical replay fixture/snapshot JSON files.
- Grid-cell render projection is covered by `packages/game/lib/render/project-render-commands.test.ts`; canvas execution remains covered by `packages/game/lib/effects/render.test.ts`.
- Browser-level state and replay behavior is covered by `packages/arcade/e2e/state-assertions.spec.ts` and `packages/arcade/e2e/replay-checkpoint.spec.ts`.
- Final gates: `CI=true pnpm --filter @bruff/game run format`, `CI=true pnpm --filter @bruff/game run lint`, `CI=true pnpm --filter @bruff/game run typecheck`, `CI=true pnpm --filter @bruff/game run test`, and full `pnpm run ok`.
