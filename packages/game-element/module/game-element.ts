import { consoleLogHandler, onLog } from "@bruff/utils";

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
  #unsubscribe: (() => void) | undefined;

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

  static template(): string {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return `<template >
          <style>
          canvas {
            display: block;   /* this is IMPORTANT! */
            height: 100%;
            width: 100%;
            }
          </style>
          <canvas id="gamecanvas" width="${width}" height="${height}"></canvas>
        </template>`;
  }
}

export default GameElement;
