import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "tool-call.spec.ts",
  outputDir: "../../../test-results/tool-call",
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    baseURL: "http://127.0.0.1:13071",
    screenshot: "only-on-failure",
  },
  webServer: {
    command:
      "bun packages/meowbook/src/cli.ts serve --config packages/meowtail/tests/fixtures/tool-call.meowbook.config.ts --port 13071 --json",
    cwd: "../../../../..",
    url: "http://127.0.0.1:13071/manifest.json",
    reuseExistingServer: false,
  },
});
