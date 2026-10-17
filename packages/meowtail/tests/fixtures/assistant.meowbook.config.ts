import { resolve } from "node:path";
import { defineConfig } from "meowbook";

export default defineConfig({
  root: resolve(import.meta.dir, "../../../.."),
  stories: ["packages/meowtail/stories/assistant.stories.tsx"],
  preview: "packages/meowtail/stories/preview.ts",
  tsconfig: "packages/meowtail/tsconfig.json",
});
