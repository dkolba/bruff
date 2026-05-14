/* eslint-disable no-underscore-dangle, sort-imports, unicorn/prefer-global-this -- Tests assert the intentional window.__bruffTestApi surface. */
import { brand, createPrng } from "@bruff/utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FrameStepDriver } from "./frame-step-driver.ts";
import type { GameState } from "../core/types.ts";
import type { RenderStats } from "../render/render-stats.ts";
import { attachTestApi } from "./test-api.js";

const TEST_SEED = 1;
const STATE_VERSION = 1;
const ZERO = 0;
const TWO = 2;

const createState = (): GameState => ({
  canvas: { height: 600, width: 800 },
  enemies: [],
  frameIndex: ZERO,
  input: [],
  player: {
    id: brand<"PlayerId">("test-player"),
    size: 20,
    xPos: 200,
    yPos: 200,
  },
  playerMoved: false,
  prng: createPrng(TEST_SEED),
  seed: TEST_SEED,
  stateVersion: STATE_VERSION,
});

const renderStats: RenderStats = {
  enemiesDrawn: ZERO,
  frameIndex: ZERO,
  playerDrawn: false,
};

const createDriver = (): FrameStepDriver => ({
  dispatchInput: vi.fn(),
  freezeForSnapshot: vi.fn(() => Promise.resolve()),
  getRenderStats: vi.fn(() => renderStats),
  getState: vi.fn(createState),
  loadState: vi.fn(),
  renderFrame: vi.fn(() => renderStats),
  stepFrames: vi.fn(createState),
});

afterEach(() => {
  document.body.innerHTML = "";
  delete window.__bruffTestApi;
  vi.restoreAllMocks();
});

describe("attachTestApi", () => {
  it("attaches and removes the window test API", () => {
    const driver = createDriver();
    const detach = attachTestApi(driver);

    expect(window.__bruffTestApi).toBeDefined();

    detach();

    expect(window.__bruffTestApi).toBeUndefined();
  });

  it("dispatches normalised input through the driver", () => {
    const driver = createDriver();
    attachTestApi(driver);

    window.__bruffTestApi?.dispatchInput("ArrowUp");

    expect(driver.dispatchInput).toHaveBeenCalledWith({ type: "move-up" });
  });

  it("returns cloned state snapshots", () => {
    const driver = createDriver();
    attachTestApi(driver);

    const state = window.__bruffTestApi?.getState();

    expect(state).toStrictEqual(createState());
    expect(state).not.toBe(driver.getState());
  });

  it("attaches the same API to a host element when supported", () => {
    const hostElement = document.createElement("bruff-game");
    const setTestApi = vi.fn();
    Object.assign(hostElement, { setTestApi });
    document.body.append(hostElement);

    const detach = attachTestApi(createDriver());

    expect(setTestApi).toHaveBeenCalledWith(window.__bruffTestApi);

    detach();

    expect(setTestApi).toHaveBeenCalledTimes(TWO);
  });
});
