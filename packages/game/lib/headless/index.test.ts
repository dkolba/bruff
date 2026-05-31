import {
  createHeadlessGame,
  normaliseKey,
  projectHeadlessFrame,
  stepHeadlessGame,
} from "@bruff/game/headless";
import { describe, expect, it } from "vitest";

const TEST_CANVAS = { height: 7, width: 7 };
const TEST_SEED = 1;

describe("@bruff/game/headless import", () => {
  it("does not register the browser custom element when imported", () => {
    expect(customElements.get("bruff-game")).toBeUndefined();
  });
});

describe("@bruff/game/headless creation", () => {
  it("creates deterministic initial states from plain options", () => {
    const firstState = createHeadlessGame({
      canvas: TEST_CANVAS,
      seed: TEST_SEED,
    });
    const secondState = createHeadlessGame({
      canvas: TEST_CANVAS,
      seed: TEST_SEED,
    });

    expect(firstState).toStrictEqual(secondState);
  });
});

describe("@bruff/game/headless stepping", () => {
  it("normalises and steps deterministic input through the public facade", () => {
    const state = createHeadlessGame({
      canvas: TEST_CANVAS,
      seed: TEST_SEED,
    });
    const input = normaliseKey("ArrowRight");

    expect(input).toStrictEqual({
      type: "some",
      value: { type: "move-right" },
    });

    if (input.type === "none") {
      expect.unreachable("ArrowRight should normalise into a movement input");
    }

    expect(stepHeadlessGame(state, [input.value])).toStrictEqual(
      stepHeadlessGame(state, [input.value]),
    );
  });
});

describe("@bruff/game/headless projection", () => {
  it("projects a renderer-neutral frame from state", () => {
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
});
