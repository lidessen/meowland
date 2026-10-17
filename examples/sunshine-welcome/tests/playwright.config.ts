import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  outputDir: "./test-results",
  workers: 1,
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    baseURL: "http://127.0.0.1:13032",
    serviceWorkers: "block",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "PORT=13032 bun examples/sunshine-welcome/serve.ts",
    cwd: new URL("../../..", import.meta.url).pathname,
    url: "http://127.0.0.1:13032/",
    reuseExistingServer: false,
  },
});
