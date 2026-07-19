/* eslint-disable no-underscore-dangle, unicorn/no-global-object-property-assignment, unicorn/prefer-global-this -- The public browser hook is intentionally named window.__bruffTestApi. */
import type { GameState } from "../../core/types.ts";
import { normaliseKey } from "../../input/normalise-input.js";
import type { FrameStepDriver } from "../frame-step-driver.ts";
import type { BruffTestApi } from "./test-api-types.ts";

type TestApiHostElement = HTMLElement &
  Readonly<{
    setTestApi: (testApi: BruffTestApi | undefined) => void;
  }>;

const isTestApiHostElement = (
  element: Element | null,
): element is TestApiHostElement =>
  element instanceof HTMLElement && "setTestApi" in element;

const cloneGameState = (state: GameState): GameState => structuredClone(state);

/**
Attaches the browser test API to both window and the game element.

@param driver - The active frame-step driver
@returns A teardown function that removes the API again
*/
export const attachTestApi = (driver: FrameStepDriver): (() => void) => {
  const dispatchInput = (input: string): void => {
    const normalisedInput = normaliseKey(input);
    if (normalisedInput.type === "some") {
      driver.dispatchInput(normalisedInput.value);
    }
  };

  const loadState = (state: GameState): void => {
    driver.loadState(cloneGameState(state));
  };

  const testApi: BruffTestApi = {
    dispatchInput,
    freezeForSnapshot: (): Promise<void> => driver.freezeForSnapshot(),
    getRenderStats: () => structuredClone(driver.getRenderStats()),
    getState: (): GameState => cloneGameState(driver.getState()),
    loadState,
    stepFrames: (frameCount: number): GameState =>
      cloneGameState(driver.stepFrames(frameCount)),
  };

  const gameElement = document.querySelector("bruff-game");
  window.__bruffTestApi = testApi;
  if (isTestApiHostElement(gameElement)) {
    gameElement.setTestApi(testApi);
  }

  return (): void => {
    const currentGameElement = document.querySelector("bruff-game");
    if (window.__bruffTestApi === testApi) {
      delete window.__bruffTestApi;
    }
    if (isTestApiHostElement(currentGameElement)) {
      currentGameElement.setTestApi(undefined);
    }
  };
};
