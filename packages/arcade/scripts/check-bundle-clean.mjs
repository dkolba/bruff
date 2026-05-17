import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const siteDirectory = fileURLToPath(new URL("../site", import.meta.url));
const forbiddenNeedle = "__bruffTestApi";

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
const contaminatedFiles = (
  await Promise.all(
    files.map(async (filePath) => {
      const contents = await readFile(filePath, "utf8");
      return contents.includes(forbiddenNeedle) ? filePath : undefined;
    }),
  )
).filter((filePath) => filePath !== undefined);

if (contaminatedFiles.length > 0) {
  process.stderr.write(
    `Production bundle contains ${forbiddenNeedle} in ${contaminatedFiles.join(", ")}\n`,
  );
  process.exitCode = 1;
}
