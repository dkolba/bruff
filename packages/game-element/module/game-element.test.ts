import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { log } from "@bruff/utils";

import { GameElement } from "./game-element.js";

const SINGLE_CALL = 1;

const createGameElement = (): GameElement => {
  const element = document.createElement("bruff-game");
  if (!(element instanceof GameElement)) {
    throw new TypeError("Failed to create GameElement");
  }
  return element;
};

const registerGameElement = (): void => {
  if (!customElements.get("bruff-game")) {
    // eslint-disable-next-line wc/tag-name-matches-class
    customElements.define("bruff-game", GameElement);
  }
};

const createConnectedGameElement = (): GameElement => {
  registerGameElement();
  const element = createGameElement();
  document.body.append(element);
  return element;
};

const expectSingleCall = (spy: ReturnType<typeof vi.spyOn>): void => {
  expect(spy).toHaveBeenCalledTimes(SINGLE_CALL);
};

// eslint-disable-next-line init-declarations
let gameElement: GameElement;

describe("GameElement", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    gameElement = createConnectedGameElement();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should be defined as a custom element", () => {
    expect(customElements.get("bruff-game")).toBeDefined();
  });

  it("should create an instance that is a GameElement", () => {
    expect(gameElement).toBeInstanceOf(GameElement);
  });

  it("should be attached to the DOM", () => {
    expect(document.body.contains(gameElement)).toBe(true);
  });

  it("should not recreate shadow root if one already exists", () => {
    gameElement.connectedCallback();
    expect(gameElement.shadowRoot).toBeDefined();
    const firstShadowRoot = gameElement.shadowRoot;
    gameElement.connectedCallback();
    expect(gameElement.shadowRoot).toBe(firstShadowRoot);
  });

  it("forwards log events to the matching console method while connected", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    log({ level: "error", message: "boom" });

    expectSingleCall(consoleErrorSpy);
  });

  it("stops forwarding after disconnect", () => {
    const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    log({ level: "info", message: "before" });
    const beforeDisconnectCalls = consoleInfoSpy.mock.calls.length;
    gameElement.remove();
    log({ level: "info", message: "after" });

    expect(consoleInfoSpy.mock.calls.length).toBe(beforeDisconnectCalls);
  });

  it("resubscribes after reconnect", () => {
    const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    gameElement.remove();
    document.body.append(gameElement);
    log({ level: "info", message: "again" });

    expectSingleCall(consoleInfoSpy);
  });

  it("disconnectedCallback is a no-op before first connect", () => {
    const detachedElement = new GameElement();

    expect(() => detachedElement.disconnectedCallback()).not.toThrow();
  });
});

const mockStencilError = (templateElement: HTMLTemplateElement): void => {
  const realCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tagName) => {
    if (tagName === "div") {
      const div = realCreateElement("div");
      vi.spyOn(div, "querySelector").mockReturnValue(templateElement);
      return div;
    }
    return realCreateElement(tagName);
  });

  const invalidNode = realCreateElement("div");
  vi.spyOn(templateElement.content, "cloneNode").mockReturnValue(invalidNode);
};

describe("GameElement Error Cases", () => {
  it("should throw TypeError if template is missing", () => {
    const originalTemplate = GameElement.template;
    GameElement.template = (): string => "<div>No template here</div>";
    const element = new GameElement();
    expect(() => element.connectedCallback()).toThrow(TypeError);
    expect(() => element.connectedCallback()).toThrow("Template element not found");
    GameElement.template = originalTemplate;
  });

  it("should throw TypeError if stencil is not a DocumentFragment", () => {
    const originalTemplate = GameElement.template;
    GameElement.template = (): string => "<template>Content</template>";
    const element = new GameElement();
    const templateElement = document.createElement("template");

    mockStencilError(templateElement);

    expect(() => element.connectedCallback()).toThrow(TypeError);
    expect(() => element.connectedCallback()).toThrow("Failed to clone template");

    vi.restoreAllMocks();
    GameElement.template = originalTemplate;
  });
});
