import type { GameState } from "../core/types.ts";

/**
 * Draws one frame from the given {@link GameState} onto the supplied
 * 2D context. The function is deliberately effectful (it calls
 * `fillRect` on the live context) and so lives in the `effects/`
 * shell rather than in the pure `render/` layer until the
 * `RenderCommand`-producing projection arrives in a later phase.
 *
 * @param state - The state snapshot to draw
 * @param context - The 2D context to draw onto
 */
const render = (state: GameState, context: CanvasRenderingContext2D): void => {
  const { player, enemies } = state;
  context.fillStyle = "blue";
  context.fillRect(player.xPos, player.yPos, player.size, player.size);

  context.fillStyle = "red";
  // eslint-disable-next-line unicorn/no-array-for-each -- Declarative iteration is preferred per C-17; T46 explicitly mandates `.forEach`.
  enemies.forEach((enemy) => {
    context.fillRect(enemy.xPos, enemy.yPos, enemy.size, enemy.size);
  });
};

export default render;
