import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: ["capture.spec.ts", "guides.spec.ts", "focus.spec.ts"],
  outputDir: "./test-results/capture",
  fullyParallel: true,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:13006",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "bun src/cli.ts serve --capture --config tests/fixtures/story.config.ts --port 13006 --json",
    url: "http://127.0.0.1:13006/manifest.json",
    reuseExistingServer: false,
  },
});
