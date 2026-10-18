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
    baseURL: "http://127.0.0.1:13039",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "bun packages/meowslides/dist/src/cli.js dev examples/presentation/slides.mdx --port 13039",
    cwd: new URL("../../../../..", import.meta.url).pathname,
    url: "http://127.0.0.1:13039/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
