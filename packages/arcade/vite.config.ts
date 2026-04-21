import { defineConfig } from "vite";
import istanbulPlugin from "vite-plugin-istanbul";
import { version } from "./package.json";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    istanbulPlugin({
      exclude: ["node_modules"],
      extension: [".ts"],
      include: "../game/lib/**/*",
    }),
  ],
  server: {
    fs: {
      allow: ["../.."],
    },
  },
  optimizeDeps: {
    exclude: ["@bruff/game", "@bruff/utils"],
  },
});
