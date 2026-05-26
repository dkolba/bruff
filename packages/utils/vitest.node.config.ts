import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@bruff/utils": new URL("index.ts", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    include: ["module/**/*.node.test.ts"],
    isolate: true,
  },
});
