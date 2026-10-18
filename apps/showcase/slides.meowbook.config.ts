import { resolve } from "node:path";
import { defineConfig } from "meowbook";

export default defineConfig({
  root: resolve(import.meta.dir, "../.."),
  stories: ["packages/meowslides/stories/*.stories.tsx"],
  preview: "apps/showcase/slides.preview.ts",
  tsconfig: "packages/meowslides/tsconfig.json",
});
