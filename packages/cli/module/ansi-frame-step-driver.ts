import {
  type CanvasSize,
  createHeadlessGame,
  type GameState,
  type HeadlessFrame,
  type InputAction,
  normaliseKey,
  projectHeadlessFrame,
  stepHeadlessGame,
} from "@bruff/game/headless";

import { encodeAnsiCommands } from "./ansi.ts";
import { gameFrameToTerminalFrame } from "./game-frame.ts";
import { renderTerminalFrame } from "./render-frame.ts";
import type { TerminalFrame } from "./terminal-cell.ts";
import type { TextWriter, WriteFrameResult } from "./write-frame.ts";

const defaultCanvas: CanvasSize = { height: 7, width: 7 };
const defaultSeed = 1;
const minimumFrameCount = 0;
const arrayLastIndexOffset = 1;

/**
 * Options for creating a deterministic ANSI frame-step driver.
 */
export type AnsiFrameStepOptions = Readonly<{
  /**
   * Terminal canvas dimensions used when no initial state is supplied.
   */
  canvas?: CanvasSize;
  /**
   * Complete game state to load into the driver.
   */
  initialState?: GameState;
  /**
   * Deterministic seed used when no initial state is supplied.
   */
  seed?: number;
  /**
   * Injected terminal writer used for every rendered frame.
   */
  writer: TextWriter;
}>;

/**
 * Summary facts for the latest ANSI render.
 */
export type AnsiFrameRenderStats = Readonly<{
  /**
   * Number of enemy cells in the headless frame.
   */
  enemiesDrawn: number;
  /**
   * Logical frame index represented by the render.
   */
  frameIndex: number;
  /**
   * Whether the player was present in the headless frame.
   */
  playerDrawn: boolean;
  /**
   * Number of terminal cells emitted by the terminal projection.
   */
  terminalCellsDrawn: number;
}>;

/**
 * Complete terminal artifacts produced for one rendered frame.
 */
export type AnsiRenderedFrame = Readonly<{
  /**
   * Encoded ANSI text written to the terminal writer.
   */
  ansiText: string;
  /**
   * DOM-free game render projection for the frame.
   */
  headlessFrame: HeadlessFrame;
  /**
   * Structural render facts for tests.
   */
  renderStats: AnsiFrameRenderStats;
  /**
   * Cloned game state represented by the frame.
   */
  state: GameState;
  /**
   * Terminal cell projection for the frame.
   */
  terminalFrame: TerminalFrame;
  /**
   * Result returned by the injected writer boundary.
   */
  writeResult: WriteFrameResult;
}>;

/**
 * Result of stepping zero or more terminal frames.
 */
export type AnsiFrameStepResult = Readonly<{
  /**
   * Per-frame terminal artifacts produced during this step call.
   */
  frames: ReadonlyArray<AnsiRenderedFrame>;
  /**
   * Cloned final game state after stepping.
   */
  state: GameState;
  /**
   * Write result from the last frame, or ok when no frame was rendered.
   */
  writeResult: WriteFrameResult;
}>;

/**
 * Deterministic terminal frame-step control surface for tests and CLI wiring.
 */
export type AnsiFrameStepDriver = Readonly<{
  /**
   * Queue raw terminal input for the next logical frame.
   */
  dispatchInput: (input: string) => void;
  /**
   * Return stats from the latest render.
   */
  getRenderStats: () => AnsiFrameRenderStats;
  /**
   * Return a cloned copy of the current game state.
   */
  getState: () => GameState;
  /**
   * Replace the current game state and clear queued input.
   */
  loadState: (state: GameState) => void;
  /**
   * Render the current game state without advancing simulation.
   */
  renderFrame: () => AnsiRenderedFrame;
  /**
   * Step and render a deterministic number of frames.
   */
  stepFrames: (frameCount: number) => AnsiFrameStepResult;
}>;

type InputQueue = ReadonlyArray<InputAction>;

type AnsiFrameStepContext = {
  inputQueue: InputQueue;
  latestRenderStats: AnsiFrameRenderStats;
  state: GameState;
};

const okWriteResult: WriteFrameResult = { type: "ok" };

const zeroRenderStats = (state: GameState): AnsiFrameRenderStats => ({
  enemiesDrawn: 0,
  frameIndex: state.frameIndex,
  playerDrawn: false,
  terminalCellsDrawn: 0,
});

