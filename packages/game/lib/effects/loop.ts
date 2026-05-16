/* eslint-disable sort-imports -- Imports are grouped by runtime boundary. */
import { apply, isSupported, type Observable } from "observable-polyfill/fn";
import type { InputAction } from "../core/actions.ts";
import { log } from "@bruff/utils";
import {
  createManualFrameStepDriver,
  createWallClockFrameStepDriver,
  type FrameStepDriver,
} from "./frame-step-driver.js";
import createInitialState from "../state/create-initial-state.js";
import createKeyDownObservable from "./observable/keydown.js";
import createTouchObservable from "./observable/touch.js";
import curtainUp from "./curtain-up.js";
import isTestMode from "./test-mode.js";

if (!isSupported()) {
  apply();
}

const ONE_FRAME = 1;

const createGameObservables = (): {
  keyObservable$: Observable<InputAction>;
  touchObservable$: Observable<InputAction>;
} => {
  const keyObservable$ = createKeyDownObservable();
  const touchObservable$ = createTouchObservable();
  return { keyObservable$, touchObservable$ };
};

const subscribeToGameObservables = (
  onInput: (action: InputAction) => void,
  gameObservables: {
    keyObservable$: Observable<InputAction>;
    touchObservable$: Observable<InputAction>;
  },
): void => {
  const { keyObservable$, touchObservable$ } = gameObservables;
  keyObservable$.subscribe(onInput);
  touchObservable$.subscribe(onInput);
  touchObservable$.subscribe((action: InputAction) => {
    log({
      context: { actionType: action.type },
      level: "info",
      message: "touch",
      source: "@bruff/game/effects/loop",
    });
  });
};

const readSeedAttribute = (): number | undefined => {
  const gameElement = document.querySelector<HTMLElement>("bruff-game");
  // eslint-disable-next-line dot-notation -- TS4111 requires indexed access for DOMStringMap keys.
  const seedAttribute = gameElement?.dataset["seed"];
  if (seedAttribute === undefined) {
    return undefined;
  }

  const seed = Number.parseInt(seedAttribute, 10);
  return Number.isFinite(seed) ? seed : undefined;
};

const createGameDriver = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
): FrameStepDriver => {
  const initialGameState = createInitialState(canvas, readSeedAttribute());
  const driver = isTestMode()
    ? createManualFrameStepDriver(context, initialGameState)
    : createWallClockFrameStepDriver(context, initialGameState);
  const gameObservables = createGameObservables();
  subscribeToGameObservables((action: InputAction) => {
    driver.dispatchInput(action);
  }, gameObservables);
  return driver;
};

const buildRenderFrame =
  (driver: FrameStepDriver): (() => void) =>
  (): void => {
    driver.stepFrames(ONE_FRAME);
    requestAnimationFrame(buildRenderFrame(driver));
  };

const attachTestApiInTestMode = async (
  driver: FrameStepDriver,
): Promise<void> => {
  const testApiModule = await import("./test-api/attach-test-api.js");
  testApiModule.attachTestApi(driver);
};

const handleStageError = (error: unknown): void => {
  log({
    context: { error },
    level: "error",
    message: "setup failed",
    source: "@bruff/game/effects/loop",
  });
};

const startDriver = (driver: FrameStepDriver): void => {
  if (__BRUFF_TEST_MODE__ && isTestMode()) {
    // eslint-disable-next-line no-void -- Fire-and-forget dynamic import keeps test API out of production bundles.
    void attachTestApiInTestMode(driver);
    return;
  }

  requestAnimationFrame(buildRenderFrame(driver));
};

const loop = (): void => {
  const stageResult = curtainUp();
  if (stageResult.type === "error") {
    handleStageError(stageResult.error);
    return;
  }
  const { canvas, context, removeCanvasResizeListener } = stageResult.value;
  const driver = createGameDriver(canvas, context);
  window.addEventListener("beforeunload", removeCanvasResizeListener);
  startDriver(driver);
};

export default loop;
