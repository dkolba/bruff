import {
  findSigilSchemaOption,
  SIGIL_SCHEMA_OPTIONS,
  type SigilSchemaId,
  type SigilSchemaOption,
} from "../sigil-schema-catalog.js";

/** Finds a schema option by identifier.
@param schemaId - Schema identifier.
@returns Matching schema option when available.
*/
export const schemaOptionById = (
  schemaId: SigilSchemaId,
): SigilSchemaOption | undefined => {
  const schemaOption = findSigilSchemaOption(SIGIL_SCHEMA_OPTIONS, schemaId);

  return schemaOption.type === "some" ? schemaOption.value : undefined;
};
