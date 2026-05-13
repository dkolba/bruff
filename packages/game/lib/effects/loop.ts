/* eslint-disable sort-imports -- session override requested by user */
import { apply, isSupported, type Observable } from "observable-polyfill/fn";
import type { GameAction, InputAction } from "../core/actions.ts";
import { log, radiatingBarsBackgroundAnimation } from "@bruff/utils";
import type { GameState } from "../core/types.ts";
import { updateEnemies } from "../state/update-enemies.js";
import * as clock from "./clock.js";
import createInitialState from "../state/create-initial-state.js";
import createKeyDownObservable from "./observable/keydown.js";
import createTouchObservable from "./observable/touch.js";
import curtainUp from "./curtain-up.js";
import render from "./render.js";
import updatePlayer from "../state/update-player.js";
type GameStateGenerator = Generator<
  GameState,
  GameState,
  InputAction | undefined
>;

if (!isSupported()) {
  apply();
}

/**
 * Curries {@link radiatingBarsBackgroundAnimation} over a fixed canvas context.
 *
 * @param context - The 2D rendering context to draw on
 * @returns A function that accepts a timestamp and renders one animation frame
 */
const curriedRadiatingBarsBackgroundAnimation =
  (context: CanvasRenderingContext2D) =>
  (time: number): void =>
    radiatingBarsBackgroundAnimation(context, time);

/**
 * Folds an ordered list of {@link GameAction}s through both reducers,
 * starting from `state`. Per A-18 input actions precede the
 * tick action assembled in {@link createGameLoop}.
 */
const foldActions = (
  state: GameState,
  actions: ReadonlyArray<GameAction>,
): GameState =>
  actions.reduce<GameState>(
    (currentState, action) =>
      updateEnemies(updatePlayer(currentState, action), action),
    state,
  );

/**
 * Generator that drives the main game loop. Yields the current
 * state and resumes when the shell feeds in an {@link InputAction}
 * (or `undefined` for the bootstrap step). Each step appends the
 * received input to the queue, folds the queue plus a synthesized
 * `tick` through both reducers, and starts the next step with an
 * empty queue.
 *
 * @param initialState - The starting game state
 */
const FRAME_INDEX_INCREMENT = 1;

const createGameLoop = function* (initialState: GameState): GameStateGenerator {
  let state = initialState;

  while (true) {
    const receivedInput = yield state;
    const queuedInputs: ReadonlyArray<InputAction> =
      receivedInput === undefined
        ? state.input
        : [...state.input, receivedInput];
    const actions: ReadonlyArray<GameAction> = [
      ...queuedInputs,
      { type: "tick" },
    ];
    const nextState = foldActions({ ...state, input: [] }, actions);
    state = {
      ...nextState,
      frameIndex: state.frameIndex + FRAME_INDEX_INCREMENT,
    };
  }
};

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

const startGameLoopIterator = (
  canvas: HTMLCanvasElement,
): (() => GameState) => {
  const initialGameState = createInitialState(canvas);
  const gameLoopIter = createGameLoop(initialGameState);
  let latestState: GameState = gameLoopIter.next().value;
  const gameObservables = createGameObservables();
  subscribeToGameObservables((action: InputAction) => {
    latestState = gameLoopIter.next(action).value;
  }, gameObservables);
  return () => latestState;
};

const buildRenderFrame = (
  context: CanvasRenderingContext2D,
  getState: () => GameState,
): (() => void) => {
  const gameClock = clock.wallClock();

  return (): void => {
    const frameTime = clock.readClock(gameClock);
    curriedRadiatingBarsBackgroundAnimation(context)(frameTime);
    render(getState(), context);
    requestAnimationFrame(buildRenderFrame(context, getState));
  };
};

const loop = (): void => {
  const stageResult = curtainUp();
  if (stageResult.type === "error") {
    log({
      context: { error: stageResult.error },
      level: "error",
      message: "setup failed",
      source: "@bruff/game/effects/loop",
    });
    return;
  }
  const { canvas, context, removeCanvasResizeListener } = stageResult.value;
  const getState = startGameLoopIterator(canvas);
  window.addEventListener("beforeunload", removeCanvasResizeListener);
  requestAnimationFrame(buildRenderFrame(context, getState));
};

export default loop;
