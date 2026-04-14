import { apply, isSupported, type Observable } from "observable-polyfill/fn";
import createInitialState from "./create-initial-state.js";
import createKeyDownObservable from "./observable/keydown.js";
import createTouchObservable from "./observable/touch.js";
import curtainUp from "./curtain-up.js";
import type { GameState } from "../types/game-state-type.ts";
import { radiatingBarsBackgroundAnimation } from "./helpers/radiating-bars-background-animation.js";
import render from "./render.js";
import { updateEnemies } from "./update-enemies.js";
import updatePlayer from "./update-player.js";

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
 * Entry point that initialises the canvas, wires up input observables,
 * and starts the render animation loop.
 */
const loop = () => {
  /**
   * INITIAL ONE-TIME SETUP
   * */
  const { canvas, context, removeCanvasResizeListener } = curtainUp();
  const initialGameState = createInitialState(canvas);
  const gameLoopIter = createGameLoop(initialGameState);
  // Start the game loop
  gameLoopIter.next();

  /**
   * OBSERVABLE & SUBSCRIPTION SETUP
   * */
  const gameObservables = createGameObservables();
  subscribeToGameObservables(
    curriedGameStateGenerator(gameLoopIter),
    gameObservables,
  );

  const renderFrame =
    (renderContext: CanvasRenderingContext2D) =>
    (time: number): void => {
      curriedRadiatingBarsBackgroundAnimation(renderContext)(time);
      const currentGameState = gameLoopIter.next().value;
      render(currentGameState, context);
      requestAnimationFrame(renderFrame(renderContext)); // Schedule next frame
    };

  window.addEventListener("beforeunload", () => {
    removeCanvasResizeListener();
  });

  // Start the enigne
  requestAnimationFrame(renderFrame(context));
};

export default loop;
