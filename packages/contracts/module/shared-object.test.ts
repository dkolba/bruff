import { describe, expect, it } from "vitest";
import {
  parseSharedObject,
  type ParseSharedObjectError,
  type SharedObject,
  sharedObjectSchema,
} from "@bruff/contracts";
import { type Result } from "@bruff/utils";

const VALID_SHARED_OBJECT = { kind: "contract" };
const INVALID_SHARED_OBJECT = { kind: "" };

describe("sharedObjectSchema", () => {
  it("accepts a valid shared object", () => {
    expect(sharedObjectSchema.safeParse(VALID_SHARED_OBJECT)).toStrictEqual({
      data: VALID_SHARED_OBJECT,
      success: true,
    });
  });
});

describe("parseSharedObject", () => {
  it("returns ok with a readonly inferred shared object for valid input", () => {
    const parsedSharedObject: Result<SharedObject, ParseSharedObjectError> =
      parseSharedObject(VALID_SHARED_OBJECT);

    expect(parsedSharedObject).toStrictEqual({
      type: "ok",
      value: VALID_SHARED_OBJECT,
    });
  });

  it("returns an explicit error value for invalid input", () => {
    expect(parseSharedObject(INVALID_SHARED_OBJECT)).toStrictEqual({
      error: {
        issues: [
          expect.objectContaining({
            path: ["kind"],
          }),
        ],
        reason: "INVALID_SHARED_OBJECT",
      },
      type: "error",
    });
  });

  it("accepts unknown input without throwing", () => {
    const unknownInput: unknown = undefined;

    expect(() => parseSharedObject(unknownInput)).not.toThrow();
    expect(parseSharedObject(unknownInput)).toStrictEqual({
      error: {
        issues: [
          expect.objectContaining({
            path: [],
          }),
        ],
        reason: "INVALID_SHARED_OBJECT",
      },
      type: "error",
    });
  });
});
