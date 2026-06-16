import { createTileMapData, type TileMapData } from "./model/tile-map-data.ts";
import { QuiltElement } from "./quilt-element.ts";

const QUILT_ELEMENT_NAME = "tool-quilt";
const DEFAULT_MAP_SIZE = 4;

/** Sets map data on a mounted Quilt element. */
export const setQuiltMapData = (
  quiltElement: QuiltElement,
  tileMapData: TileMapData,
): void => {
  quiltElement.runtime?.setMapData(tileMapData);
};

/** Gets map data from a mounted Quilt element. */
export const getQuiltMapData = (quiltElement: QuiltElement): TileMapData =>
  quiltElement.runtime?.getState().tileMapData ??
  createTileMapData({ height: DEFAULT_MAP_SIZE, width: DEFAULT_MAP_SIZE });

/** Registers the Quilt custom element if it is not already defined. */
export const registerQuiltElement = (): void => {
  if (customElements.get(QUILT_ELEMENT_NAME) === undefined) {
    customElements.define(QUILT_ELEMENT_NAME, QuiltElement);
  }
};
