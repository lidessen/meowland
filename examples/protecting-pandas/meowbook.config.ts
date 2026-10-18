import { defineConfig } from "meowbook";
export default defineConfig({
  root: import.meta.dir,
  stories: ["lesson.stories.tsx"],
  preview: "preview.ts",
  tsconfig: "tsconfig.json",
});
