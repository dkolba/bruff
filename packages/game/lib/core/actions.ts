/**
Normalised user input. Producers in the input layer (keyboard,
touch, gamepad) translate raw events into one of these variants
before they reach the simulation pipeline. Per A-17, every input
is normalised into an `InputAction` before entering the core
pipeline; reducers never see raw key strings.
*/
export type InputAction =
  | { readonly type: "move-down" }
  | { readonly type: "move-left" }
  | { readonly type: "move-right" }
  | { readonly type: "move-up" };

/**
Everything the simulation reducers (`updatePlayer`,
`updateEnemies`) accept on a `(state, action) => state` call.
{@link InputAction} variants are promoted through this union,
plus simulation-driven events such as a per-frame `tick`. New
variants must be added to every reducer's exhaustive switch
(the `never` arm enforces compile-time coverage per A-19).
*/
export type GameAction = InputAction | { readonly type: "tick" };

/**
Lifecycle signals raised by the shell. Distinct from
{@link GameAction} because reducers do not normally branch on
them; the effects layer is the primary consumer (start the
loop, pause input, tear down resize listeners).
*/
export type SystemEvent =
  | { readonly type: "game-paused" }
  | { readonly type: "game-resumed" }
  | { readonly type: "game-started" }
  | { readonly type: "game-stopped" };

/**
A single drawing instruction produced by the pure render
projection and executed by the Canvas shell. Each frame is
described as an ordered sequence of commands, executed
top-to-bottom (per A-26 — clear-and-redraw every tick).

Coordinate fields use `xPos` / `yPos` to match the existing
domain vocabulary on `Player` and `Enemy`.
*/
export type RenderCommand =
  | { readonly type: "clear" }
  | {
      readonly color: string;
      readonly height: number;
      readonly type: "fill-rect";
      readonly width: number;
      readonly xPos: number;
      readonly yPos: number;
    };
