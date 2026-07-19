import { error, ok, type Result } from "@bruff/utils";
import { type core, z } from "zod";

const BROUGHLIKE_MAP_VERSION = 1;
const MIN_BROUGHLIKE_MAP_SIZE = 1;
const MAX_BROUGHLIKE_MAP_SIZE = 9;

/**
Runtime schema for terrain values in a compact broughlike map.
*/
export const broughlikeTerrainSchema = z.enum(["floor", "wall", "door"]);

/**
Readonly TypeScript type inferred from {@link broughlikeTerrainSchema}.
*/
export type BroughlikeTerrain = z.infer<typeof broughlikeTerrainSchema>;

/**
Runtime schema for compact broughlike map JSON.
*/
export const broughlikeMapSchema = z
  .object({
    height: z
      .number()
      .int()
      .min(MIN_BROUGHLIKE_MAP_SIZE)
      .max(MAX_BROUGHLIKE_MAP_SIZE),
    rows: z.array(z.array(broughlikeTerrainSchema)),
    version: z.literal(BROUGHLIKE_MAP_VERSION),
    width: z
      .number()
      .int()
      .min(MIN_BROUGHLIKE_MAP_SIZE)
      .max(MAX_BROUGHLIKE_MAP_SIZE),
  })
  .superRefine((mapJson, context) => {
    if (mapJson.rows.length !== mapJson.height) {
      context.addIssue({
        code: "custom",
        message: "Map row count must match height.",
        path: ["rows"],
      });
    }

    if (mapJson.rows.some((row) => row.length !== mapJson.width)) {
      context.addIssue({
        code: "custom",
        message: "Every map row must match width.",
        path: ["rows"],
      });
    }
  });

/**
Readonly TypeScript type inferred from {@link broughlikeMapSchema}.
*/
export type BroughlikeMap = Readonly<z.infer<typeof broughlikeMapSchema>>;

/**
Structured parse failure for {@link parseBroughlikeMap}.
*/
export type ParseBroughlikeMapError = Readonly<{
  reason: "INVALID_BROUGHLIKE_MAP";
  issues: ReadonlyArray<core.$ZodIssue>;
}>;

/**
Parses an unknown input into compact broughlike map JSON.

@param input - Unknown candidate value
@returns A typed result containing a broughlike map or parse failure
*/
export const parseBroughlikeMap = (
  input: unknown,
): Result<BroughlikeMap, ParseBroughlikeMapError> => {
  const parsedMap = broughlikeMapSchema.safeParse(input);

  return parsedMap.success
    ? ok(parsedMap.data)
    : error({
        issues: parsedMap.error.issues,
        reason: "INVALID_BROUGHLIKE_MAP",
      });
};
