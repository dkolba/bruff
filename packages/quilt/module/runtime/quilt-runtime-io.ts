import type { createQuiltController } from "../controller/quilt-controller.ts";
import { parseQuiltTerrainGlyphs } from "../storage/sigil-glyph-map.ts";
import { serializeBroughlikeMapData } from "../storage/broughlike-map.ts";

const EMPTY_INPUT_FILES = 0;

type ToolbarController = ReturnType<typeof createQuiltController>;

export const handleExportClick = (controller: ToolbarController): void => {
  const serializedMap = serializeBroughlikeMapData(
    controller.getState().tileMapData,
  );
  const json = JSON.stringify(serializedMap);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "map.json";
  anchor.click();
  URL.revokeObjectURL(url);
};

export const handleImportFileChange = (
  importInput: HTMLInputElement,
  controller: ToolbarController,
): void => {
  const file = importInput.files?.[EMPTY_INPUT_FILES];
  if (file === undefined) {
    return;
  }
  file
    .text()
    .then((fileText) => {
      const parsedGlyphs: ReturnType<typeof parseQuiltTerrainGlyphs> | null =
        ((): ReturnType<typeof parseQuiltTerrainGlyphs> | null => {
          try {
            return parseQuiltTerrainGlyphs(JSON.parse(fileText));
          } catch {
            return null;
          }
        })();
      if (parsedGlyphs === null) {
        controller.setState({
          ...controller.getState(),
          visibleErrors: [{ message: "Failed to parse glyph JSON file." }],
        });
        return;
      }
      if (parsedGlyphs.type === "error") {
        controller.setState({
          ...controller.getState(),
          visibleErrors: [
            { message: "Invalid glyph JSON: not a valid Sigil glyph map." },
          ],
        });
        return;
      }
      controller.setState({
        ...controller.getState(),
        terrainGlyphs: parsedGlyphs.value,
        visibleErrors: [],
      });
    })
    .catch(() => {
      controller.setState({
        ...controller.getState(),
        visibleErrors: [{ message: "Failed to read glyph JSON file." }],
      });
    });
};
