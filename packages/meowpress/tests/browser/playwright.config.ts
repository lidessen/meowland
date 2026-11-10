import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

export default defineConfig({
  testDir: ".",
  outputDir: "../../test-results",
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: "http://127.0.0.1:13016",
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [1440, 375].flatMap((width) =>
    (["light", "dark"] as const).map((colorScheme) => ({
      name: `${width}-${colorScheme}`,
      use: { viewport: { width, height: 1000 }, colorScheme },
    })),
  ),
  webServer: {
    command: "bun tests/fixtures/server.ts",
    cwd: resolve(import.meta.dir, "../.."),
    url: "http://127.0.0.1:13016",
    reuseExistingServer: false,
  },
});
