/* eslint-disable unicorn/prevent-abbreviations */
import { defineConfig } from "vite";
import istanbulPlugin from "vite-plugin-istanbul";
import { version } from "./package.json";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BRUFF_TEST_MODE__: JSON.stringify(false),
  },
  build: {
    lib: {
      entry: "./lib/effects/entry.ts",
      fileName: "bruff-game",
      formats: ["es"],
      name: "bruff",
    },
    minify: false,
    sourcemap: true,
  },
  plugins: [
    istanbulPlugin({
      exclude: ["node_modules"],
      extension: [".ts"],
      include: "lib/*",
    }),
  ],
});
