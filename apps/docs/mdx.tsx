import { h, type Child, type Props } from "meowjsx";

/**
 * The live example of one story, usable inside an MDX content page.
 * The canvas is served from the site root, so the path does not depend on the
 * depth of the page that embeds it.
 */
export function StoryCanvas(props: Props): Child {
  const story = typeof props.story === "string" ? props.story : "";
  const title = typeof props.title === "string" ? props.title : story;
  if (!story) {
    return h("p", { className: "docs-note" }, "A story canvas needs a story id.");
  }
  return h(
    "div",
    { className: "docs-preview" },
    h("iframe", {
      className: "docs-preview-frame docs-preview-frame-tall",
      src: `/gallery/canvas.html?story=${encodeURIComponent(story)}&embedded=1`,
      loading: "lazy",
      title,
    }),
  );
}
