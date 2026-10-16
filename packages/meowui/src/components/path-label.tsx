import { defineComponent, type ComponentContract, type Props } from "meowjsx";
export const pathLabelContract = {
  name: "path-label",
  parts: ["root", "text", "directory", "name"],
} as const satisfies ComponentContract;
export interface PathLabelProps extends Props {
  path: string;
  className?: string;
}
/** Text only: never resolves a path, grants access or opens a file. */
export const PathLabel = defineComponent<
  PathLabelProps,
  "path-label",
  (typeof pathLabelContract.parts)[number]
>(pathLabelContract, ({ path, className, ...props }, context) => {
  const split = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1;
  return context.part(
    "root",
    "span",
    {
      ...props,
      className,
      title: path,
      ref: (element: HTMLElement) => {
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
    },
    context.part(
      "text",
      "span",
      null,
      split ? context.part("directory", "span", null, path.slice(0, split)) : null,
      context.part("name", "span", null, path.slice(split)),
    ),
  );
});
