import * as assert from "node:assert/strict";

import { createHeadlessGame, type GameState } from "@bruff/game/headless";
import { createAnsiFrameStepDriver } from "./ansi-frame-step-driver.ts";
import { test } from "node:test";
import type { TextWriter } from "./write-frame.ts";

const defaultCanvas = { height: 7, width: 7 };
const explicitCanvas = { height: 9, width: 5 };
const defaultSeed = 1;
const explicitSeed = 2;
const movedFrameIndex = 1;
const renderOnlyFrameCount = 3;
const defaultEnemyCount = 3;
const zeroFrameCount = 0;
const oneFrameCount = 1;
const negativeFrameCount = -1;
const fractionalFrameCount = 1.9;
const firstWrittenTextIndex = 0;
const rightColumn = 4;
const centerRow = 3;
const downRow = 4;

type WriterProbe = Readonly<{
  texts: () => ReadonlyArray<string>;
  writer: TextWriter;
}>;

const createWriterProbe = (): WriterProbe => {
  const writtenTexts: Array<string> = [];

  return {
    texts: (): ReadonlyArray<string> => writtenTexts,
    writer: {
      write: (text: string): boolean => {
        writtenTexts.push(text);
        return true;
      },
    },
  };
};

const createDriver = (
  initialState = createHeadlessGame({
    canvas: defaultCanvas,
    seed: defaultSeed,
  }),
): ReturnType<typeof createAnsiFrameStepDriver> =>
  createAnsiFrameStepDriver({
    initialState,
    writer: createWriterProbe().writer,
  });

const playerCell = (state: GameState): GameState["player"]["cell"] =>
  state.player.cell;

test("creates a default deterministic state from seed and canvas", (): void => {
  const driver = createAnsiFrameStepDriver({
    writer: createWriterProbe().writer,
  });
  const expectedState = createHeadlessGame({
    canvas: defaultCanvas,
    seed: defaultSeed,
  });

  assert.deepEqual(driver.getState(), expectedState);
  assert.deepEqual(driver.getRenderStats(), {
    enemiesDrawn: 0,
    frameIndex: expectedState.frameIndex,
    playerDrawn: false,
    terminalCellsDrawn: 0,
  });
});

test("creates state from explicit seed and canvas", (): void => {
  const driver = createAnsiFrameStepDriver({
    canvas: explicitCanvas,
    seed: explicitSeed,
    writer: createWriterProbe().writer,
  });
  const expectedState = createHeadlessGame({
    canvas: explicitCanvas,
    seed: explicitSeed,
  });

  assert.deepEqual(driver.getState(), expectedState);
});

test("loads an explicit initial state", (): void => {
  const initialState = createHeadlessGame({
    canvas: explicitCanvas,
    seed: explicitSeed,
  });
  const driver = createAnsiFrameStepDriver({
    initialState,
    writer: createWriterProbe().writer,
  });

  assert.deepEqual(driver.getState(), initialState);
});

test("returns cloned state from getState", (): void => {
  const driver = createDriver();
  const state = driver.getState();
  const laterState = driver.getState();

  assert.deepEqual(state, laterState);
  assert.notEqual(state, laterState);
  assert.notEqual(state.player, laterState.player);
});

test("clones loaded state and clears queued input", (): void => {
  const driver = createDriver();
  const loadedState = createHeadlessGame({
    canvas: defaultCanvas,
    seed: explicitSeed,
  });

  driver.dispatchInput("\u001B[C");
  driver.loadState(loadedState);
  const driverState = driver.getState();

  assert.deepEqual(driverState, loadedState);
  assert.notEqual(driverState, loadedState);
  assert.equal(
    driver.stepFrames(oneFrameCount).state.frameIndex,
    loadedState.frameIndex,
  );
});

test("ignores unknown input while still rendering requested frames", (): void => {
  const driver = createDriver();

  driver.dispatchInput("x");
  const result = driver.stepFrames(oneFrameCount);

  assert.equal(result.frames.length, oneFrameCount);
  assert.equal(result.state.frameIndex, zeroFrameCount);
});

test("normalises arrow and WASD input", (): void => {
  const arrowDriver = createDriver();
  const wasdDriver = createDriver();

  arrowDriver.dispatchInput("\u001B[C");
  wasdDriver.dispatchInput("d");

  assert.deepEqual(playerCell(arrowDriver.stepFrames(oneFrameCount).state), {
    column: rightColumn,
    row: centerRow,
  });
  assert.deepEqual(playerCell(wasdDriver.stepFrames(oneFrameCount).state), {
    column: rightColumn,
    row: centerRow,
  });
});

