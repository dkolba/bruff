import { describe, expect, it } from "vitest";
import { createHeadlessGame } from "./create-headless-game.js";
import { projectHeadlessFrame } from "./project-headless-frame.js";
import { stepHeadlessGame } from "./step-headless-game.js";

const TEST_CANVAS = { height: 7, width: 7 };
const TEST_SEED = 1;

describe("projectHeadlessFrame", () => {
  it("projects board, entity cells, and frame index", () => {
    const state = createHeadlessGame({
      canvas: TEST_CANVAS,
      seed: TEST_SEED,
    });

    expect(projectHeadlessFrame(state)).toStrictEqual({
      board: state.board,
      cells: [
        { cell: state.player.cell, entity: "player" },
        ...state.enemies.map((enemy) => ({
          cell: enemy.cell,
          entity: "enemy",
        })),
      ],
      frameIndex: state.frameIndex,
    });
  });

  it("preserves render-only frame index semantics", () => {
    const state = createHeadlessGame({
      canvas: TEST_CANVAS,
      seed: TEST_SEED,
    });
    const renderOnlyState = stepHeadlessGame(state, []);

    expect(projectHeadlessFrame(renderOnlyState).frameIndex).toBe(
      state.frameIndex,
    );
  });
});
