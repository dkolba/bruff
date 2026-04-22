/* eslint-disable unicorn/prevent-abbreviations */
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import istanbulPlugin from "vite-plugin-istanbul";
import { version } from "./package.json";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    lib: {
      entry: "./lib/bruff-game.ts",
      fileName: "bruff-game",
      formats: ["es"],
      name: "bruff",
    },
    minify: false,
    sourcemap: true,
  },
  plugins: [
    dts({
      exclude: [],
      include: ["lib/**/*.ts", "types/**/*.ts"],
    }),
    istanbulPlugin({
      exclude: ["node_modules"],
      extension: [".ts"],
      include: "lib/*",
    }),
  ],
});
