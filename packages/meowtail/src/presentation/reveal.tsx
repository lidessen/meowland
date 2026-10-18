import {
  defineComponent,
  h,
  mapSignal,
  unwrap,
  useContext,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import {
  PresentationActivity,
  PresentationSlide,
  activitySignal,
  usePresentationActivity,
} from "./context";
import { layoutStyle } from "../shared/layout-style";
import { entranceMotion, type PresentationTransition } from "./transition";

export const revealContract = {
  name: "presentation-reveal",
  parts: ["root"],
} as const satisfies ComponentContract;

export type RevealProps = Props &
  ({ at: number; when?: never } | { when: MaybeSignal<boolean>; at?: never }) & {
    /** Decoration on a mounted hidden-to-shown change, independent of activity. */
    transition?: PresentationTransition;
    className?: string;
  };

/** Keeps geometry and local state while excluding concealed content from interaction. */
export const Reveal = defineComponent<RevealProps, "presentation-reveal", "root">(
  revealContract,
  ({ at, when, transition = "none", children, ...props }, context) => {
    const slide = useContext(PresentationSlide);
    if (!slide) throw new Error("Reveal requires a Presentation slide");
    if ((at !== undefined) === (when !== undefined))
      throw new Error("Reveal requires exactly one of at or when");
    if (at !== undefined && (!Number.isInteger(at) || at < 0 || at > slide.steps))
      throw new Error(`Invalid Reveal step: ${at}`);
    const parent = usePresentationActivity();
    const revealed = activitySignal(
      context,
      when !== undefined ? () => unwrap(when) : () => slide.step.value >= at!,
    );
    const activity = activitySignal(context, () => parent.value && revealed.value);
    let element: HTMLElement | undefined;
    const concealed = context.signal(!revealed.value);
    const motion = entranceMotion(context, activity);
    let wasRevealed = revealed.value;
    context.effect(() => {
      const hide = !revealed.value;
      const entering = !wasRevealed && !hide;
      wasRevealed = !hide;
      if (hide) motion.cancel();
      if (hide && element?.contains(element.ownerDocument.activeElement)) slide.focusFallback();
      if (element) element.style.visibility = hide ? "hidden" : "inherit";
      concealed.value = hide;
      if (entering && element) motion.play(element, transition, "up");
    });
    return (
      <PresentationActivity.Provider value={activity}>
        {context.part(
          "root",
          "div",
          {
            ...props,
            inert: concealed,
            "aria-hidden": mapSignal(concealed, String),
            "data-revealed": mapSignal(concealed, (value) => String(!value)),
            style: layoutStyle(props.style, { visibility: concealed.value ? "hidden" : "inherit" }),
            ref: (node: HTMLElement) => {
              element = node;
              const hostCleanup = typeof props.ref === "function" ? props.ref(node) : undefined;
              return () => {
                try {
                  if (typeof hostCleanup === "function") hostCleanup();
                } finally {
                  element = undefined;
                }
              };
            },
          },
          children,
        )}
      </PresentationActivity.Provider>
    );
  },
);
