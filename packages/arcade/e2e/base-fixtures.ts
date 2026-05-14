// @ts-nocheck
import { test as baseTest, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

declare global {
  interface Window {
    __coverage__?: unknown;
    collectIstanbulCoverage: (coverageJSON: string) => void;
  }
}

const istanbulCLIOutput = path.join(process.cwd(), ".nyc_output");

export function generateUUID(): string {
  return crypto.randomBytes(16).toString("hex");
}

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() =>
      globalThis.addEventListener("beforeunload", () =>
        globalThis.collectIstanbulCoverage(
          JSON.stringify(globalThis.__coverage__),
        ),
      ),
    );
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true });
    await context.exposeFunction(
      "collectIstanbulCoverage",
      (coverageJSON: string) => {
        if (coverageJSON)
          fs.writeFileSync(
            path.join(
              istanbulCLIOutput,
              `playwright_coverage_${generateUUID()}.json`,
            ),
            coverageJSON,
          );
      },
    );
    await use(context);
    for (const page of context.pages()) {
      await page.evaluate(() =>
        globalThis.collectIstanbulCoverage(
          JSON.stringify(globalThis.__coverage__),
        ),
      );
    }
  },
});

export async function gotoTestMode(page: Page): Promise<void> {
  await page.goto("/?test=1");
  await page.waitForFunction(() => window.__bruffTestApi !== undefined);
}

export const expect = test.expect;
