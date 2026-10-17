import {
  defineComponent,
  createContext,
  useContext,
  h,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
const ShimmerContent = createContext(false);
export const textShimmerContract = {
  name: "text-shimmer",
  parts: ["root", "content", "decoration"],
} as const satisfies ComponentContract;
export interface TextShimmerProps extends Props {
  text?: MaybeSignal<string>;
  /** Presentational fragments only: decoration duplicates them, so omit effects and element IDs. */
  children?: Child;
  active?: MaybeSignal<boolean>;
  className?: string;
  contentClassName?: string;
}
/** Nested fragments share the outer sweep; the inert copy is excluded from accessibility. */
export const TextShimmer = defineComponent<
  TextShimmerProps,
  "text-shimmer",
  "root" | "content" | "decoration"
>(
  textShimmerContract,
  ({ text, children, active = false, className, contentClassName, ...props }, context) => {
    const content = text ?? children;
    if (useContext(ShimmerContent))
      return context.part("content", "span", { ...props, className }, content);
    const activity = context.signal(String(unwrap(active)));
    context.effect(() => {
      activity.value = String(unwrap(active));
    });
    return context.part(
      "root",
      "span",
      { ...props, className, "data-active": activity },
      context.part(
        "content",
        "span",
        { className: contentClassName },
        <ShimmerContent.Provider value={true}>{content}</ShimmerContent.Provider>,
      ),
      context.part(
        "decoration",
        "span",
        { "aria-hidden": "true", inert: true },
        context.part(
          "content",
          "span",
          { className: contentClassName },
          <ShimmerContent.Provider value={true}>{content}</ShimmerContent.Provider>,
        ),
      ),
    );
  },
);
