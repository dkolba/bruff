import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import istanbulPlugin from "vite-plugin-istanbul";
import { version } from "./package.json";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagesCwd = resolve(__dirname, "..");

export default defineConfig({
  build: {
    rollupOptions: {
      output: { sourcemapExcludeSources: true },
    },
    sourcemap: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BRUFF_TEST_MODE__: JSON.stringify(process.env.VITE_TEST_MODE === "1"),
  },
  plugins: [
    istanbulPlugin({
      cwd: packagesCwd,
      extension: [".ts"],
      include: ["game/lib/**/*", "arcade/app.ts"],
      requireEnv: true,
    }),
    {
      name: "print-extra-urls",
      configureServer(server) {
        server.httpServer?.once("listening", () => {
          const address = server.httpServer?.address();

          if (typeof address === "object" && address) {
            const baseUrl = `http://localhost:${address.port}`;
            console.log("\nAdditional routes:");
            console.log(`  Tool Glyph-Editor: ${baseUrl}/tools`);
            console.log(`  Tool Map-Editor:   ${baseUrl}/tools-map`);
          }
        });
      },
    },
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    fs: {
      allow: ["../.."],
    },
  },
  optimizeDeps: {
    exclude: ["@bruff/game", "@bruff/utils", "@bruff/utils/dom"],
  },
});
