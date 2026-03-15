import { beforeEach, describe, expect, it, vi } from "vitest";
import { GameElement } from "./game-element.js";

// eslint-disable-next-line init-declarations
let gameElement: GameElement;

describe("GameElement", () => {
  beforeEach(() => {
    // Clean up any previous elements
    document.body.innerHTML = "";

    // Register custom element if not already registered
    if (!customElements.get("bruff-game")) {
      // eslint-disable-next-line wc/tag-name-matches-class
      customElements.define("bruff-game", GameElement);
    }

    // Create fresh game element for each test
    const element = document.createElement("bruff-game");
    if (!(element instanceof GameElement)) {
      throw new TypeError("Failed to create GameElement");
    }
    gameElement = element;
    document.body.append(gameElement);
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
    // The connectedCallback is called automatically when appended to the DOM.
    // Calling it again to test the guard clause.
    gameElement.connectedCallback();
    expect(gameElement.shadowRoot).toBeDefined();
    const firstShadowRoot = gameElement.shadowRoot;
    gameElement.connectedCallback();
    expect(gameElement.shadowRoot).toBe(firstShadowRoot);
  });
});

const mockStencilError = (templateElement: HTMLTemplateElement) => {
  const realCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tagName) => {
    if (tagName === "div") {
      const div = realCreateElement("div");
      vi.spyOn(div, "querySelector").mockReturnValue(templateElement);
      return div;
    }
    return realCreateElement(tagName);
  });

  // Use a real div as it's a Node but not a DocumentFragment
  const invalidNode = realCreateElement("div");
  vi.spyOn(templateElement.content, "cloneNode").mockReturnValue(invalidNode);
};

describe("GameElement Error Cases", () => {
  it("should throw TypeError if template is missing", () => {
    const originalTemplate = GameElement.template;
    GameElement.template = () => "<div>No template here</div>";
    const element = new GameElement();
    expect(() => element.connectedCallback()).toThrow(TypeError);
    expect(() => element.connectedCallback()).toThrow(
      "Template element not found",
    );
    GameElement.template = originalTemplate;
  });

  it("should throw TypeError if stencil is not a DocumentFragment", () => {
    const originalTemplate = GameElement.template;
    GameElement.template = () => "<template>Content</template>";
    const element = new GameElement();
    const templateElement = document.createElement("template");

    mockStencilError(templateElement);

    expect(() => element.connectedCallback()).toThrow(TypeError);
    expect(() => element.connectedCallback()).toThrow(
      "Failed to clone template",
    );

    vi.restoreAllMocks();
    GameElement.template = originalTemplate;
  });
});
