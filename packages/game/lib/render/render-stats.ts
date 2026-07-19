import type { GameState } from "../core/types.ts";

/** Counts captured from the most recent render. */
export type RenderStats = Readonly<{
  enemiesDrawn: number;
  frameIndex: number;
  playerDrawn: boolean;
}>;

/** Empty stats used before the first frame is drawn. */
export const initialRenderStats = (): RenderStats => ({
  enemiesDrawn: 0,
  frameIndex: 0,
  playerDrawn: false,
});

/**
 * Derives render stats from the state snapshot used for a frame.
 *
 * @param state - The rendered state snapshot
 */
export const renderStatsForState = (state: GameState): RenderStats => ({
  enemiesDrawn: state.enemies.length,
  frameIndex: state.frameIndex,
  playerDrawn: true,
});
