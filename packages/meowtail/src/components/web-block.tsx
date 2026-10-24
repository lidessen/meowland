import { h, type Child, type Context, type Props } from "meowjsx";

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
export function WebBlock(props: WebBlockProps, context: Context<typeof WebBlock>) {
  const {
    kind,
    answer: _answer,
    sources: _sources,
    url: _url,
    statusCode: _status,
    truncated,
    ref,
    ...rest
  } = props;
  const link = (url: string, title?: string) => {
    const href = webSourceHref(url);
    let label = title || url;
    if (!title && href) label = new URL(href).hostname;
    return href ? (
      <a href={href} target="_blank" rel="noopener noreferrer" ref={context.parts.link}>
        {label}
      </a>
    ) : (
      <span ref={context.parts.link}>{label}</span>
    );
  };
  return (
    <section {...rest} data-web-kind={kind} ref={[context.parts.root, ref]}>
      {kind === "fetch"
        ? [
            link(props.url),
            <div ref={context.parts.meta}>
              {`HTTP ${props.statusCode}${truncated ? " · Content truncated" : ""}`}
            </div>,
          ]
        : [
            props.answer ? <div ref={context.parts.answer}>{props.answer}</div> : null,
            !props.answer && props.sources.length === 0 ? (
              <div ref={context.parts.meta}>No results</div>
            ) : null,
            <ol ref={context.parts.sources}>
              {props.sources.map((source, index) => (
                <li value={index + 1} ref={context.parts.source}>
                  {link(source.url, source.title)}
                  {source.snippet ? <div ref={context.parts.snippet}>{source.snippet}</div> : null}
                  {source.publishedAt ? (
                    <div ref={context.parts.meta}>{source.publishedAt}</div>
                  ) : null}
                </li>
              ))}
            </ol>,
            truncated ? <div ref={context.parts.meta}>Source list truncated</div> : null,
          ]}
    </section>
  );
}
WebBlock.meta = {
  name: "web-block",
  parts: ["root", "answer", "sources", "source", "link", "snippet", "meta"],
} as const;
