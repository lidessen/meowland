import { defineConfig, devices } from "@playwright/test";

// Fixture specs only: Dashboard, MeowUI and catalog specs run from their owners' configs.
export default defineConfig({
  testDir: "./tests/browser",
  testIgnore: ["capture.spec.ts", "guides.spec.ts", "focus.spec.ts"],
  outputDir: "./test-results",
  fullyParallel: true,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:13005",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "bun src/cli.ts serve --config tests/fixtures/story.config.ts --port 13005 --json",
    url: "http://127.0.0.1:13005/manifest.json",
    reuseExistingServer: false,
  },
});
