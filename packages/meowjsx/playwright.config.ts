import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "*.browser.ts",
  outputDir: "./test-results",
  use: { viewport: { width: 375, height: 180 } },
});
