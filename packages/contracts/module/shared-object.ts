import { error, ok, type Result } from "@bruff/utils";
import { z } from "zod";
import type { core } from "zod";

/**
 * Runtime schema for a minimal shared object contract.
 */
export const sharedObjectSchema = z.object({
  kind: z.string().min(1),
});

/**
 * Readonly TypeScript type inferred from {@link sharedObjectSchema}.
 */
export type SharedObject = Readonly<z.infer<typeof sharedObjectSchema>>;

/**
 * Structured parse failure for {@link parseSharedObject}.
 */
export type ParseSharedObjectError = Readonly<{
  reason: "INVALID_SHARED_OBJECT";
  issues: ReadonlyArray<core.$ZodIssue>;
}>;

/**
 * Parses an unknown input into a shared object contract.
 *
 * @param input - Unknown candidate value
 * @returns A typed result containing a shared object or parse failure
 */
export const parseSharedObject = (
  input: unknown,
): Result<SharedObject, ParseSharedObjectError> => {
  const parsedSharedObject = sharedObjectSchema.safeParse(input);

  return parsedSharedObject.success
    ? ok(parsedSharedObject.data)
    : error({
        issues: parsedSharedObject.error.issues,
        reason: "INVALID_SHARED_OBJECT",
      });
};
