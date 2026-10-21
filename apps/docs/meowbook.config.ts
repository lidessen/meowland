import { resolve } from "node:path";
import { defineConfig } from "meowbook";

/**
 * The component gallery behind the documentation site.
 * The stories and their environment are the ones the library owns; this app only
 * points at them and never copies a scenario.
 */
export default defineConfig({
  root: resolve(import.meta.dir, "../.."),
  stories: ["packages/meowtail/stories/*.stories.tsx"],
  preview: "packages/meowtail/stories/preview.ts",
  tsconfig: "packages/meowtail/tsconfig.json",
});
