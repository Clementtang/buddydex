import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure node environment. Tests that touch browser globals stub
    // only what they need on globalThis (see tests/unit/i18n.test.js).
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
});
