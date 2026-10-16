import { defineComponent, h, type ComponentContract, type Props } from "meowjsx";
import { OutputBlock } from "./output-block";

export const diffBlockContract = {
  name: "diff-block",
  parts: ["root", "line", "path"],
} as const satisfies ComponentContract;
export interface DiffBlockLine {
  kind: "added" | "removed" | "context";
  text: string;
}
export interface DiffBlockFile {
  path: string;
  lines: readonly DiffBlockLine[];
}
export interface DiffBlockProps extends Props {
  files: readonly DiffBlockFile[];
  maxLines?: number;
  onCopy?: (text: string) => Promise<void>;
}
const marker = { added: "+", removed: "-", context: " " } as const;
export function diffBlockText(files: readonly DiffBlockFile[]) {
  return files
    .map((file) =>
      [file.path, ...file.lines.map((line) => marker[line.kind] + line.text)].join("\n"),
    )
    .join("\n\n");
}
/** Hosts provide semantic diff rows; this view does not infer changes or apply patches. */
export const DiffBlock = defineComponent<
  DiffBlockProps,
  "diff-block",
  (typeof diffBlockContract.parts)[number]
>(diffBlockContract, ({ files, maxLines, onCopy, ...props }, context) => {
  const added = files.reduce(
    (sum, file) => sum + file.lines.filter((line) => line.kind === "added").length,
    0,
  );
  const removed = files.reduce(
    (sum, file) => sum + file.lines.filter((line) => line.kind === "removed").length,
    0,
  );
  return context.part(
    "root",
    "div",
    props,
    <OutputBlock
      title={`变更 · +${added} −${removed}`}
      maxLines={maxLines}
      onCopy={onCopy}
      copyText={diffBlockText(files)}
      rows={files.flatMap((file) => [
        context.part("path", "div", {}, file.path),
        ...file.lines.map((line) =>
          context.part("line", "div", { "data-diff-kind": line.kind }, [
            marker[line.kind],
            line.text,
          ]),
        ),
      ])}
    />,
  );
});
