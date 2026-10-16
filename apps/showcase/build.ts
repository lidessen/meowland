import { resolve } from "node:path";
import { buildStories } from "meowbook/bun";
import config from "./meowbook.config";
await buildStories(config, resolve(import.meta.dir, "dist"));
console.log("Showcase gallery built at apps/showcase/dist");
