import { resolve } from "node:path";
import { defineConfig } from "meowbook";

export default defineConfig({
  root: resolve(import.meta.dir, "../../../.."),
  stories: [
    "packages/meowslides/stories/*.stories.tsx",
    "packages/meowslides/tests/fixtures/*.stories.tsx",
  ],
  preview: "packages/meowslides/tests/fixtures/preview.ts",
  tsconfig: "packages/meowslides/tsconfig.json",
});
