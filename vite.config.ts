import { defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
  },
  build: {
    sourcemap: true,
  },
  test: {
    environment: "node",
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
