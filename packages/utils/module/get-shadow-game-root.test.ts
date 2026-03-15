import { beforeEach, expect, test } from "vitest";
import { getShadowGameRoot } from "./get-shadow-game-root.js";

let gameElement: HTMLElement = document.createElement("div");

beforeEach(() => {
  // Clean up any previous elements
  document.body.innerHTML = "";

  // Create fresh game element for each test
  gameElement = document.createElement("div");
  gameElement.id = "game";
  gameElement.attachShadow({ mode: "open" });
  document.body.append(gameElement);
});

test("#getShadowGameRoot returns shadow root when found", () => {
  const result = getShadowGameRoot("#game");
  expect(result).toBeDefined();
  expect(result instanceof ShadowRoot).toBeTruthy();
  expect(result).toBe(gameElement.shadowRoot);
});

test("#getShadowGameRoot throws when element not found", () => {
  expect(() => getShadowGameRoot("#non-existent")).toThrow(
    "Game root element not found",
  );
});

test("#getShadowGameRoot throws when element has no shadow root", () => {
  const elementWithoutShadow = document.createElement("div");
  elementWithoutShadow.id = "no-shadow";
  document.body.append(elementWithoutShadow);

  expect(() => getShadowGameRoot("#no-shadow")).toThrow(
    "Game root element not found",
  );
});

test("#getShadowGameRoot returns first matching element's shadow root", () => {
  const secondGame = document.createElement("div");
  secondGame.id = "game-2";
  secondGame.attachShadow({ mode: "open" });
  document.body.append(secondGame);

  const result = getShadowGameRoot("div");
  expect(result).toBe(gameElement.shadowRoot);
});
