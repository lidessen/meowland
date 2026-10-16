import { resolve } from "node:path";
import { defineConfig } from "meowbook";

/**
 * Gallery over the shared UI library: only MeowUI scenes and the MeowUI preview.
 * Product scenes and the product preview live in apps/meowland/web/workshop.
 * The repo-wide combination is a separate tool config that depends on both sides.
 */
export default defineConfig({
  root: resolve(import.meta.dir, "../.."),
  stories: ["packages/meowui/stories/*.stories.tsx"],
  preview: "packages/meowui/stories/preview.ts",
  tsconfig: "packages/meowui/tsconfig.json",
});
