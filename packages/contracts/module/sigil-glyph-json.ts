import { type core, z } from "zod";
import { error, ok, type Result } from "@bruff/utils";

const MIN_TEXT_LENGTH = 1;

/**
 * Runtime schema for extracted glyph bounds in font units.
 */
export const sigilGlyphBoundsSchema = z.object({
  x1: z.number().finite(),
  x2: z.number().finite(),
  y1: z.number().finite(),
  y2: z.number().finite(),
});

/**
 * Readonly TypeScript type inferred from {@link sigilGlyphBoundsSchema}.
 */
export type SigilGlyphBounds = Readonly<z.infer<typeof sigilGlyphBoundsSchema>>;

/**
 * Runtime schema for source-font glyph data.
 */
export const sigilSourceGlyphSchema = z.object({
  advanceWidth: z.number().finite(),
  bounds: sigilGlyphBoundsSchema,
  path: z.string().min(MIN_TEXT_LENGTH),
  unicode: z.string().min(MIN_TEXT_LENGTH),
  unitsPerEm: z.number().finite(),
});

/**
 * Readonly TypeScript type inferred from {@link sigilSourceGlyphSchema}.
 */
export type SigilSourceGlyph = Readonly<z.infer<typeof sigilSourceGlyphSchema>>;

/**
 * Runtime schema for a selected `@bruff/glyph` mapping.
 */
export const sigilGlyphMappingSchema = z.object({
  glyph: z.string().min(MIN_TEXT_LENGTH),
  glyphKey: z.string().min(MIN_TEXT_LENGTH),
  groupName: z.string().min(MIN_TEXT_LENGTH),
});

/**
 * Readonly TypeScript type inferred from {@link sigilGlyphMappingSchema}.
 */
export type SigilGlyphMapping = Readonly<
  z.infer<typeof sigilGlyphMappingSchema>
>;

/**
 * Runtime schema for one downloadable Sigil glyph entry.
 */
export const sigilGlyphSchema = sigilSourceGlyphSchema.extend({
  LICENSE: z.string().min(MIN_TEXT_LENGTH),
  mappedGlyph: sigilGlyphMappingSchema,
});

/**
 * Readonly TypeScript type inferred from {@link sigilGlyphSchema}.
 */
export type SigilGlyph = Readonly<z.infer<typeof sigilGlyphSchema>>;

/**
 * Runtime schema for downloadable Sigil glyph JSON keyed by glyph name.
 */
export const sigilGlyphMapSchema = z.record(z.string(), sigilGlyphSchema);

/**
 * Readonly TypeScript type inferred from {@link sigilGlyphMapSchema}.
 */
export type SigilGlyphMap = Readonly<Record<string, SigilGlyph>>;

/**
 * Structured parse failure for {@link parseSigilGlyphMap}.
 */
export type ParseSigilGlyphMapError = Readonly<{
  reason: "INVALID_SIGIL_GLYPH_MAP";
  issues: ReadonlyArray<core.$ZodIssue>;
}>;

/**
 * Parses an unknown input into a Sigil glyph JSON map.
 *
 * @param input - Unknown candidate value
 * @returns A typed result containing a Sigil glyph map or parse failure
 */
export const parseSigilGlyphMap = (
  input: unknown,
): Result<SigilGlyphMap, ParseSigilGlyphMapError> => {
  const parsedGlyphMap = sigilGlyphMapSchema.safeParse(input);

  return parsedGlyphMap.success
    ? ok(parsedGlyphMap.data)
    : error({
        issues: parsedGlyphMap.error.issues,
        reason: "INVALID_SIGIL_GLYPH_MAP",
      });
};
