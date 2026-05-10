---
name: scaffold-action
description: Scaffold a new discriminated union action variant following the project's action taxonomy
---

# Scaffold Action

Use when adding a new action to the game's event system.

## Action Taxonomy

All actions are strongly-typed discriminated unions. The four top-level categories are:

```ts
type InputAction  = /* keyboard / mouse / touch / gamepad events, normalised */
type GameAction   = /* simulation-driven state transitions */
type SystemEvent  = /* lifecycle events: tick, init, pause, resume */
type RenderCommand = /* draw instructions produced by the projection function */
```

## Steps

1. **Identify the category** — ask which of the four types the new action belongs to.
2. **Add the variant** — append a new branch to the correct discriminated union in `packages/game/types/`.
3. **Handle it exhaustively** — add a `case` to every `switch` that covers that union; the compiler will error on missing cases (`never` check at the end).
4. **Write a unit test** — pure function test in the co-located `*.test.ts` file that exercises the new branch.

## Conventions

- Tag field is always `type` (not `kind`, not `action`).
- Payload fields are `Readonly<{…}>` inline — no separate payload type unless reused.
- No classes. No `this`. No mutation.
- Branded IDs for any entity reference: `Brand<string, "EnemyId">`.

## Template

```ts
// packages/game/types/actions.ts  (add to the correct union)
| { readonly type: "YOUR_ACTION"; readonly payload: Readonly<{ /* … */ }> }
```

Exhaustiveness guard (add to every switch that covers this union):

```ts
default: {
  const _exhaustive: never = action;
  throw new Error(`Unhandled action: ${JSON.stringify(_exhaustive)}`);
}
```
