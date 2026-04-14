import { describe, expect, it } from "vitest";
import { hsla } from "./hsla.js";

const testRed = () =>
  expect(
    hsla({
      alpha: 1,
      hue: 0,
      lightness: 0.5,
      saturation: 1,
    }),
  ).toBe("hsla(0, 100%, 50%, 1)");

const testCyan = () =>
  expect(
    hsla({
      alpha: 0.5,
      hue: 0.5,
      lightness: 0.3,
      saturation: 0.8,
    }),
  ).toBe("hsla(180, 80%, 30%, 0.5)");

describe("hsla", () => {
  describe("standard colors", () => {
    it("should generate correct hsla string for red", testRed);
    it("should generate correct hsla string for cyan", testCyan);
  });

  describe("edge cases", () => {
    it("should handle minimum values", () => {
      expect(
        hsla({
          alpha: 0,
          hue: 0,
          lightness: 0,
          saturation: 0,
        }),
      ).toBe("hsla(0, 0%, 0%, 0)");
    });

    it("should handle maximum values", () => {
      expect(
        hsla({
          alpha: 1,
          hue: 1,
          lightness: 1,
          saturation: 1,
        }),
      ).toBe("hsla(360, 100%, 100%, 1)");
    });

    it("should handle fractional values", () => {
      expect(
        hsla({
          alpha: 0.75,
          hue: 0.333,
          lightness: 0.25,
          saturation: 0.5,
        }),
      ).toBe("hsla(120, 50%, 25%, 0.75)");
    });
  });
});
