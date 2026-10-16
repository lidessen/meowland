import { resolve } from "node:path";
import { defineConfig } from "meowbook";

export default defineConfig({
  root: resolve(import.meta.dir, "../../../.."),
  stories: [
    "packages/meowui/stories/*.stories.tsx",
    "packages/meowui/tests/fixtures/*.stories.tsx",
  ],
  preview: "packages/meowui/stories/preview.ts",
  tsconfig: "packages/meowui/tsconfig.json",
});
