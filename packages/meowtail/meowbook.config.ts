import { resolve } from "node:path";
import { defineConfig } from "meowbook";

export default defineConfig({
  root: resolve(import.meta.dir, "../.."),
  // Review boards are gallery and test scenes; the documentation site leaves them out.
  stories: [
    "packages/meowtail/stories/*.stories.tsx",
    "packages/meowtail/stories/review/*.stories.tsx",
  ],
  preview: "packages/meowtail/stories/preview.ts",
  tsconfig: "packages/meowtail/tsconfig.json",
});
