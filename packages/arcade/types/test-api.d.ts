import type { GameState } from "../../game/lib/core/types.ts";
import type { RenderStats } from "../../game/lib/render/render-stats.ts";

type BruffE2eTestApi = Readonly<{
  dispatchInput: (input: string) => void;
  freezeForSnapshot: () => Promise<void>;
  getRenderStats: () => RenderStats;
  getState: () => GameState;
  loadState: (state: GameState) => void;
  stepFrames: (frameCount: number) => GameState;
}>;

declare global {
  interface Window {
    __bruffTestApi?: BruffE2eTestApi;
  }
}
