import { defineComponent, h, type Child, type ComponentContract, type Props } from "meowjsx";

export const webBlockContract = {
  name: "web-block",
  parts: ["root", "answer", "sources", "source", "link", "snippet", "meta"],
} as const satisfies ComponentContract;
export interface WebSourceView {
  url: string;
  title?: string;
  snippet?: string;
  publishedAt?: string;
}
export type WebBlockProps = Props &
  (
    | { kind: "search"; answer?: Child; sources: readonly WebSourceView[]; truncated?: boolean }
    | { kind: "fetch"; url: string; statusCode: number; truncated?: boolean }
  );
export function webSourceHref(url: string): string | undefined {
  try {
    return ["http:", "https:"].includes(new URL(url).protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}
/** A web search result: an answer and the pages it came from. */
export const WebBlock = defineComponent<
  WebBlockProps,
  "web-block",
  (typeof webBlockContract.parts)[number]
>(webBlockContract, (props, context) => {
  const {
    kind,
    answer: _answer,
    sources: _sources,
    url: _url,
    statusCode: _status,
    truncated,
    ...rest
  } = props;
  const link = (url: string, title?: string) => {
    const href = webSourceHref(url);
    let label = title || url;
    if (!title && href) label = new URL(href).hostname;
    return context.part(
      "link",
      href ? "a" : "span",
      href ? { href, target: "_blank", rel: "noopener noreferrer" } : {},
      label,
    );
  };
  return context.part(
    "root",
    "section",
    { ...rest, "data-web-kind": kind },
    kind === "fetch"
      ? [
          link(props.url),
          context.part(
            "meta",
            "div",
            {},
            `HTTP ${props.statusCode}${truncated ? " · Content truncated" : ""}`,
          ),
        ]
      : [
          props.answer ? context.part("answer", "div", {}, props.answer) : null,
          !props.answer && props.sources.length === 0
            ? context.part("meta", "div", {}, "No results")
            : null,
          context.part(
            "sources",
            "ol",
            {},
            props.sources.map((source, index) =>
              context.part("source", "li", { value: index + 1 }, [
                link(source.url, source.title),
                source.snippet ? context.part("snippet", "div", {}, source.snippet) : null,
                source.publishedAt ? context.part("meta", "div", {}, source.publishedAt) : null,
              ]),
            ),
          ),
          truncated ? context.part("meta", "div", {}, "Source list truncated") : null,
        ],
  );
});
