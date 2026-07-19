/* eslint-disable max-statements -- Replay parsing validates a flat JSON contract step by step. */
import { error, ok, type Result } from "@bruff/utils";

import { CURRENT_STATE_VERSION } from "../core/constants.js";

const FIRST_FRAME = 1;
const ZERO_FRAMES = 0;

type InitialCanvasCandidate = Readonly<{
  height?: unknown;
  width?: unknown;
}>;

type ReplayFrameCandidate = Readonly<{
  frame?: unknown;
  input?: unknown;
}>;

type ReplayFixtureCandidate = Readonly<{
  frames?: unknown;
  initialCanvas?: unknown;
  seed?: unknown;
  stateVersion?: unknown;
  totalFrames?: unknown;
}>;

/**
 * One replay input scheduled before a logical frame.
 */
export type ReplayFrame = Readonly<{
  frame: number;
  input: string;
}>;

/**
 * Serializable replay fixture consumed by deterministic tests.
 */
export type ReplayFixture = Readonly<{
  frames: ReadonlyArray<ReplayFrame>;
  initialCanvas: Readonly<{
    height: number;
    width: number;
  }>;
  seed: number;
  stateVersion: number;
  totalFrames: number;
}>;

/**
 * Typed parse and replay failures.
 */
export type ReplayError =
  | Readonly<{
      reason: string;
      type: "invalidFixture";
    }>
  | Readonly<{
      expected: number;
      got: number;
      type: "stateVersionMismatch";
    }>
  | Readonly<{
      frame: number;
      total: number;
      type: "frameOutOfRange";
    }>;

const isRecord = (raw: unknown): raw is Readonly<Record<string, unknown>> =>
  typeof raw === "object" && raw !== null;

const isInitialCanvasCandidate = (
  raw: unknown,
): raw is InitialCanvasCandidate => isRecord(raw);

const isReplayFrameCandidate = (raw: unknown): raw is ReplayFrameCandidate =>
  isRecord(raw);

const isReplayFixtureCandidate = (
  raw: unknown,
): raw is ReplayFixtureCandidate => isRecord(raw);

const isNumber = (raw: unknown): raw is number =>
  typeof raw === "number" && Number.isFinite(raw);

const isInteger = (raw: unknown): raw is number =>
  isNumber(raw) && Number.isSafeInteger(raw);

const invalidFixture = (reason: string): Result<never, ReplayError> =>
  error({ reason, type: "invalidFixture" });

const parseInitialCanvas = (
  raw: unknown,
): Result<ReplayFixture["initialCanvas"], ReplayError> => {
  if (!isInitialCanvasCandidate(raw)) {
    return invalidFixture("initialCanvas must be an object");
  }

  if (!isNumber(raw.height) || !isNumber(raw.width)) {
    return invalidFixture("initialCanvas height and width must be numbers");
  }

  return ok({ height: raw.height, width: raw.width });
};

const parseReplayFrame = (raw: unknown): Result<ReplayFrame, ReplayError> => {
  if (!isReplayFrameCandidate(raw)) {
    return invalidFixture("frame entries must be objects");
  }

  if (!isInteger(raw.frame)) {
    return invalidFixture("frame must be an integer");
  }

  if (typeof raw.input !== "string") {
    return invalidFixture("input must be a string");
  }

  return ok({ frame: raw.frame, input: raw.input });
};

const parseFrames = (
  raw: unknown,
): Result<ReadonlyArray<ReplayFrame>, ReplayError> => {
  if (!Array.isArray(raw)) {
    return invalidFixture("frames must be an array");
  }

  return raw.reduce<Result<ReadonlyArray<ReplayFrame>, ReplayError>>(
    (parsedFrames, frame) => {
      if (parsedFrames.type === "error") {
        return parsedFrames;
      }

      const parsedFrame = parseReplayFrame(frame);
      return parsedFrame.type === "ok"
        ? ok([...parsedFrames.value, parsedFrame.value])
        : parsedFrame;
    },
    ok([]),
  );
};

const validateFrameRanges = (
  fixture: ReplayFixture,
): Result<ReplayFixture, ReplayError> => {
  const outOfRangeFrame = fixture.frames.find(
    (frame) => frame.frame < FIRST_FRAME || frame.frame > fixture.totalFrames,
  );

  return outOfRangeFrame === undefined
    ? ok(fixture)
    : error({
        frame: outOfRangeFrame.frame,
        total: fixture.totalFrames,
        type: "frameOutOfRange",
      });
};

/**
 * Parses an unknown JSON value into a validated replay fixture.
 *
 * @param raw - Unknown JSON-like replay data
 * @returns A typed fixture or a typed validation error
 */
export const parseReplayFixture = (
  raw: unknown,
): Result<ReplayFixture, ReplayError> => {
  if (!isReplayFixtureCandidate(raw)) {
    return invalidFixture("fixture must be an object");
  }

  if (!isInteger(raw.stateVersion)) {
    return invalidFixture("stateVersion must be an integer");
  }

  if (raw.stateVersion !== CURRENT_STATE_VERSION) {
    return error({
      expected: CURRENT_STATE_VERSION,
      got: raw.stateVersion,
      type: "stateVersionMismatch",
    });
  }

  if (!isInteger(raw.seed)) {
    return invalidFixture("seed must be an integer");
  }

  if (!isInteger(raw.totalFrames) || raw.totalFrames < ZERO_FRAMES) {
    return invalidFixture("totalFrames must be a non-negative integer");
  }

  const initialCanvas = parseInitialCanvas(raw.initialCanvas);
  if (initialCanvas.type === "error") {
    return initialCanvas;
  }

  const frames = parseFrames(raw.frames);
  if (frames.type === "error") {
    return frames;
  }

  return validateFrameRanges({
    frames: frames.value,
    initialCanvas: initialCanvas.value,
    seed: raw.seed,
    stateVersion: raw.stateVersion,
    totalFrames: raw.totalFrames,
  });
};
