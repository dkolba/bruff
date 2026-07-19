const TEMPLATE_HTML = `
  <style>
    :host {
      display: block;
      min-height: 100dvh;
    }

    .quilt-stage {
      display: grid;
      justify-content: center;
    }

    canvas {
      grid-area: 1 / 1;
    }
  </style>
  <section aria-label="Quilt map editor">
    <div data-quilt="toolbar" role="toolbar" aria-label="Map tools">
      <label>
        Grid
        <select data-quilt="grid-size-select" aria-label="Grid size">
          <option value="4">4×4</option>
          <option value="5">5×5</option>
          <option value="6">6×6</option>
          <option value="7">7×7</option>
          <option value="8">8×8</option>
          <option value="9">9×9</option>
        </select>
      </label>
      <button type="button" data-quilt="paint-tool">Paint</button>
      <button type="button" data-quilt="floor-tool">Floor</button>
      <button type="button" data-quilt="wall-tool">Wall</button>
      <button type="button" data-quilt="door-tool">Door</button>
      <button type="button" data-quilt="erase-tool">Erase</button>
      <button type="button" data-quilt="export-button">Export</button>
      <label>
        Import Glyphs
        <input type="file" accept=".json" data-quilt="import-input" hidden />
        <button type="button" data-quilt="import-button">Import</button>
      </label>
    </div>
    <div data-quilt="error-region" role="alert" aria-live="polite"></div>
    <div class="quilt-stage">
      <canvas data-quilt="terrain-canvas" width="512" height="512"></canvas>
      <canvas data-quilt="overlay-canvas" width="512" height="512"></canvas>
    </div>
  </section>
`;

/**
 * Creates the Quilt shadow DOM template.
 */
export const createQuiltTemplate = (): HTMLTemplateElement => {
  const template = document.createElement("template");
  template.innerHTML = TEMPLATE_HTML;

  return template;
};
