import { finished } from "node:stream/promises";
import { run } from "node:test";
import { spec } from "node:test/reporters";

const stream = run({
  branchCoverage: 100,
  coverage: true,
  coverageExcludeGlobs: [
    "../glyph/**/*.ts",
    "../game/**/*.ts",
    "../utils/**/*.ts",
    "**/*-test-helpers.ts",
    "**/*.test.ts",
  ],
  execArgv: [
    "--conditions=bruff-source",
    "--experimental-strip-types",
    "--experimental-transform-types",
  ],
  functionCoverage: 100,
  globPatterns: ["**/*.test.ts"],
  isolation: "process",
  lineCoverage: 100,
});

stream.compose(spec).pipe(process.stdout);

await finished(stream);
