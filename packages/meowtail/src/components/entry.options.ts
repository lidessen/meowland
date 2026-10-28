import { defineOptions } from "meowcss";

/** default: one entry in a run. feature: the lead entry, with a larger title and standfirst. */
export const entryOptions = defineOptions("entry", { size: ["default", "feature"] });
