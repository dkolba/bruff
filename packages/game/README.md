# @bruff/game

A TypeScript game library that implements a 2D top-down game as a self-registering Web Component. A player character (blue square) is controlled via keyboard or touch input and is pursued by enemies (red squares) across an animated canvas background.

Importing the package registers `<bruff-game>` globally and starts the game loop automatically.

```html
<bruff-game></bruff-game>
```

```ts
import "@bruff/game";
```

## Architecture

The package is structured in functional layers with no shared mutable state.

```
lib/
├── bruff-game.ts              # Web Component entry — registers <bruff-game>
├── loop.ts                    # Game loop (requestAnimationFrame + generator state machine)
├── curtain-up.ts              # Canvas initialisation from shadow DOM
├── create-initial-state.ts    # Initial GameState factory
├── update-player.ts           # Player movement and input dequeue
├── update-enemies.ts          # Enemy position updates
├── move-enemy-toward-player.ts # Enemy pathfinding (unit vector toward player)
├── render.ts                  # Canvas draw calls
├── constants.ts               # Shared constants (speeds, sizes)
└── observable/
    ├── keydown.ts             # Keyboard input stream (WICG Observable)
    ├── touch.ts               # Touch input stream
    └── merge.ts               # Merges multiple observables
types/
└── game-state-type.ts         # GameState and related types
```

### Game loop

`loop.ts` drives everything via `requestAnimationFrame`. Each frame it:

1. Drains the input queue collected from merged keyboard/touch observables
2. Calls `updatePlayer` → `updateEnemies` to produce a new `GameState`
3. Calls `render` to draw the new state to the canvas

The loop is implemented as a generator (`function*`) that yields the current state and receives the next input string — decoupling state transitions from the render cycle.

### State

`GameState` is an immutable record spread on every update:

```ts
type GameState = {
  canvas: { width: number; height: number };
  player: { x: number; y: number; size: number };
  enemies: { x: number; y: number; size: number }[];
  inputQueue: string[];
  playerMoved: boolean;
};
```

Enemies only recalculate when `playerMoved` is `true`.

### Input

Keyboard and touch events are consumed as WICG Observable streams, merged into a single input source and fed into the loop on each frame.

Coverage thresholds are set at **100%** for branches, functions, lines, and statements. The game loop (`loop.ts`), Web Component entry (`bruff-game.ts`), constants, and observable merge utility are excluded from the coverage requirement and are exercised by the E2E suite in `@bruff/arcade` instead.
