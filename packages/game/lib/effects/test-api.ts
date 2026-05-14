/* eslint-disable no-underscore-dangle, unicorn/prefer-global-this -- The public browser hook is intentionally named window.__bruffTestApi. */
import type { BruffTestApi } from "./test-api-types.ts";
import type { FrameStepDriver } from "./frame-step-driver.ts";
import type { GameState } from "../core/types.ts";
import { normaliseKey } from "../input/normalise-input.js";

type TestApiHostElement = HTMLElement &
  Readonly<{
    setTestApi: (testApi: BruffTestApi | undefined) => void;
  }>;

const isTestApiHostElement = (
  element: Element | null,
): element is TestApiHostElement =>
  element instanceof HTMLElement && "setTestApi" in element;

const cloneGameState = (state: GameState): GameState => structuredClone(state);

const attachElementTestApi = (testApi?: BruffTestApi): void => {
  const gameElement = document.querySelector("bruff-game");
  if (isTestApiHostElement(gameElement)) {
    gameElement.setTestApi(testApi);
  }
};

const createBruffTestApi = (driver: FrameStepDriver): BruffTestApi => ({
  dispatchInput: (input: string): void => {
    const normalisedInput = normaliseKey(input);
    if (normalisedInput.type === "some") {
      driver.dispatchInput(normalisedInput.value);
    }
  },
  freezeForSnapshot: (): Promise<void> => driver.freezeForSnapshot(),
  getRenderStats: () => structuredClone(driver.getRenderStats()),
  getState: (): GameState => cloneGameState(driver.getState()),
  loadState: (state: GameState): void => {
    driver.loadState(cloneGameState(state));
  },
  stepFrames: (frameCount: number): GameState =>
    cloneGameState(driver.stepFrames(frameCount)),
});

/**
 * Attaches the browser test API to both window and the game element.
 *
 * @param driver - The active frame-step driver
 * @returns A teardown function that removes the API again
 */
export const attachTestApi = (driver: FrameStepDriver): (() => void) => {
  const testApi = createBruffTestApi(driver);
  window.__bruffTestApi = testApi;
  attachElementTestApi(testApi);

  return (): void => {
    if (window.__bruffTestApi === testApi) {
      delete window.__bruffTestApi;
    }
    attachElementTestApi();
  };
};
