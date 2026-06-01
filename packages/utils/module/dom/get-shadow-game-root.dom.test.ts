import { beforeEach, expect, test } from "vitest";
import { error, ok } from "../universal/fp/result.js";
import { getShadowGameRoot } from "./get-shadow-game-root.js";

let gameElement: HTMLElement = document.createElement("div");

beforeEach(() => {
  document.body.innerHTML = "";

  gameElement = document.createElement("div");
  gameElement.id = "game";
  gameElement.attachShadow({ mode: "open" });
  document.body.append(gameElement);
});

test("#getShadowGameRoot returns ok with the shadow root when found", () => {
  expect(getShadowGameRoot("#game")).toEqual(ok(gameElement.shadowRoot));
});

test("#getShadowGameRoot returns error('game-root-not-found') when the selector matches nothing", () => {
  expect(getShadowGameRoot("#non-existent")).toEqual(
    error("game-root-not-found"),
  );
});

test("#getShadowGameRoot returns error('game-root-not-found') when the matched element has no shadow root", () => {
  const elementWithoutShadow = document.createElement("div");
  elementWithoutShadow.id = "no-shadow";
  document.body.append(elementWithoutShadow);

  expect(getShadowGameRoot("#no-shadow")).toEqual(error("game-root-not-found"));
});

test("#getShadowGameRoot returns ok with the first matching element's shadow root", () => {
  const secondGame = document.createElement("div");
  secondGame.id = "game-2";
  secondGame.attachShadow({ mode: "open" });
  document.body.append(secondGame);

  expect(getShadowGameRoot("div")).toEqual(ok(gameElement.shadowRoot));
});
