import type { ComponentContract } from "meowjsx";

export const mdxSlideContract = {
  name: "mdx-slide",
  parts: ["root", "flow"],
} as const satisfies ComponentContract;
