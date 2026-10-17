import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    baseURL: "http://127.0.0.1:13019",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "bun packages/meowtail/tests/browser/presentation/server.ts",
    cwd: new URL("../../../../..", import.meta.url).pathname,
    url: "http://127.0.0.1:13019/",
    reuseExistingServer: false,
  },
});
