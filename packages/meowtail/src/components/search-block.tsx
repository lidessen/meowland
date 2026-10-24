import { h, type Props, type Context } from "meowjsx";
import { OutputBlock, outputWindow } from "./output-block";

export interface SearchFileGroup {
  path: string;
  matches: readonly { lineNumber: number; line: string }[];
}
interface SearchBlockCommon extends Props {
  total: number;
  truncated?: boolean;
  maxLines?: number;
  onCopy?: (text: string) => Promise<void>;
}
export type SearchBlockProps = SearchBlockCommon &
  (
    | { kind: "paths"; paths: readonly string[] }
    | { kind: "matches"; files: readonly SearchFileGroup[] }
  );
export function searchBlockText(props: SearchBlockProps) {
  return props.kind === "paths"
    ? props.paths.join("\n")
    : props.files
        .map((file) =>
          [file.path, ...file.matches.map((match) => `${match.lineNumber}: ${match.line}`)].join(
            "\n",
          ),
        )
        .join("\n\n");
}
/** Search matches grouped by file, with line numbers. */
export function SearchBlock(props: SearchBlockProps, context: Context<typeof SearchBlock>) {
  const {
    kind,
    total,
    truncated = false,
    maxLines,
    onCopy,
    paths: _paths,
    files: _files,
    ...rest
  } = props;
  const shown =
    kind === "paths"
      ? props.paths.length
      : props.files.reduce((sum, file) => sum + file.matches.length, 0);
  const renderMatch = (match: SearchFileGroup["matches"][number]) => (
    <div ref={[context.parts.match]}>
      {[<span ref={[context.parts.number]}>{`${match.lineNumber}: `}</span>, match.line]}
    </div>
  );
  const rows =
    kind === "paths"
      ? props.paths.map((path) => <div ref={[context.parts.path]}>{path}</div>)
      : props.files.map((file) => {
          const { head, tail, hidden } = outputWindow(file.matches.length, maxLines);
          return (
            <details open={true} ref={[context.parts.file]}>
              {[
                <summary
                  ref={[context.parts.path]}
                >{`${file.path} · ${file.matches.length}`}</summary>,
                ...(hidden ? file.matches.slice(0, head) : file.matches).map(renderMatch),
                hidden ? (
                  <details>
                    <summary>{hidden} matches in the middle</summary>
                    {file.matches.slice(head, file.matches.length - tail).map(renderMatch)}
                  </details>
                ) : null,
                ...(hidden ? file.matches.slice(file.matches.length - tail) : []).map(renderMatch),
              ]}
            </details>
          );
        });
  return (
    <div {...rest} ref={[context.parts.root, rest.ref]}>
      {
        <OutputBlock
          title={`Search · showing ${shown} / ${total}${truncated ? " · results truncated" : ""}`}
          rows={rows}
          copyText={searchBlockText(props)}
          maxLines={maxLines}
          onCopy={onCopy}
          emptyText="No results"
        />
      }
    </div>
  );
}
SearchBlock.meta = {
  name: "search-block",
  parts: ["root", "file", "path", "match", "number"],
} as const;