const renderStatsForFrame = (
  state: GameState,
  headlessFrame: HeadlessFrame,
  terminalFrame: TerminalFrame,
): AnsiFrameRenderStats => ({
  enemiesDrawn: headlessFrame.cells.filter((cell) => cell.entity === "enemy")
    .length,
  frameIndex: state.frameIndex,
  playerDrawn: headlessFrame.cells.some((cell) => cell.entity === "player"),
  terminalCellsDrawn: terminalFrame.cells.length,
});

const cloneGameState = (state: GameState): GameState => structuredClone(state);

const normaliseFrameCount = (frameCount: number): number =>
  Number.isFinite(frameCount)
    ? Math.max(minimumFrameCount, Math.trunc(frameCount))
    : minimumFrameCount;

const writeAnsiText = (
  writer: TextWriter,
  ansiText: string,
): WriteFrameResult => {
  try {
    return writer.write(ansiText)
      ? okWriteResult
      : { reason: "write-failed", type: "error" };
  } catch {
    return { reason: "write-threw", type: "error" };
  }
};

const createDriverState = (options: AnsiFrameStepOptions): GameState =>
  cloneGameState(
    options.initialState ??
      createHeadlessGame({
        canvas: options.canvas ?? defaultCanvas,
        seed: options.seed ?? defaultSeed,
      }),
  );

const renderCurrentFrame = (
  context: AnsiFrameStepContext,
  writer: TextWriter,
): AnsiRenderedFrame => {
  const headlessFrame = projectHeadlessFrame(context.state);
  const terminalFrame = gameFrameToTerminalFrame(headlessFrame);
  const ansiText = encodeAnsiCommands(renderTerminalFrame(terminalFrame));
  const writeResult = writeAnsiText(writer, ansiText);
  const renderStats = renderStatsForFrame(
    context.state,
    headlessFrame,
    terminalFrame,
  );

  context.latestRenderStats = renderStats;

  return {
    ansiText,
    headlessFrame,
    renderStats,
    state: cloneGameState(context.state),
    terminalFrame,
    writeResult,
  };
};

const dispatchDriverInput = (
  context: AnsiFrameStepContext,
  input: string,
): void => {
  const normalisedInput = normaliseKey(input);

  if (normalisedInput.type === "some") {
    context.inputQueue = [...context.inputQueue, normalisedInput.value];
  }
};

const loadDriverState = (
  context: AnsiFrameStepContext,
  nextState: GameState,
): void => {
  context.state = cloneGameState(nextState);
  context.inputQueue = [];
  context.latestRenderStats = zeroRenderStats(context.state);
};

const stepDriverFrames = (
  context: AnsiFrameStepContext,
  writer: TextWriter,
  frameCount: number,
): AnsiFrameStepResult => {
  const frames = Array.from(
    { length: normaliseFrameCount(frameCount) },
    (): AnsiRenderedFrame => {
      context.state = stepHeadlessGame(context.state, context.inputQueue);
      context.inputQueue = [];
      return renderCurrentFrame(context, writer);
    },
  );
  const lastFrame = frames[frames.length - arrayLastIndexOffset];

  return {
    frames,
    state: cloneGameState(context.state),
    writeResult: lastFrame?.writeResult ?? okWriteResult,
  };
};

/**
 * Create a deterministic ANSI terminal frame-step driver.
 */
export const createAnsiFrameStepDriver = (
  options: AnsiFrameStepOptions,
): AnsiFrameStepDriver => {
  const initialState = createDriverState(options);
  const context: AnsiFrameStepContext = {
    inputQueue: [],
    latestRenderStats: zeroRenderStats(initialState),
    state: initialState,
  };

  /* node:coverage ignore next 12 */
  return {
    dispatchInput: (input: string): void => dispatchDriverInput(context, input),
    getRenderStats: (): AnsiFrameRenderStats => context.latestRenderStats,
    getState: (): GameState => cloneGameState(context.state),
    loadState: (nextState: GameState): void =>
      loadDriverState(context, nextState),
    renderFrame: (): AnsiRenderedFrame =>
      renderCurrentFrame(context, options.writer),
    stepFrames: (frameCount: number): AnsiFrameStepResult =>
      stepDriverFrames(context, options.writer, frameCount),
  };
};
