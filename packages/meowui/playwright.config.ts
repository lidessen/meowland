import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "./test-results",
  fullyParallel: true,
  use: {
    ...devices["Desktop Chrome"],
    // Bundled Chromium by default; a host with Chrome may point the suite at it.
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    baseURL: "http://127.0.0.1:13007",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "bun ../meowbook/src/cli.ts serve --config tests/fixtures/meowbook.config.ts --port 13007 --json",
    url: "http://127.0.0.1:13007/manifest.json",
    reuseExistingServer: false,
  },
});
