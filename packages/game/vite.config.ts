import { defineConfig } from "vite";
import istanbulPlugin from "vite-plugin-istanbul";

export default defineConfig({
  plugins: [
    istanbulPlugin({
      exclude: ["node_modules"],
      extension: [".ts"],
      include: "lib/*",
    }),
  ],
  server: {
    fs: {
      allow: ["../.."],
    },
  },
  optimizeDeps: {
    exclude: ["@bruff/utils"],
  },
});
