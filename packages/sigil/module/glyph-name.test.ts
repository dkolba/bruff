/* eslint-disable unicorn/text-encoding-identifier-case -- Tests assert @bruff/glyph catalog group names such as ASCII. */
import { describe, expect, it } from "vitest";

import type { SigilSourceGlyph } from "./glyph-json.js";
import { createSigilGlyphMap, isValidGlyphName } from "./glyph-name.js";

const ORIGIN = 0;
const GLYPH_ADVANCE_WIDTH = 600;
const HEART_ADVANCE_WIDTH = 500;
const UNITS_PER_EM = 1000;
const ENEMY_UNICODE = "e";
const PLAYER_UNICODE = "@";
const FLOOR_UNICODE = ".";
const WALL_UNICODE = "#";
const DOOR_UNICODE = "+";

const createSourceGlyph = (
  unicode: string,
  path: string,
): SigilSourceGlyph => ({
  advanceWidth: GLYPH_ADVANCE_WIDTH,
  bounds: {
    x1: ORIGIN,
    x2: GLYPH_ADVANCE_WIDTH,
    y1: ORIGIN,
    y2: UNITS_PER_EM,
  },
  path,
  unicode,
  unitsPerEm: UNITS_PER_EM,
});

const starGlyph = createSourceGlyph("★", "M0 0L600 0Z");
const floorGlyph = createSourceGlyph(FLOOR_UNICODE, "M0 0L1 0Z");
const wallGlyph = createSourceGlyph(WALL_UNICODE, "M0 0L2 0Z");
const doorGlyph = createSourceGlyph(DOOR_UNICODE, "M0 0L3 0Z");
const playerGlyph = createSourceGlyph(PLAYER_UNICODE, "M0 0L4 0Z");
const enemyGlyph = createSourceGlyph(ENEMY_UNICODE, "M0 0L5 0Z");
const heartGlyph = {
  ...createSourceGlyph("♥", "M0 0L500 0Z"),
  advanceWidth: HEART_ADVANCE_WIDTH,
  bounds: {
    x1: ORIGIN,
    x2: HEART_ADVANCE_WIDTH,
    y1: ORIGIN,
    y2: UNITS_PER_EM,
  },
};

const glyphDrafts = [
  { defaultName: "floor", glyph: floorGlyph },
  { defaultName: "wall", glyph: wallGlyph },
  { defaultName: "door", glyph: doorGlyph },
  { defaultName: "player", glyph: playerGlyph },
  { defaultName: "enemy", glyph: enemyGlyph },
  { defaultName: "u2605", glyph: starGlyph },
  { defaultName: "u2665", glyph: heartGlyph },
];

const starMapping = {
  glyph: "*",
  glyphKey: "ASTERISK",
  groupName: "ASCII",
};

const heartMapping = {
  glyph: "♥",
  glyphKey: "HEART",
  groupName: "MISC_SYMBOLS",
};

const floorMapping = {
  glyph: FLOOR_UNICODE,
  glyphKey: "FULL_STOP",
  groupName: "ASCII",
};

const wallMapping = {
  glyph: WALL_UNICODE,
  glyphKey: "NUMBER_SIGN",
  groupName: "ASCII",
};

const doorMapping = {
  glyph: DOOR_UNICODE,
  glyphKey: "PLUS_SIGN",
  groupName: "ASCII",
};

const playerMapping = {
  glyph: PLAYER_UNICODE,
  glyphKey: "AT",
  groupName: "ASCII",
};

const enemyMapping = {
  glyph: ENEMY_UNICODE,
  glyphKey: "LATIN_SMALL_LETTER_E",
  groupName: "ASCII",
};

const mappedGlyphsByUnicode = {
  [DOOR_UNICODE]: doorMapping,
  [ENEMY_UNICODE]: enemyMapping,
  [FLOOR_UNICODE]: floorMapping,
  [PLAYER_UNICODE]: playerMapping,
  [WALL_UNICODE]: wallMapping,
  "★": starMapping,
  "♥": heartMapping,
};

const licensesByUnicode = {
  [DOOR_UNICODE]: "MIT",
  [ENEMY_UNICODE]: "MIT",
  [FLOOR_UNICODE]: "MIT",
  [PLAYER_UNICODE]: "MIT",
  [WALL_UNICODE]: "MIT",
  "★": "MIT",
  "♥": "OFL-1.1",
};

