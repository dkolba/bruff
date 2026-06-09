const TEMPLATE_HTML = `
  <style>
    :host {
      display: block;
      min-height: 100vh;
    }

    .quilt-stage {
      display: grid;
    }

    canvas {
      grid-area: 1 / 1;
    }
  </style>
  <section aria-label="Quilt map editor">
    <div data-quilt="toolbar" role="toolbar" aria-label="Map tools">
      <button type="button" data-quilt="paint-tool">Paint</button>
      <button type="button" data-quilt="erase-tool">Erase</button>
    </div>
    <div class="quilt-stage">
      <canvas data-quilt="terrain-canvas" width="512" height="512"></canvas>
      <canvas data-quilt="overlay-canvas" width="512" height="512"></canvas>
    </div>
  </section>
`;

/** Creates the Quilt shadow DOM template. */
export const createQuiltTemplate = (): HTMLTemplateElement => {
  const template = document.createElement("template");
  template.innerHTML = TEMPLATE_HTML;

  return template;
};
