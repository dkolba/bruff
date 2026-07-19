import { consoleLogHandler, onLog } from "@bruff/utils";

/**
 * Browser test API stored by the game package in test mode.
 */
export type GameElementTestApi = unknown;

const createStencil = (templateMarkup: string): DocumentFragment => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = templateMarkup;
  const template = wrapper.querySelector("template");
  if (!(template instanceof HTMLTemplateElement)) {
    throw new TypeError("Template element not found");
  }
  const stencil = template.content.cloneNode(true);
  if (!(stencil instanceof DocumentFragment)) {
    throw new TypeError("Failed to clone template");
  }
  return stencil;
};

/**
 * A class to represent a game web component
 */
// eslint-disable-next-line wc/define-tag-after-class-definition
export class GameElement extends HTMLElement {
  #testApi: GameElementTestApi | undefined;

  #unsubscribe: (() => void) | undefined;

  static template(): string {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return `<template >
          <style>
          :host {
            display: block;
            height: 100%;
            width: 100%;
          }

          canvas {
            display: block;   /* this is IMPORTANT! */
            height: 100%;
            width: 100%;
            }

          #bruff-hud {
            position: fixed;
            inset-block-start: var(--space-3, 0.75rem);
            inset-inline-start: var(--space-3, 0.75rem);
            padding-block: var(--space-1, 0.25rem);
            padding-inline: var(--space-2, 0.5rem);
            color: var(--text-1, CanvasText);
            background: var(--surface-1, Canvas);
            border: 1px solid var(--border-color, color-mix(in oklch, CanvasText 45%, Canvas));
            font:
              var(--font-weight-semibold, 600) var(--font-size-0, 0.75rem) system-ui,
              sans-serif;
            z-index: 1;
          }
          </style>
          <div id="bruff-hud" aria-label="bruff status">bruff</div>
          <canvas id="gamecanvas" width="${width}" height="${height}"></canvas>
        </template>`;
  }

  get testApi(): GameElementTestApi | undefined {
    return this.#testApi;
  }

  setTestApi(testApi: GameElementTestApi | undefined): void {
    this.#testApi = testApi;
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" }).append(
        createStencil(GameElement.template()),
      );
    }

    if (this.#unsubscribe === undefined) {
      this.#unsubscribe = onLog(consoleLogHandler);
    }
  }

  disconnectedCallback(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = undefined;
  }
}

export default GameElement;
