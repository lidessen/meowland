import { h, type Props, type Context } from "meowjsx";
import { OutputBlock } from "./output-block";

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
/**
 * A file diff: removed and added lines with their context. Hosts provide semantic diff rows; this
 * view does not infer changes or apply patches.
 */
export function DiffBlock(
  { files, maxLines, onCopy, ...props }: DiffBlockProps,
  context: Context<typeof DiffBlock>,
) {
  const added = files.reduce(
    (sum, file) => sum + file.lines.filter((line) => line.kind === "added").length,
    0,
  );
  const removed = files.reduce(
    (sum, file) => sum + file.lines.filter((line) => line.kind === "removed").length,
    0,
  );
  return (
    <div {...props} ref={[context.parts.root, props.ref]}>
      {
        <OutputBlock
          title={`Changes · +${added} −${removed}`}
          maxLines={maxLines}
          onCopy={onCopy}
          copyText={diffBlockText(files)}
          rows={files.flatMap((file) => [
            <div ref={[context.parts.path]}>{file.path}</div>,
            ...file.lines.map((line) => (
              <div data-diff-kind={line.kind} ref={[context.parts.line]}>
                {[marker[line.kind], line.text]}
              </div>
            )),
          ])}
        />
      }
    </div>
  );
}
DiffBlock.meta = { name: "diff-block", parts: ["root", "line", "path"] } as const;
