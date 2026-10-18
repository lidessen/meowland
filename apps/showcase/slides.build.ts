import { resolve } from "node:path";
import { buildStories } from "meowbook/bun";
import config from "./slides.meowbook.config";

await buildStories(config, resolve(import.meta.dir, "slides/dist"));
console.log("Slides gallery built at apps/showcase/slides/dist");
