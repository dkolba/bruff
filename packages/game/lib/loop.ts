import { apply, isSupported, type Observable } from "observable-polyfill/fn";
import createInitialState from "./state/create-initial-state.js";
import createKeyDownObservable from "./observable/keydown.js";
import createTouchObservable from "./observable/touch.js";
import curtainUp from "./curtain-up.js";
import type { GameState } from "./core/types.ts";
import { radiatingBarsBackgroundAnimation } from "@bruff/utils";
import render from "./render/render.js";
import { updateEnemies } from "./state/update-enemies.js";
import updatePlayer from "./state/update-player.js";

/** Generator that yields and receives {@link GameState} values to drive the main game loop. */
type GameStateGenerator = Generator<GameState, GameState, string>;

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
 * Generator that drives the main game loop.
 * Yields the current state and resumes with the next player input.
 *
 * @param initialState - The starting game state
 */
const createGameLoop = function* (initialState: GameState): GameStateGenerator {
  let state = initialState;

  while (true) {
    const receivedInput = yield state; // Expose current state, wait for input
    const updatedInput = receivedInput
      ? { input: [...state.input, receivedInput] }
      : { input: [...state.input] };
    const stateAfterPlayerUpdate = updatePlayer({ ...state, ...updatedInput }); // Compute next state

    // Update enemies only if the player moved
    state = stateAfterPlayerUpdate.playerMoved
      ? updateEnemies(stateAfterPlayerUpdate)
      : stateAfterPlayerUpdate;
  }
};

/**
 * Curries a game-loop iterator into a single-argument function.
 *
 * @param gameLoop - The running game loop generator
 * @returns A function that feeds one key input into the loop
 */
const curriedGameStateGenerator =
  (gameLoop: GameStateGenerator) => (key: string) => {
    gameLoop.next(key);
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
 * @param curriedGameLoop - Function that feeds input to the game loop
 * @param gameObservables - Object containing observable streams
 */
const subscribeToGameObservables = (
  curriedGameLoop: (key: string) => void,
  gameObservables: {
    keyObservable$: Observable<string>;
    touchObservable$: Observable<string>;
  },
) => {
  const { keyObservable$, touchObservable$ } = gameObservables;
  keyObservable$.subscribe(curriedGameLoop);
  touchObservable$.subscribe(curriedGameLoop);
  touchObservable$.subscribe((event: string) => {
    console.info("touch:", event);
  });
};

/**
 * Builds and starts the game-loop generator, wires the input
 * observables to it, and returns the running iterator.
 *
 * @param canvas - The canvas the initial state is sized against
 * @returns The running game-loop iterator
 */
const startGameLoopIterator = (
  canvas: HTMLCanvasElement,
): GameStateGenerator => {
  const initialGameState = createInitialState(canvas);
  const gameLoopIter = createGameLoop(initialGameState);
  gameLoopIter.next();
  const gameObservables = createGameObservables();
  subscribeToGameObservables(
    curriedGameStateGenerator(gameLoopIter),
    gameObservables,
  );
  return gameLoopIter;
};

/**
 * Builds the recursive `requestAnimationFrame` callback.
 *
 * @param context - The 2D rendering context to draw on
 * @param gameLoopIter - The running game-loop iterator
 * @returns A frame callback that schedules the next frame on each call
 */
const buildRenderFrame =
  (
    context: CanvasRenderingContext2D,
    gameLoopIter: GameStateGenerator,
  ): ((time: number) => void) =>
  (time: number): void => {
    curriedRadiatingBarsBackgroundAnimation(context)(time);
    const currentGameState = gameLoopIter.next().value;
    render(currentGameState, context);
    requestAnimationFrame(buildRenderFrame(context, gameLoopIter));
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
  const gameLoopIter = startGameLoopIterator(canvas);
  window.addEventListener("beforeunload", removeCanvasResizeListener);
  requestAnimationFrame(buildRenderFrame(context, gameLoopIter));
};

export default loop;
