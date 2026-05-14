/**
 * Counts captured from the most recent render.
 */
export type RenderStats = Readonly<{
  enemiesDrawn: number;
  frameIndex: number;
  playerDrawn: boolean;
}>;

/**
 * Empty stats used before the first frame is drawn.
 */
export const initialRenderStats = (): RenderStats => ({
  enemiesDrawn: 0,
  frameIndex: 0,
  playerDrawn: false,
});
