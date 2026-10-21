import { resolve } from "node:path";
import { defineConfig } from "meowbook";

/**
 * The presentation gallery behind the documentation site. It has its own
 * environment because a presentation needs the presentation theme and runtime.
 */
export default defineConfig({
  root: resolve(import.meta.dir, "../.."),
  stories: ["packages/meowslides/stories/*.stories.tsx"],
  preview: "apps/docs/slides.preview.ts",
  tsconfig: "packages/meowslides/tsconfig.json",
});
