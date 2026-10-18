import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser/chat",
  testMatch: "assistant-agent.spec.ts",
  outputDir: "/tmp/meowland-assistant-agent-browser-results",
  use: { baseURL: "http://127.0.0.1:13073", viewport: { width: 1280, height: 840 } },
  webServer: {
    command:
      "bun ../meowbook/src/cli.ts serve --config tests/fixtures/assistant-agent.meowbook.config.ts --port 13073 --capture",
    url: "http://127.0.0.1:13073/manifest.json",
    reuseExistingServer: false,
  },
});
