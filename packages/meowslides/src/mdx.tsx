import { defineComponent, h, type Props } from "meowjsx";
import {
  PresentationAudio,
  PresentationImage,
  PresentationLayout,
  PresentationVideo,
  Reveal,
  type PresentationLayoutProps,
} from "./index";
import { mdxSlideContract } from "./mdx-contract";

interface MDXSlidePageProps extends Props {
  title: string;
  columns?: PresentationLayoutProps["columns"];
}

const MDXSlidePage = defineComponent<MDXSlidePageProps, "mdx-slide", "root" | "flow">(
  mdxSlideContract,
  ({ title, columns = 1, children }, context) =>
    context.part(
      "root",
      "div",
      { "data-meowslides-mdx": "" },
      h(
        PresentationLayout,
        { columns, header: h("h1", null, title) },
        columns === 1 || columns === "single"
          ? context.part("flow", "div", null, children)
          : children,
      ),
    ),
);

const MDXSlideColumn = defineComponent<Props, "mdx-slide", "root" | "flow">(
  mdxSlideContract,
  ({ children, ...props }, context) => context.part("flow", "div", props, children),
);

/** Component defaults used by compiled local MDX; this module contains no compiler or I/O. */
export const mdxComponents = {
  MDXDeck: ({ children }: Props) => children,
  MDXSlidePage,
  MDXSlideColumn,
  PresentationImage,
  PresentationVideo,
  PresentationAudio,
  Reveal,
};
