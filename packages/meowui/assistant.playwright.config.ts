import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser/chat",
  testMatch: "assistant.spec.ts",
  outputDir: "/tmp/meowland-assistant-browser-results",
  use: { baseURL: "http://127.0.0.1:13160", viewport: { width: 1280, height: 840 } },
  webServer: {
    command:
      "bun ../meowbook/src/cli.ts serve --config tests/fixtures/assistant.meowbook.config.ts --port 13160 --capture",
    url: "http://127.0.0.1:13160/manifest.json",
    reuseExistingServer: false,
  },
});
