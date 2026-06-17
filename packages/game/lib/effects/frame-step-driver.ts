/* eslint-disable max-lines-per-function -- Driver construction keeps closure state together and import groups readable. */
import { radiatingBarsBackgroundAnimation } from "@bruff/utils/dom";

import type { InputAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";
import {
  initialRenderStats,
  type RenderStats,
} from "../render/render-stats.js";
import { advanceGameState } from "../state/advance-game-state.js";
import {
  advanceManualClock,
  type Clock,
  manualClock,
  readClock,
  wallClock,
} from "./clock.js";
import render from "./render.js";

const ZERO = 0;
const ONE_THOUSAND_MS = 1000;
const FRAMES_PER_SECOND = 60;
const FRAME_DURATION_MS = ONE_THOUSAND_MS / FRAMES_PER_SECOND;

/**
 * Stable control surface shared by production RAF and test stepping.
 */
export type FrameStepDriver = Readonly<{
  dispatchInput: (input: InputAction) => void;
  freezeForSnapshot: () => Promise<void>;
  getRenderStats: () => RenderStats;
  getState: () => GameState;
  loadState: (state: GameState) => void;
  renderFrame: () => RenderStats;
  stepFrames: (frameCount: number) => GameState;
}>;

/**
 * Dependencies needed to construct a {@link FrameStepDriver}.
 */
export type FrameStepDriverDependencies = Readonly<{
  clock: Clock;
  context: CanvasRenderingContext2D;
  initialState: GameState;
  renderBackground?: (timeMs: number) => void;
  renderGame?: (
    state: GameState,
    context: CanvasRenderingContext2D,
  ) => RenderStats;
}>;

const normalizeFrameCount = (frameCount: number): number =>
  Math.max(ZERO, Math.trunc(frameCount));

const createDefaultRenderBackground =
  (context: CanvasRenderingContext2D) =>
  (timeMs: number): void =>
    radiatingBarsBackgroundAnimation(context, timeMs);

const createFrameIndexes = (frameCount: number): ReadonlyArray<number> =>
  Array.from({ length: frameCount }, (_unused, frameOffset) => frameOffset);

/**
 * Creates a deterministic frame driver around the pure simulation step.
 *
 * @param dependencies - Initial state, clock, canvas context, and optional render hooks
 * @returns A frame-step driver for production and test-mode shells
 */
export const createFrameStepDriver = ({
  clock,
  context,
  initialState,
  renderBackground = createDefaultRenderBackground(context),
  renderGame = render,
}: FrameStepDriverDependencies): FrameStepDriver => {
  let state = initialState;
  let inputQueue: ReadonlyArray<InputAction> = [];
  let gameClock = clock;
  let latestRenderStats = initialRenderStats();

  const renderFrame = (): RenderStats => {
    const frameTime = readClock(gameClock);
    renderBackground(frameTime);
    latestRenderStats = renderGame(state, context);
    return latestRenderStats;
  };

  const stepOneFrame = (): GameState => {
    state = advanceGameState(state, inputQueue);
    inputQueue = [];
    renderFrame();
    gameClock = advanceManualClock(gameClock, FRAME_DURATION_MS);
    return state;
  };

  return {
    dispatchInput: (input: InputAction): void => {
      inputQueue = [...inputQueue, input];
    },
    freezeForSnapshot: async (): Promise<void> => {
      renderFrame();
      await new Promise<void>((resolve) => {
        requestAnimationFrame((): void => {
          resolve();
        });
      });
    },
    getRenderStats: (): RenderStats => latestRenderStats,
    getState: (): GameState => state,
    loadState: (nextState: GameState): void => {
      state = nextState;
      inputQueue = [];
    },
    renderFrame,
    stepFrames: (frameCount: number): GameState =>
      createFrameIndexes(normalizeFrameCount(frameCount)).reduce<GameState>(
        () => stepOneFrame(),
        state,
      ),
  };
};

/**
 * Creates a production driver that reads real time.
 *
 * @param context - Canvas context to render into
 * @param initialState - Initial game state
 * @returns A wall-clock frame driver
 */
export const createWallClockFrameStepDriver = (
  context: CanvasRenderingContext2D,
  initialState: GameState,
): FrameStepDriver =>
  createFrameStepDriver({ clock: wallClock(), context, initialState });

/**
 * Creates a test driver with manually advanced time.
 *
 * @param context - Canvas context to render into
 * @param initialState - Initial game state
 * @returns A manual-clock frame driver
 */
export const createManualFrameStepDriver = (
  context: CanvasRenderingContext2D,
  initialState: GameState,
): FrameStepDriver =>
  createFrameStepDriver({ clock: manualClock(ZERO), context, initialState });
