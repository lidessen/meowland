import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    baseURL: "http://127.0.0.1:13006",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "bun ../../packages/meowbook/src/cli.ts serve --config meowbook.config.ts --port 13006 --json",
    url: "http://127.0.0.1:13006/manifest.json",
    reuseExistingServer: false,
  },
});
