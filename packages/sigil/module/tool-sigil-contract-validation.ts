import { parseSigilGlyphMap } from "@bruff/contracts";

import type { ToolSigilContractIssue } from "./tool-sigil-state-types.js";

const EMPTY_PATH_LENGTH = 0;
const ROOT_PATH = "$";

const issuePath = (path: ReadonlyArray<PropertyKey>): string =>
  path.length === EMPTY_PATH_LENGTH ? ROOT_PATH : path.map(String).join(".");

/**
Validates candidate SigilGlyphMap JSON with the shared contract.

@param candidateGlyphMap - Produced JSON candidate
@returns Path-aware shared contract issues
*/
export const validateToolSigilGlyphMap = (
  candidateGlyphMap: unknown,
): ReadonlyArray<ToolSigilContractIssue> => {
  const parsedGlyphMap = parseSigilGlyphMap(candidateGlyphMap);

  return parsedGlyphMap.type === "ok"
    ? []
    : parsedGlyphMap.error.issues.map((issue) => ({
        message: issue.message,
        path: issuePath(issue.path),
      }));
};

/**
Checks whether shared contract validation returned any issue.

@param issues - Path-aware shared contract issues
@returns True when at least one issue exists
*/
export const hasToolSigilContractIssues = (
  issues: ReadonlyArray<ToolSigilContractIssue>,
): boolean => issues.length > EMPTY_PATH_LENGTH;
