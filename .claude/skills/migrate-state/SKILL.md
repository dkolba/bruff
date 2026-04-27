---
name: migrate-state
description: Safely evolve GameState shape — bump stateVersion, write a pure migration function, update snapshot baselines
---

# Migrate State

Use whenever `GameState` shape changes (adding, removing, or renaming fields).

Skipping this process silently breaks replay tests and deterministic run snapshots.

---

## Rule

Every structural change to `GameState` requires:

1. A `stateVersion` increment
2. A pure migration function
3. Updated snapshot baselines

**Never** change field types or names without bumping `stateVersion`.

---

## Steps

### 1. Add `stateVersion` if absent

`GameState` must have:

```ts
export type GameState = Readonly<{
  stateVersion: number;
  /* … */
}>;
```

`createInitialState` must set `stateVersion: 1` (or the current version).

### 2. Increment `stateVersion`

In `packages/game/types/game-state-type.ts`, bump the version constant and update
all places that construct a literal `GameState` (tests, `createInitialState`, factories).

```ts
export const CURRENT_STATE_VERSION = 2; // was 1
```

### 3. Write a pure migration function

In `packages/game/lib/state/migrations.ts`:

```ts
import type { GameState } from "../../types/game-state-type.ts";

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

After the migration, existing `toMatchSnapshot()` calls will fail because the state
shape changed. Update them:

```bash
pnpm run test --update-snapshots
```

Review the diff before committing — the snapshot changes should exactly match the
new fields you added.

### 5. Update the deterministic replay test

If you have a replay test that feeds scripted inputs and asserts a final state, re-run
it with `--update-snapshots` and verify the new snapshot is correct.

---

## Migration Chain

If multiple migrations exist, compose them in order:

```ts
export const migrateToLatest = (raw: unknown): GameState => {
  // version guard
  if (!isGameStateV1(raw)) throw new Error("Unrecognised state shape");
  const v2 = migrateV1toV2(raw);
  // const v3 = migrateV2toV3(v2);
  return v2;
};
```

---

## Checklist

- [ ] `stateVersion` incremented in `GameState` type and `CURRENT_STATE_VERSION`
- [ ] `createInitialState` produces new `stateVersion`
- [ ] Migration function written and unit tested
- [ ] Snapshot baselines updated (`pnpm run test -u`)
- [ ] Replay tests re-validated
- [ ] No silent field renames without a migration
