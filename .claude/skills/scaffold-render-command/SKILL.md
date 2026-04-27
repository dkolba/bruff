---
name: scaffold-render-command
description: Add a new RenderCommand variant to the retained scene description and wire its Canvas executor in the impure shell
---

# Scaffold Render Command

Use when adding a new visual element to the game (sprite, tile, text, shape, etc.).

## The Two-Part Rule

Every render concern is split across two functions — never combined:

| Part | Layer | Pure? | What it does |
|------|-------|-------|--------------|
| **Projection** | `render/` | ✅ Pure | `state → RenderCommand[]` — describes *what* to draw |
| **Executor** | `effects/` | ❌ Impure | `RenderCommand → Canvas draw calls` — *actually* draws it |

**Never write to `CanvasRenderingContext2D` inside the projection.** The projection must be fully testable without a Canvas.

---

## Steps

### 1. Add the variant to `RenderCommand`

In `packages/game/types/render-command-type.ts` (create if absent):

```ts
export type RenderCommand =
  | { readonly type: "FILL_RECT"; readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly color: string }
  | { readonly type: "YOUR_COMMAND"; readonly /* payload fields */ }
```

### 2. Implement the projection (pure)

In `packages/game/lib/render/<your-command>.ts`:

```ts
import type { GameState } from "../../types/game-state-type.ts";
import type { RenderCommand } from "../../types/render-command-type.ts";

const projectYourThing = (state: GameState): ReadonlyArray<RenderCommand> =>
  state.entities.map(e => ({
    type: "YOUR_COMMAND",
    /* derive fields from state only — no Canvas access */
  }));

export default projectYourThing;
```

Compose it into the root projection function that builds the full `RenderCommand[]` for a frame.

### 3. Implement the executor (impure)

In `packages/game/lib/effects/canvas-executor.ts`, add a `case` to the executor switch:

```ts
case "YOUR_COMMAND": {
  ctx./* Canvas draw calls here */;
  break;
}
```

End the switch with an exhaustiveness guard:

```ts
default: {
  const _exhaustive: never = command;
  throw new Error(`Unhandled RenderCommand: ${JSON.stringify(_exhaustive)}`);
}
```

### 4. Write a unit test for the projection (no Canvas)

```ts
import { describe, expect, it } from "vitest";
import projectYourThing from "./your-command.js";

describe("projectYourThing", () => {
  it("produces the expected render commands from state", () => {
    const state = /* minimal GameState */;
    expect(projectYourThing(state)).toStrictEqual([
      { type: "YOUR_COMMAND", /* expected fields */ },
    ]);
  });
});
```

No `CanvasRenderingContext2D` mock needed — the projection is pure.

---

## Prohibited

- Writing to `ctx.fillStyle` / `ctx.drawImage` / etc. inside `render/`
- Reading from the DOM or Canvas inside the projection
- Returning `void` from the projection — it must return `ReadonlyArray<RenderCommand>`