test("applies queued input FIFO in one logical tick", (): void => {
  const driver = createDriver();

  driver.dispatchInput("\u001B[C");
  driver.dispatchInput("\u001B[B");
  const result = driver.stepFrames(oneFrameCount);

  assert.equal(result.state.frameIndex, movedFrameIndex);
  assert.deepEqual(playerCell(result.state), {
    column: rightColumn,
    row: downRow,
  });
});

test("does not advance for zero, negative, fractional, or invalid counts", (): void => {
  const driver = createDriver();

  assert.equal(driver.stepFrames(zeroFrameCount).frames.length, zeroFrameCount);
  assert.equal(
    driver.stepFrames(negativeFrameCount).frames.length,
    zeroFrameCount,
  );
  assert.equal(driver.stepFrames(Number.NaN).frames.length, zeroFrameCount);
  assert.equal(
    driver.stepFrames(Number.POSITIVE_INFINITY).frames.length,
    zeroFrameCount,
  );
  assert.equal(
    driver.stepFrames(fractionalFrameCount).frames.length,
    oneFrameCount,
  );
});

test("renders frames without input while preserving frameIndex", (): void => {
  const driver = createDriver();
  const result = driver.stepFrames(renderOnlyFrameCount);

  assert.equal(result.frames.length, renderOnlyFrameCount);
  assert.equal(result.state.frameIndex, zeroFrameCount);
});

test("steps movement once then renders later frames only", (): void => {
  const driver = createDriver();

  driver.dispatchInput("\u001B[C");
  const result = driver.stepFrames(renderOnlyFrameCount);

  assert.equal(result.frames.length, renderOnlyFrameCount);
  assert.equal(result.state.frameIndex, movedFrameIndex);
  assert.deepEqual(
    result.frames.map((frame) => frame.state.frameIndex),
    [movedFrameIndex, movedFrameIndex, movedFrameIndex],
  );
});

test("returns terminal artifacts and ANSI text", (): void => {
  const writerProbe = createWriterProbe();
  const driver = createAnsiFrameStepDriver({
    writer: writerProbe.writer,
  });

  driver.dispatchInput("\u001B[C");
  const result = driver.stepFrames(oneFrameCount);
  const [frame] = result.frames;

  assert.equal(frame?.ansiText, writerProbe.texts()[firstWrittenTextIndex]);
  assert.equal(
    frame?.headlessFrame.cells.length,
    frame?.terminalFrame.cells.length,
  );
  assert.equal(frame?.writeResult.type, "ok");
  assert.deepEqual(result.state, frame?.state);
});

test("returns render stats and cloned final state", (): void => {
  const driver = createAnsiFrameStepDriver({
    writer: createWriterProbe().writer,
  });

  driver.dispatchInput("\u001B[C");
  const result = driver.stepFrames(oneFrameCount);
  const [frame] = result.frames;

  assert.equal(frame?.renderStats.frameIndex, movedFrameIndex);
  assert.equal(frame?.renderStats.playerDrawn, true);
  assert.equal(frame?.renderStats.enemiesDrawn, defaultEnemyCount);
  assert.notEqual(result.state, driver.getState());
});

test("renderFrame renders without advancing frameIndex", (): void => {
  const driver = createDriver();
  const renderedFrame = driver.renderFrame();

  assert.equal(renderedFrame.state.frameIndex, zeroFrameCount);
  assert.equal(driver.getState().frameIndex, zeroFrameCount);
  assert.equal(driver.getRenderStats().frameIndex, zeroFrameCount);
});

test("records writer output results", (): void => {
  const successfulWriter = createWriterProbe();
  const failedDriver = createAnsiFrameStepDriver({
    writer: { write: (): boolean => false },
  });
  const threwDriver = createAnsiFrameStepDriver({
    writer: {
      write: (): boolean => {
        throw new Error("write failed");
      },
    },
  });

  assert.deepEqual(
    createAnsiFrameStepDriver({ writer: successfulWriter.writer }).renderFrame()
      .writeResult,
    { type: "ok" },
  );
  assert.deepEqual(failedDriver.renderFrame().writeResult, {
    reason: "write-failed",
    type: "error",
  });
  assert.deepEqual(threwDriver.renderFrame().writeResult, {
    reason: "write-threw",
    type: "error",
  });
});
