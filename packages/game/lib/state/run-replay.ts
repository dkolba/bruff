import { error, ok, type Result } from "@bruff/utils";

import type { InputAction } from "../core/actions.ts";
import type { GameState } from "../core/types.ts";
import { advanceGameState } from "./advance-game-state.js";
import createInitialState from "./create-initial-state.js";
import type {
  ReplayError,
  ReplayFixture,
  ReplayFrame,
} from "./replay-fixture.ts";

const FIRST_FRAME = 1;

const toInputAction = (input: string): Result<InputAction, ReplayError> => {
  switch (input) {
    case "move-down":
    case "move-left":
    case "move-right":
    case "move-up": {
      return ok({ type: input });
    }
    default: {
      return error({
        reason: `unknown replay input: ${input}`,
        type: "invalidFixture",
      });
    }
  }
};

const frameNumbers = (totalFrames: number): ReadonlyArray<number> =>
  Array.from(
    { length: totalFrames },
    (_unused, frameOffset) => frameOffset + FIRST_FRAME,
  );

const inputsForFrame = (
  frames: ReadonlyArray<ReplayFrame>,
  frameIndex: number,
): Result<ReadonlyArray<InputAction>, ReplayError> =>
  frames
    .filter((frame) => frame.frame === frameIndex)
    .reduce<Result<ReadonlyArray<InputAction>, ReplayError>>(
      (actions, frame) => {
        if (actions.type === "error") {
          return actions;
        }

        const action = toInputAction(frame.input);
        return action.type === "ok"
          ? ok([...actions.value, action.value])
          : action;
      },
      ok([]),
    );

const stepReplayFrame =
  (fixture: ReplayFixture) =>
  (
    stateResult: Result<GameState, ReplayError>,
    frameIndex: number,
  ): Result<GameState, ReplayError> => {
    if (stateResult.type === "error") {
      return stateResult;
    }

    const inputs = inputsForFrame(fixture.frames, frameIndex);
    return inputs.type === "ok"
      ? ok(advanceGameState(stateResult.value, inputs.value))
      : inputs;
  };

/**
Runs a deterministic replay fixture to completion.

@param fixture - Validated replay fixture
@returns Final game state or a typed replay error
*/
export const runReplay = (
  fixture: ReplayFixture,
): Result<GameState, ReplayError> =>
  frameNumbers(fixture.totalFrames).reduce<Result<GameState, ReplayError>>(
    stepReplayFrame(fixture),
    ok(createInitialState(fixture.initialCanvas, fixture.seed)),
  );
