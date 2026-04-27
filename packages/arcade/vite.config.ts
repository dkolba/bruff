import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import istanbulPlugin from "vite-plugin-istanbul";
import { version } from "./package.json";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagesCwd = resolve(__dirname, "..");

export default defineConfig({
  build: { sourcemap: true },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    istanbulPlugin({
      cwd: packagesCwd,
      extension: [".ts"],
      include: ["game/lib/**/*", "arcade/app.ts"],
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
