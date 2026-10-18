import { resolve } from "node:path";
import { defineConfig } from "../../src";
export default defineConfig({
  root: resolve(import.meta.dir, "../../../.."),
  stories: ["packages/meowbook/tests/fixtures/*.tsx"],
  preview: "packages/meowbook/tests/fixtures/preview.ts",
  tsconfig: "packages/meowbook/tsconfig.json",
});
