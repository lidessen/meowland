import { defineComponent, h, type ComponentContract, type Props } from "meowjsx";
import { OutputBlock, outputWindow } from "./output-block";

export const searchBlockContract = {
  name: "search-block",
  parts: ["root", "file", "path", "match", "number"],
} as const satisfies ComponentContract;
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
export const SearchBlock = defineComponent<
  SearchBlockProps,
  "search-block",
  (typeof searchBlockContract.parts)[number]
>(searchBlockContract, (props, context) => {
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
  const renderMatch = (match: SearchFileGroup["matches"][number]) =>
    context.part("match", "div", {}, [
      context.part("number", "span", {}, `${match.lineNumber}: `),
      match.line,
    ]);
  const rows =
    kind === "paths"
      ? props.paths.map((path) => context.part("path", "div", {}, path))
      : props.files.map((file) => {
          const { head, tail, hidden } = outputWindow(file.matches.length, maxLines);
          return context.part("file", "details", { open: true }, [
            context.part("path", "summary", {}, `${file.path} · ${file.matches.length}`),
            ...(hidden ? file.matches.slice(0, head) : file.matches).map(renderMatch),
            hidden ? (
              <details>
                <summary>{hidden} matches in the middle</summary>
                {file.matches.slice(head, file.matches.length - tail).map(renderMatch)}
              </details>
            ) : null,
            ...(hidden ? file.matches.slice(file.matches.length - tail) : []).map(renderMatch),
          ]);
        });
  return context.part(
    "root",
    "div",
    rest,
    <OutputBlock
      title={`Search · showing ${shown} / ${total}${truncated ? " · results truncated" : ""}`}
      rows={rows}
      copyText={searchBlockText(props)}
      maxLines={maxLines}
      onCopy={onCopy}
      emptyText="No results"
    />,
  );
});
