/** Static shadow DOM template for the sigil tool shell. */
export const TOOL_SIGIL_TEMPLATE = `<style>
  :host {
    box-sizing: border-box;
    display: block;
    min-height: 100%;
    padding: 2rem;
    color: CanvasText;
    background: Canvas;
    font-family: system-ui, sans-serif;
    text-align: left;
    height: 100%;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  section {
    height: inherit;
    max-width: 56rem;
    margin: 0 auto;
    overflow-y: auto;
  }

  h1 {
    margin: 0 0 0.75rem;
    font-size: 2rem;
    line-height: 1.1;
  }

  p,
  label,
  input,
  select,
  textarea,
  button {
    font: inherit;
  }

  p,
  form {
    margin: 0;
  }

  form {
    display: grid;
    gap: 1rem;
    max-width: 42rem;
  }

  label {
    display: grid;
    gap: 0.35rem;
    font-weight: 600;
  }

  input,
  select,
  textarea,
  button {
    border: 1px solid color-mix(in srgb, CanvasText 45%, Canvas);
    border-radius: 6px;
    padding: 0.55rem 0.7rem;
    color: CanvasText;
    background: Canvas;
  }

  button {
    justify-self: start;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  [data-state="glyph-list"] {
    display: grid;
    gap: 0.75rem;
  }

  [role="alert"] {
    border-left: 4px solid currentColor;
    padding-left: 0.75rem;
  }

  .glyph-row {
    display: grid;
    grid-template-rows: minmax(2rem, auto) repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
    align-items: end;
  }

  .glyph-preview {
    font-size: 1.5rem;
    line-height: 1;
  }

  .tool-copy {
    max-width: 42rem;
    line-height: 1.5;
  }
</style>
<section aria-labelledby="sigil-tool-title">
  <h1 id="sigil-tool-title">Sigil Tool</h1>
  <form>
    <p class="tool-copy">Upload a font, choose glyphs, and export compact JSON.</p>
    <label>
      Font file
      <input name="font-file" type="file" accept=".ttf,.otf,.woff,font/ttf,font/otf,font/woff">
    </label>
    <p data-state="font-file-name">No font selected</p>
    <label>
      Schema
      <select name="schema"></select>
    </label>
    <p data-state="summary" aria-live="polite">Glyphs ready: 0</p>
    <div data-state="glyph-list"></div>
    <div data-state="errors"></div>
    <button type="button" data-action="download" disabled>Download JSON</button>
  </form>
</section>`;
