import { type Child, type Props, type Context, h } from "meowjsx";

export interface AppBarProps extends Props {
  title: Child;
  /** A short status line under the title, typically ChatStatus. */
  status?: Child;
  actions?: Child;
  className?: Props["className"];
}

/**
 * Compact application chrome: one title, one optional status line, and the
 * actions that belong to the whole screen. The page body keeps its own scroll.
 */
export function AppBar(
  { title, status, actions, className, ...props }: AppBarProps,
  context: Context<typeof AppBar>,
) {
  return (
    <header {...props} className={className} ref={[context.parts.root, props.ref]}>
      <div ref={[context.parts.identity]}>
        <h1 ref={[context.parts.title]}>{title}</h1>
        {status !== undefined && status !== null ? (
          <div ref={[context.parts.status]}>{status}</div>
        ) : null}
      </div>
      {actions ? <div ref={[context.parts.actions]}>{actions}</div> : null}
    </header>
  );
}
AppBar.meta = {
  name: "app-bar",
  parts: ["root", "identity", "title", "status", "actions"],
} as const;
