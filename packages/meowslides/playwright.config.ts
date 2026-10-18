import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser/components",
  outputDir: "./test-results",
  fullyParallel: true,
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    baseURL: "http://127.0.0.1:13027",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "bun ../meowbook/src/cli.ts serve --config tests/fixtures/meowbook.config.ts --port 13027 --json",
    cwd: import.meta.dir,
    url: "http://127.0.0.1:13027/manifest.json",
    reuseExistingServer: false,
  },
});
