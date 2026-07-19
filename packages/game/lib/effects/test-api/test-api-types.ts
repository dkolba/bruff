import type { GameState } from "../../core/types.ts";
import type { RenderStats } from "../../render/render-stats.ts";

/**
 * Browser-facing control surface exposed only in test mode.
 */
export type BruffTestApi = Readonly<{
  dispatchInput: (input: string) => void;
  freezeForSnapshot: () => Promise<void>;
  getRenderStats: () => RenderStats;
  getState: () => GameState;
  loadState: (state: GameState) => void;
  stepFrames: (frameCount: number) => GameState;
}>;

declare global {
  interface Window {
    __bruffTestApi?: BruffTestApi;
  }
}
