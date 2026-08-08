import { defineConfig } from "vitest/config";
import { productionBundleGuard } from "./vite-production-guard";

export default defineConfig({
  plugins: [productionBundleGuard()],
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
  },
  build: {
    sourcemap: false,
  },
  test: {
    environment: "node",
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
