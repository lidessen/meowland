import { h, type Child, type Props, type Context } from "meowjsx";
import { EmptyStack } from "../icons/empty-stack";
import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";

import { emptyStateOptions } from "./empty-state.options";
export { emptyStateOptions } from "./empty-state.options";

export interface EmptyStateProps extends Props, ThemedProps<typeof emptyStateOptions> {
  title: string;
  copy?: string;
  action?: Child;
  /**
   * Artwork above the title. Omitted uses `EmptyStack`. `null` and `false` leave
   * the illustration part out. Presence is fixed for the mount.
   */
  illustration?: Child;
  className?: Props["className"];
}

/**
 * What a region shows while it has nothing: artwork, a title, a line of help and an optional next
 * step.
 */
export function EmptyState(
  { title, copy, action, illustration, className, ...props }: EmptyStateProps,
  context: Context<typeof EmptyState>,
) {
  const art = illustration === undefined ? <EmptyStack /> : illustration;
  return (
    <div {...props} className={className} ref={[context.parts.root, props.ref]}>
      {art !== null && art !== false ? <div ref={[context.parts.illustration]}>{art}</div> : null}
      <strong ref={[context.parts.title]}>{title}</strong>
      {copy ? <span ref={[context.parts.description]}>{copy}</span> : null}
      {action ? <div ref={[context.parts.action]}>{action}</div> : null}
    </div>
  );
}
EmptyState.meta = {
  name: "empty-state",
  parts: ["root", "illustration", "title", "description", "action"],
  style: defineStyleProps(emptyStateOptions, { defaults: { size: "default" } }),
} as const;
