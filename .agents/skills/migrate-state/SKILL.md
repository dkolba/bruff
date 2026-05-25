---
name: migrate-state
description: Safely evolve GameState shape — bump stateVersion, write a pure migration function, update replay fixtures and snapshot baselines
---

# Migrate State

Use whenever `GameState` shape changes (adding, removing, or renaming fields).

Skipping this process silently breaks replay tests and deterministic run snapshots.

---

## Rule

Every structural change to `GameState` requires:

1. A `stateVersion` increment
2. A pure migration function
3. Updated replay fixtures and snapshot baselines

**Never** change field types or names without bumping `stateVersion`.

---

## Steps

### 1. Add `stateVersion` if absent

`GameState` must have:

```ts
export type GameState = Readonly<{
  stateVersion: number;
  seed: number;
  prng: PrngState;
  frameIndex: number;
  /* … */
}>;
```

`createInitialState` must set `stateVersion: CURRENT_STATE_VERSION` from
`packages/game/lib/core/constants.ts`.

### 2. Increment `stateVersion`

In `packages/game/lib/core/types.ts`, bump the version constant or literal and update
all places that construct a literal `GameState` (tests, `createInitialState`, factories).

```ts
export const CURRENT_STATE_VERSION = 2; // was 1
```

### 3. Write a pure migration function

In `packages/game/lib/state/migrations.ts`:

```ts
import type { GameState } from "../core/types.ts";

/** V1 shape — keep as a local type, do not export */
type GameStateV1 = Omit<GameState, "newField"> & { stateVersion: 1 };

export const migrateV1toV2 = (old: GameStateV1): GameState => ({
  ...old,
  stateVersion: 2,
  newField: deriveDefaultValue(old),
});
```

Rules for migration functions:

- Pure — no side effects
- Exhaustive — every field of the new shape must be present in the return value
- Tested — unit test with a representative V1 fixture

### 4. Update snapshot / replay test baselines

After the migration, replay fixture and snapshot tests will fail because the state shape changed. Update committed JSON baselines:

```bash
pnpm --filter @bruff/game run test
```

Review the diff before committing — the snapshot changes should exactly match the
new fields you added.

### 5. Update deterministic replay fixtures

Replay fixtures live in `packages/game/tests/fixtures/*.json`; final-state snapshots live in `packages/game/tests/snapshots/*.json`. If the fixture format changes, update `ReplayFixture`, `ReplayError`, `parseReplayFixture`, and `runReplay` tests together.

---

## Migration Chain

If multiple migrations exist, compose them in order:

```ts
export const migrateToLatest = (
  raw: unknown,
): Result<GameState, MigrationError> => {
  // version guard
  if (!isGameStateV1(raw)) return error({ type: "unrecognised-state-shape" });
  const v2 = migrateV1toV2(raw);
  // const v3 = migrateV2toV3(v2);
  return ok(v2);
};
```

---

## Checklist

- [ ] `stateVersion` incremented in `GameState` type and `CURRENT_STATE_VERSION`
- [ ] `createInitialState` produces new `stateVersion`
- [ ] `seed`, `prng`, and `frameIndex` remain present and deterministic
- [ ] Migration function written and unit tested
- [ ] Replay fixture parser and runner still return typed `Result` values
- [ ] JSON fixtures and final-state snapshots updated
- [ ] Replay, property, and browser-control tests re-validated
- [ ] No silent field renames without a migration
