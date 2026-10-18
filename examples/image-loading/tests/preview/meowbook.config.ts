import { resolve } from "node:path";
import { defineConfig } from "meowbook";
export default defineConfig({
  root: resolve(import.meta.dir, "../.."),
  stories: ["tests/preview/deck.stories.tsx"],
  preview: "tests/preview/preview.ts",
  tsconfig: "tsconfig.json",
});
