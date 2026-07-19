/**
 * Static shadow DOM template for the sigil tool shell.
 */
export const TOOL_SIGIL_TEMPLATE = `<style>
  :host {
    box-sizing: border-box;
    display: block;
    min-height: 100%;
    padding: var(--space-6, 2rem);
    color: var(--text-1, CanvasText);
    background: var(--surface-1, Canvas);
    font-family: system-ui, sans-serif;
    height: 100%;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  section {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: inherit;
    margin: 0 auto;
    overflow-y: auto;
    width: 100%;
  }

  h1 {
    margin: 0 0 var(--space-3, 0.75rem);
    font-size: var(--font-size-4, 2rem);
    line-height: var(--font-lineheight-tight, 1.1);
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
    gap: var(--space-4, 1rem);
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
    border: 1px solid var(--border-color, color-mix(in oklch, CanvasText 45%, Canvas));
    border-radius: var(--radius-2, 6px);
    color: var(--text-1, CanvasText);
    background: var(--surface-1, Canvas);
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
    gap: var(--space-3, 0.75rem);
  }

  [role="alert"] {
    border-inline-start: var(--space-1, 0.25rem) solid currentColor;
    padding-inline-start: var(--space-3, 0.75rem);
  }

  .glyph-row {
    display: grid;
    grid-template-rows: minmax(2rem, auto) repeat(4, minmax(0, 1fr));
    gap: var(--space-3, 0.75rem);
    align-items: end;
  }

  .glyph-preview {
    font-size: var(--font-size-3, 1.5rem);
    line-height: var(--font-lineheight-1, 1);
  }
  .tool-copy {
    line-height: var(--font-lineheight-base, 1.5);
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
    <label>
      Characters
      <textarea name="characters" rows="2"></textarea>
    </label>
    <div data-state="required-glyph-selections"></div>
    <p data-state="summary" aria-live="polite">Glyphs ready: 0</p>
    <div data-state="glyph-list"></div>
    <div data-state="errors"></div>
    <button type="button" data-action="download" disabled>Download JSON</button>
  </form>
</section>`;
