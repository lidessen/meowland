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
    <span
      {...props}
      className={className}
      title={path}
      ref={[
        context.parts.root,
        (element: HTMLElement) => {
          let alive = true;
          let observer: ResizeObserver | undefined;
          queueMicrotask(() => {
            if (!alive) return;
            const text = element.firstElementChild as HTMLElement | null;
            if (!text) return;
            const update = () =>
              element.toggleAttribute("data-path-clipped", text.offsetWidth > element.clientWidth);
            update();
            const Observer = element.ownerDocument.defaultView?.ResizeObserver;
            if (Observer) {
              observer = new Observer(update);
              observer.observe(element);
              observer.observe(text);
            }
          });
          return () => {
            alive = false;
            observer?.disconnect();
          };
        },
      ]}
    >
      <span ref={[context.parts.text]}>
        {split ? <span ref={[context.parts.directory]}>{path.slice(0, split)}</span> : null}
        <span ref={[context.parts.name]}>{path.slice(split)}</span>
      </span>
    </span>
  );
}
PathLabel.meta = { name: "path-label", parts: ["root", "text", "directory", "name"] } as const;
