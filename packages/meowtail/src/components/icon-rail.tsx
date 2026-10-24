import { type Child, type Props, type Context, h } from "meowjsx";
import { isSignal, mapSignal, type MaybeSignal } from "meowjsx/signal";

export interface IconRailProps extends Props {
  /** Accessible name of the navigation. */
  label: string;
  brand?: Child;
  /** Pinned to the bottom, for example settings. */
  footer?: Child;
  /** Keep the drawer open; by default it expands over the page on hover or keyboard focus. */
  expanded?: MaybeSignal<boolean>;
  className?: Props["className"];
}

/**
 * A narrow icon column that expands into a labelled drawer over the page. The column keeps its
 * width in the layout, so expanding never reflows the content beside it.
 */
export function IconRail(
  { label, brand, footer, expanded = false, className, children, ...props }: IconRailProps,
  context: Context<typeof IconRail>,
) {
  return (
    <nav {...props} className={className} aria-label={label} ref={[context.parts.root, props.ref]}>
      <div
        data-expanded={
          isSignal<boolean>(expanded)
            ? mapSignal(expanded, (value) => String(value))
            : String(expanded)
        }
        ref={[context.parts.drawer]}
      >
        {brand ? <div ref={[context.parts.brand]}>{brand}</div> : null}
        <div ref={[context.parts.items]}>{children}</div>
        {footer ? <div ref={[context.parts.footer]}>{footer}</div> : null}
      </div>
    </nav>
  );
}
IconRail.meta = {
  name: "icon-rail",
  parts: ["root", "drawer", "brand", "items", "footer"],
} as const;