describe("isValidGlyphName", () => {
  it("accepts ASCII names", () => {
    expect(isValidGlyphName("star")).toBe(true);
  });

  it("accepts emoji names", () => {
    expect(isValidGlyphName("⭐")).toBe(true);
  });

  it("accepts symbol names", () => {
    expect(isValidGlyphName("★")).toBe(true);
  });

  it("accepts mixed Unicode names", () => {
    expect(isValidGlyphName("star★")).toBe(true);
  });

  it("rejects empty names", () => {
    expect(isValidGlyphName("")).toBe(false);
  });

  it("rejects control characters", () => {
    expect(isValidGlyphName("star\n")).toBe(false);
  });
});

describe("createSigilGlyphMap success", () => {
  it("creates a glyph map with edited and default names", () => {
    const glyphMapResult = createSigilGlyphMap(
      glyphDrafts,
      {
        "★": "star",
      },
      { licensesByUnicode, mappedGlyphsByUnicode },
    );

    expect(glyphMapResult.type).toBe("ok");
    if (glyphMapResult.type === "error") {
      return;
    }
    expect(Object.keys(glyphMapResult.value).toSorted().join(",")).toBe(
      "door,enemy,floor,player,star,u2665,wall",
    );
    expect(glyphMapResult.value).toMatchObject({
      star: { name: "star" },
      u2665: { name: "u2665" },
    });
  });

  it("adds mapped glyph and exact LICENSE fields", () => {
    const glyphMapResult = createSigilGlyphMap(
      glyphDrafts,
      {},
      { licensesByUnicode, mappedGlyphsByUnicode },
    );

    expect(glyphMapResult.type).toBe("ok");
    if (glyphMapResult.type === "error") {
      return;
    }
    expect(glyphMapResult.value["u2605"]).toMatchObject({
      LICENSE: "MIT",
      mappedGlyph: starMapping,
      unicode: "★",
    });
  });
});

describe("createSigilGlyphMap contract validation", () => {
  it("returns an invalid glyph JSON error when the produced map fails the shared contract", () => {
    const invalidGlyphMapResult = createSigilGlyphMap(
      [
        {
          defaultName: "u2605",
          glyph: {
            ...starGlyph,
            unitsPerEm: Number.POSITIVE_INFINITY,
          },
        },
      ],
      {},
      {
        licensesByUnicode: {
          "★": "MIT",
        },
        mappedGlyphsByUnicode: {
          "★": starMapping,
        },
      },
    );

    expect(invalidGlyphMapResult).toMatchObject({ type: "error" });
    if (invalidGlyphMapResult.type === "ok") {
      return;
    }
    expect(invalidGlyphMapResult.error).toEqual(
      expect.arrayContaining([
        {
          message:
            "Produced glyph JSON does not match the shared contract at u2605.unitsPerEm: Invalid input: expected number, received number",
          type: "invalid-glyph-json",
        },
      ]),
    );
  });
});

describe("createSigilGlyphMap required glyph validation", () => {
  it("stores edited names inside required glyph entries", () => {
    const glyphMapResult = createSigilGlyphMap(
      glyphDrafts,
      {
        [WALL_UNICODE]: "custom-wall",
      },
      {
        licensesByUnicode,
        mappedGlyphsByUnicode,
        requiredNamesByUnicode: {
          [WALL_UNICODE]: "wall",
        },
      },
    );

    expect(glyphMapResult.type).toBe("ok");
    if (glyphMapResult.type === "error") {
      return;
    }
    expect(glyphMapResult.value.wall).toMatchObject({
      mappedGlyph: wallMapping,
      name: "custom-wall",
      unicode: WALL_UNICODE,
    });
    expect(glyphMapResult.value["custom-wall"]).toBeUndefined();
  });
});

describe("createSigilGlyphMap errors", () => {
  it("rejects duplicate glyph names", () => {
    const glyphMapResult = createSigilGlyphMap(
      glyphDrafts,
      {
        "★": "icon",
        "♥": "icon",
      },
      { licensesByUnicode, mappedGlyphsByUnicode },
    );

    expect(glyphMapResult).toStrictEqual({
      error: [
        {
          message: 'Duplicate glyph name "icon".',
          type: "duplicate-glyph-name",
        },
      ],
      type: "error",
    });
  });

  it("rejects invalid glyph names", () => {
    const glyphMapResult = createSigilGlyphMap(
      glyphDrafts,
      {
        "★": "",
      },
      { licensesByUnicode, mappedGlyphsByUnicode },
    );

    expect(glyphMapResult).toStrictEqual({
      error: [
        {
          message: 'Invalid glyph name "".',
          type: "invalid-glyph-name",
        },
      ],
      type: "error",
    });
  });
});
