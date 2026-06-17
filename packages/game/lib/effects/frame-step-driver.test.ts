/* eslint-disable max-lines-per-function -- Tests keep each driver scenario self-contained. */
import { brand, createPrng } from "@bruff/utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  BOARD_COLUMNS,
  BOARD_ROWS,
  CURRENT_STATE_VERSION,
} from "../core/constants.js";
import type { GameState } from "../core/types.ts";
import { manualClock } from "./clock.js";
import { createFrameStepDriver } from "./frame-step-driver.js";

const TEST_SEED = 1;
const ZERO = 0;
const ONE_FRAME = 1;
const INITIAL_TIME_MS = 100;
const TWO_FRAMES = 2;
const THREE_FRAMES = 3;

const createState = (): GameState => ({
  board: { columns: BOARD_COLUMNS, rows: BOARD_ROWS },
  canvas: { height: 600, width: 800 },
  enemies: [],
  frameIndex: ZERO,
  input: [],
  player: {
    cell: { column: 3, row: 3 },
    id: brand<"PlayerId">("test-player"),
    size: 20,
  },
  playerMoved: false,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: CURRENT_STATE_VERSION,
});

const createContext = (): CanvasRenderingContext2D => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new TypeError("Failed to create canvas context");
  }
  return context;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createFrameStepDriver", () => {
  it("does not advance state for zero frames", () => {
    const initialState = createState();
    const driver = createFrameStepDriver({
      clock: manualClock(INITIAL_TIME_MS),
      context: createContext(),
      initialState,
      renderBackground: vi.fn(),
      renderGame: vi.fn(() => ({
        enemiesDrawn: ZERO,
        frameIndex: initialState.frameIndex,
        playerDrawn: true,
      })),
    });

    expect(driver.stepFrames(ZERO)).toStrictEqual(initialState);
  });

  it("renders frames without advancing logical ticks when no input is queued", () => {
    const driver = createFrameStepDriver({
      clock: manualClock(INITIAL_TIME_MS),
      context: createContext(),
      initialState: createState(),
      renderBackground: vi.fn(),
      renderGame: vi.fn((state: GameState) => ({
        enemiesDrawn: state.enemies.length,
        frameIndex: state.frameIndex,
        playerDrawn: true,
      })),
    });

    const nextState = driver.stepFrames(THREE_FRAMES);

    expect(nextState.frameIndex).toBe(ZERO);
    expect(driver.getRenderStats()).toStrictEqual({
      enemiesDrawn: ZERO,
      frameIndex: ZERO,
      playerDrawn: true,
    });
  });

  it("increments frameIndex once per rendered frame with queued input", () => {
    const driver = createFrameStepDriver({
      clock: manualClock(INITIAL_TIME_MS),
      context: createContext(),
      initialState: createState(),
      renderBackground: vi.fn(),
      renderGame: vi.fn((state: GameState) => ({
        enemiesDrawn: state.enemies.length,
        frameIndex: state.frameIndex,
        playerDrawn: true,
      })),
    });

    driver.dispatchInput({ type: "move-right" });
    driver.stepFrames(ONE_FRAME);
    driver.dispatchInput({ type: "move-down" });
    driver.stepFrames(ONE_FRAME);
    driver.dispatchInput({ type: "move-left" });
    const nextState = driver.stepFrames(ONE_FRAME);

    expect(nextState.frameIndex).toBe(THREE_FRAMES);
    expect(driver.getRenderStats()).toStrictEqual({
      enemiesDrawn: ZERO,
      frameIndex: THREE_FRAMES,
      playerDrawn: true,
    });
  });

  it("applies queued input before the next tick", () => {
    const initialState = createState();
    const driver = createFrameStepDriver({
      clock: manualClock(INITIAL_TIME_MS),
      context: createContext(),
      initialState,
      renderBackground: vi.fn(),
      renderGame: vi.fn((state: GameState) => ({
        enemiesDrawn: state.enemies.length,
        frameIndex: state.frameIndex,
        playerDrawn: true,
      })),
    });

    driver.dispatchInput({ type: "move-right" });
    driver.dispatchInput({ type: "move-down" });

    const nextState = driver.stepFrames(ONE_FRAME);

    expect(nextState.player.cell.column).toBeGreaterThan(
      initialState.player.cell.column,
    );
    expect(nextState.player.cell.row).toBeGreaterThan(
      initialState.player.cell.row,
    );
    expect(nextState.frameIndex).toBe(ONE_FRAME);
  });

  it("advances manual clock time for rendered frames", () => {
    const renderBackground = vi.fn();
    const driver = createFrameStepDriver({
      clock: manualClock(INITIAL_TIME_MS),
      context: createContext(),
      initialState: createState(),
      renderBackground,
      renderGame: vi.fn((state: GameState) => ({
        enemiesDrawn: state.enemies.length,
        frameIndex: state.frameIndex,
        playerDrawn: true,
      })),
    });

    driver.stepFrames(TWO_FRAMES);

    expect(renderBackground).toHaveBeenNthCalledWith(
      ONE_FRAME,
      INITIAL_TIME_MS,
    );
    expect(renderBackground).toHaveBeenNthCalledWith(
      TWO_FRAMES,
      expect.any(Number),
    );
  });

  it("uses the default background renderer when no override is provided", () => {
    const initialState = createState();
    const driver = createFrameStepDriver({
      clock: manualClock(INITIAL_TIME_MS),
      context: createContext(),
      initialState,
      renderGame: vi.fn((state: GameState) => ({
        enemiesDrawn: state.enemies.length,
        frameIndex: state.frameIndex,
        playerDrawn: true,
      })),
    });

    expect(driver.renderFrame()).toStrictEqual({
      enemiesDrawn: ZERO,
      frameIndex: initialState.frameIndex,
      playerDrawn: true,
    });
  });

  it("renders the current frame before freezing for a snapshot", async () => {
    const renderBackground = vi.fn();
    const renderGame = vi.fn((state: GameState) => ({
      enemiesDrawn: state.enemies.length,
      frameIndex: state.frameIndex,
      playerDrawn: true,
    }));
    const requestAnimationFrameSpy = vi
      .spyOn(globalThis, "requestAnimationFrame")
      .mockImplementation((callback: FrameRequestCallback): number => {
        callback(INITIAL_TIME_MS);
        return ONE_FRAME;
      });
    const driver = createFrameStepDriver({
      clock: manualClock(INITIAL_TIME_MS),
      context: createContext(),
      initialState: createState(),
      renderBackground,
      renderGame,
    });

    await driver.freezeForSnapshot();

    expect(renderBackground).toHaveBeenCalledWith(INITIAL_TIME_MS);
    expect(renderGame).toHaveBeenCalledTimes(ONE_FRAME);
    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(ONE_FRAME);
  });

  it("loads state and clears queued input", () => {
    const initialState = createState();
    const loadedState: GameState = {
      ...initialState,
      player: {
        ...initialState.player,
        cell: { column: 4, row: 3 },
      },
    };
    const driver = createFrameStepDriver({
      clock: manualClock(INITIAL_TIME_MS),
      context: createContext(),
      initialState,
      renderBackground: vi.fn(),
      renderGame: vi.fn((state: GameState) => ({
        enemiesDrawn: state.enemies.length,
        frameIndex: state.frameIndex,
        playerDrawn: true,
      })),
    });

    driver.dispatchInput({ type: "move-right" });
    driver.loadState(loadedState);

    expect(driver.getState()).toStrictEqual(loadedState);
    expect(driver.stepFrames(ONE_FRAME)).toStrictEqual(loadedState);
  });
});
