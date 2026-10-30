import { type Props, type Context, h } from "meowjsx";

export interface PathLabelProps extends Props {
  path: string;
  className?: Props["className"];
}
/**
 * A file path that keeps the file name visible when space runs out. Text only: never resolves a
 * path, grants access or opens a file.
 */
export function PathLabel(
  { path, className, ...props }: PathLabelProps,
  context: Context<typeof PathLabel>,
) {
  const split = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1;
  return (
    <span {...props} className={className} title={path} ref={[context.parts.root]}>
      <span ref={[context.parts.text]}>
        {split ? <span ref={[context.parts.directory]}>{path.slice(0, split)}</span> : null}
        <span ref={[context.parts.name]}>{path.slice(split)}</span>
      </span>
    </span>
  );
}
PathLabel.meta = {
  name: "path-label",
  parts: ["root", "text", "directory", "name"],
} as const;
