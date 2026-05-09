import { apply, isSupported, type Observable } from "observable-polyfill/fn";
import type { GameAction, InputAction } from "../core/actions.ts";
import createInitialState from "../state/create-initial-state.js";
import createKeyDownObservable from "./observable/keydown.js";
import createTouchObservable from "./observable/touch.js";
import curtainUp from "./curtain-up.js";
import type { GameState } from "../core/types.ts";
import { radiatingBarsBackgroundAnimation } from "@bruff/utils";
import render from "./render.js";
import { updateEnemies } from "../state/update-enemies.js";
import updatePlayer from "../state/update-player.js";

/** Generator that yields and receives {@link GameState} values to drive the main game loop. */
type GameStateGenerator = Generator<GameState, GameState, InputAction | undefined>;

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
  (context: CanvasRenderingContext2D) => (time: number) =>
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
    state = foldActions({ ...state, input: [] }, actions);
  }
};

/**
 * Creates the keyboard and touch input observables.
 *
 * @returns An object containing the key and touch observable streams
 */
const createGameObservables = () => {
  const keyObservable$ = createKeyDownObservable();
  const touchObservable$ = createTouchObservable();
  return { keyObservable$, touchObservable$ };
};

/**
 * Subscribes to game observables and connects them to the game loop.
 *
 * @param onInput - Callback invoked for each recognised input action
 * @param gameObservables - Object containing observable streams
 */
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
    console.info("touch:", action.type);
  });
};

/**
 * Builds and starts the game-loop generator, wires the input
 * observables to it, and returns a getter for the latest state.
 * The generator only advances (ticks) when player input fires —
 * the render frame reads state without calling `.next()`.
 *
 * @param canvas - The canvas the initial state is sized against
 * @returns A getter that returns the most recently computed {@link GameState}
 */
const startGameLoopIterator = (canvas: HTMLCanvasElement): (() => GameState) => {
  const initialGameState = createInitialState(canvas);
  const gameLoopIter = createGameLoop(initialGameState);
  let latestState: GameState = gameLoopIter.next().value;
  const gameObservables = createGameObservables();
  subscribeToGameObservables((action: InputAction) => {
    latestState = gameLoopIter.next(action).value;
  }, gameObservables);
  return () => latestState;
};

/**
 * Builds the recursive `requestAnimationFrame` callback.
 *
 * @param context - The 2D rendering context to draw on
 * @param getState - Getter for the current game state
 * @returns A frame callback that schedules the next frame on each call
 */
const buildRenderFrame =
  (
    context: CanvasRenderingContext2D,
    getState: () => GameState,
  ): ((time: number) => void) =>
  (time: number): void => {
    curriedRadiatingBarsBackgroundAnimation(context)(time);
    render(getState(), context);
    requestAnimationFrame(buildRenderFrame(context, getState));
  };

/**
 * Entry point that initialises the canvas, wires up input observables,
 * and starts the render animation loop.
 */
const loop = (): void => {
  const stageResult = curtainUp();
  if (stageResult.type === "error") {
    console.error(`bruff: setup failed (${stageResult.error})`);
    return;
  }
  const { canvas, context, removeCanvasResizeListener } = stageResult.value;
  const getState = startGameLoopIterator(canvas);
  window.addEventListener("beforeunload", removeCanvasResizeListener);
  requestAnimationFrame(buildRenderFrame(context, getState));
};

export default loop;
