import { h, type Child, type Context, type Props } from "meowjsx";

export interface WindowTitleBarProps extends Props {
  /** Window or page name, centred between the slots. Part of the drag area. */
  title?: Child;
  /** After the native window controls, for example navigation. Interactive children stay clickable. */
  leading?: Child;
  /** Window-level actions at the far edge. Interactive children stay clickable. */
  trailing?: Child;
  className?: Props["className"];
}

/**
 * The title bar of a window whose native title bar is hidden but whose window controls remain
 * (a desktop shell). The shell reports the room it needs as `--mygo-titlebar-height`,
 * `--mygo-titlebar-inset-left` (traffic lights) and `--mygo-titlebar-inset-right`; the bar keeps
 * clear of that room and marks itself as the window's drag area with `--app-region: drag`, while
 * buttons, links and fields inside it opt out. Double-click zooming is the shell's job.
 *
 * The component does not detect the platform: the host renders it only where the shell exists,
 * and in a browser tab the variables fall back to a plain bar.
 */
export function WindowTitleBar(
  { title, leading, trailing, className, ref, ...props }: WindowTitleBarProps,
  context: Context<typeof WindowTitleBar>,
) {
  return (
    <header {...props} className={className} ref={[context.parts.root, ref]}>
      <div ref={context.parts.leading}>{leading}</div>
      <div ref={context.parts.title}>{title}</div>
      <div ref={context.parts.trailing}>{trailing}</div>
    </header>
  );
}
WindowTitleBar.meta = {
  name: "window-title-bar",
  parts: ["root", "leading", "title", "trailing"],
} as const;
