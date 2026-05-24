import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const siteDirectory = fileURLToPath(new URL("../site", import.meta.url));
const forbiddenNeedles = [
  "__bruffTestApi",
  "tool-sigil",
  "@bruff/sigil",
  "opentype",
  "dev-tools-router",
];

const listFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const entryPath = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    }),
  );
  return nestedFiles.flat();
};

const files = await listFiles(siteDirectory);
const contaminations = (
  await Promise.all(
    files.map(async (filePath) => {
      const contents = await readFile(filePath, "utf8");
      return forbiddenNeedles
        .filter((forbiddenNeedle) => contents.includes(forbiddenNeedle))
        .map((forbiddenNeedle) => ({ filePath, forbiddenNeedle }));
    }),
  )
).flat();

if (contaminations.length > 0) {
  process.stderr.write(
    [
      "Production bundle contains forbidden development strings:",
      ...contaminations.map(
        ({ filePath, forbiddenNeedle }) =>
          `- ${forbiddenNeedle} in ${filePath}`,
      ),
      "",
    ].join("\n"),
  );
  process.exitCode = 1;
}
