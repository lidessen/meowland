import { resolve } from "node:path";
import { defineConfig } from "meowbook";

/**
 * Gallery over the shared UI library: only Meowtail scenes and the Meowtail preview.
 * Product scenes and the product preview live in apps/meowland/web/workshop.
 * The repo-wide combination is a separate tool config that depends on both sides.
 */
export default defineConfig({
  root: resolve(import.meta.dir, "../.."),
  stories: ["packages/meowtail/stories/*.stories.tsx"],
  preview: "packages/meowtail/stories/preview.ts",
  tsconfig: "packages/meowtail/tsconfig.json",
});
