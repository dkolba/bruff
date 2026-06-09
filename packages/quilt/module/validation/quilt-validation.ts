import { error, ok, type Result } from "@bruff/utils";

const MIN_MAP_SIZE = 1;

/** Candidate Quilt map size. */
export type QuiltMapSize = Readonly<{
  width: number;
  height: number;
}>;

/** Quilt map size validation error. */
export type QuiltMapSizeValidationError = Readonly<{
  reason: "INVALID_MAP_SIZE";
}>;

/** Validates map dimensions outside the Web Component class. */
export const validateQuiltMapSize = (
  mapSize: QuiltMapSize,
): Result<QuiltMapSize, QuiltMapSizeValidationError> =>
  mapSize.width >= MIN_MAP_SIZE && mapSize.height >= MIN_MAP_SIZE
    ? ok(mapSize)
    : error({ reason: "INVALID_MAP_SIZE" });
