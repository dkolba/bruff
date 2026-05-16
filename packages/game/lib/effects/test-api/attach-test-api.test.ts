/* eslint-disable no-underscore-dangle, sort-imports, unicorn/prefer-global-this -- Tests assert the intentional window.__bruffTestApi surface. */
import { brand, createPrng } from "@bruff/utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FrameStepDriver } from "../frame-step-driver.ts";
import type { GameState } from "../../core/types.ts";
import type { RenderStats } from "../../render/render-stats.ts";
import type { BruffTestApi } from "./test-api-types.ts";
import { attachTestApi } from "./attach-test-api.js";

const TEST_SEED = 1;
const STATE_VERSION = 1;
const ZERO = 0;
const ONE_FRAME = 1;
const ONE_CALL = 1;
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

const getTestApi = (): BruffTestApi => {
  const testApi = window.__bruffTestApi;
  expect(testApi).toBeDefined();
  if (testApi === undefined) {
    throw new Error("Expected window.__bruffTestApi to be attached");
  }
  return testApi;
};

afterEach(() => {
  document.body.innerHTML = "";
  delete window.__bruffTestApi;
  vi.restoreAllMocks();
});

describe("attachTestApi window attachment", () => {
  it("attaches and removes the window test API", () => {
    const driver = createDriver();
    const querySelectorSpy = vi.spyOn(document, "querySelector");
    const detach = attachTestApi(driver);

    expect(window.__bruffTestApi).toBeDefined();
    expect(querySelectorSpy).toHaveBeenCalledWith("bruff-game");

    detach();

    expect(window.__bruffTestApi).toBeUndefined();
  });
});

describe("window.__bruffTestApi input dispatch", () => {
  it("dispatches normalised input through the driver", () => {
    const driver = createDriver();
    attachTestApi(driver);
    const testApi = getTestApi();

    testApi.dispatchInput("ArrowUp");

    expect(driver.dispatchInput).toHaveBeenCalledWith({ type: "move-up" });
  });

  it("ignores input that cannot be normalised", () => {
    const driver = createDriver();
    attachTestApi(driver);
    const testApi = getTestApi();

    testApi.dispatchInput("KeyQ");

    expect(driver.dispatchInput).not.toHaveBeenCalled();
  });
});

describe("window.__bruffTestApi state snapshots", () => {
  it("returns cloned state snapshots", () => {
    const driver = createDriver();
    attachTestApi(driver);
    const testApi = getTestApi();

    const state = testApi.getState();

    expect(state).toStrictEqual(createState());
    expect(state).not.toBe(driver.getState());
  });
});

describe("attachTestApi host attachment", () => {
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

  it("ignores bruff-game elements without test API support", () => {
    document.body.append(document.createElement("bruff-game"));

    const detach = attachTestApi(createDriver());

    expect(window.__bruffTestApi).toBeDefined();

    detach();

    expect(window.__bruffTestApi).toBeUndefined();
  });
});

describe("attachTestApi teardown ownership", () => {
  it("does not remove a newer window test API", () => {
    const detachFirst = attachTestApi(createDriver());
    const firstTestApi = window.__bruffTestApi;
    const detachSecond = attachTestApi(createDriver());
    const secondTestApi = window.__bruffTestApi;

    expect(secondTestApi).toBeDefined();
    expect(secondTestApi).not.toBe(firstTestApi);

    detachFirst();

    expect(window.__bruffTestApi).toBe(secondTestApi);

    detachSecond();

    expect(window.__bruffTestApi).toBeUndefined();
  });
});

describe("window.__bruffTestApi render driver methods", () => {
  it("freezes snapshots through the driver", async () => {
    const driver = createDriver();
    attachTestApi(driver);
    const testApi = getTestApi();

    await testApi.freezeForSnapshot();

    expect(driver.freezeForSnapshot).toHaveBeenCalledTimes(ONE_CALL);
  });

  it("returns cloned render stats", () => {
    const driver = createDriver();
    attachTestApi(driver);
    const testApi = getTestApi();

    const stats = testApi.getRenderStats();

    expect(stats).toStrictEqual(renderStats);
    expect(stats).not.toBe(driver.getRenderStats());
  });
});

describe("window.__bruffTestApi state driver methods", () => {
  it("loads cloned state through the driver", () => {
    const state = createState();
    const loadState = vi.fn((loadedState: GameState): void => {
      expect(loadedState).toStrictEqual(state);
      expect(loadedState).not.toBe(state);
    });
    const driver: FrameStepDriver = { ...createDriver(), loadState };
    attachTestApi(driver);
    const testApi = getTestApi();

    testApi.loadState(state);

    expect(loadState).toHaveBeenCalledTimes(ONE_CALL);
  });

  it("steps frames and returns cloned state", () => {
    const state = createState();
    const stepFrames = vi.fn(() => state);
    const driver: FrameStepDriver = { ...createDriver(), stepFrames };
    attachTestApi(driver);
    const testApi = getTestApi();

    const nextState = testApi.stepFrames(ONE_FRAME);

    expect(stepFrames).toHaveBeenCalledWith(ONE_FRAME);
    expect(nextState).toStrictEqual(state);
    expect(nextState).not.toBe(state);
  });
});
