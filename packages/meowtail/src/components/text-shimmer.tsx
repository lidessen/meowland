import { createContext, h, useContext, type Child, type Context, type Props } from "meowjsx";
import { derived, unwrap, type MaybeSignal } from "meowjsx/signal";
const ShimmerContent = createContext(false);
export interface TextShimmerProps extends Props {
  text?: MaybeSignal<string>;
  /** Presentational fragments only: decoration duplicates them, so omit effects and element IDs. */
  children?: Child;
  active?: MaybeSignal<boolean>;
  className?: Props["className"];
  contentClassName?: string;
}
/**
 * Text with a light sweep across it, for work in progress. Nested fragments share the outer sweep;
 * the inert copy is excluded from accessibility.
 */
export function TextShimmer(
  { text, children, active = false, className, contentClassName, ref, ...props }: TextShimmerProps,
  context: Context<typeof TextShimmer>,
) {
  const content = text ?? children;
  if (useContext(ShimmerContent))
    return (
      <span {...props} className={className} ref={[context.parts.content, ref]}>
        {content}
      </span>
    );
  const activity = derived(() => String(unwrap(active)));
  return (
    <span {...props} className={className} data-active={activity} ref={[context.parts.root, ref]}>
      <span className={contentClassName} ref={context.parts.content}>
        <ShimmerContent.Provider value={true}>{content}</ShimmerContent.Provider>
      </span>
      <span aria-hidden="true" inert ref={context.parts.decoration}>
        <span className={contentClassName} ref={context.parts.content}>
          <ShimmerContent.Provider value={true}>{content}</ShimmerContent.Provider>
        </span>
      </span>
    </span>
  );
}
TextShimmer.meta = { name: "text-shimmer", parts: ["root", "content", "decoration"] } as const;
