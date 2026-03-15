import type { GameState } from "../types/game-state-type.ts";

const render = (state: GameState, context: CanvasRenderingContext2D) => {
  // Draw player
  const { player, enemies } = state;
  context.fillStyle = "blue";
  context.fillRect(player.xPos, player.yPos, player.size, player.size);

  // Draw enemies
  context.fillStyle = "red";
  for (const enemy of enemies) {
    context.fillRect(enemy.xPos, enemy.yPos, enemy.size, enemy.size);
  }
};

export default render;
