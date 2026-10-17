import {
  defineComponent,
  h,
  mapSignal,
  useContext,
  type ComponentContract,
  type Props,
} from "meowjsx";
import {
  PresentationActivity,
  PresentationSlide,
  activitySignal,
  usePresentationActivity,
} from "./context";
import { layoutStyle } from "../shared/layout-style";

export const revealContract = {
  name: "presentation-reveal",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface RevealProps extends Props {
  at: number;
  className?: string;
}

/** Keeps geometry and local state while excluding concealed content from interaction. */
export const Reveal = defineComponent<RevealProps, "presentation-reveal", "root">(
  revealContract,
  ({ at, children, ...props }, context) => {
    const slide = useContext(PresentationSlide);
    if (!slide) throw new Error("Reveal requires a Presentation slide");
    if (!Number.isInteger(at) || at < 0 || at > slide.steps)
      throw new Error(`Invalid Reveal step: ${at}`);
    const parent = usePresentationActivity();
    const activity = activitySignal(context, () => parent.value && slide.step.value >= at);
    const revealed = mapSignal(slide.step, (value) => value >= at);
    let element: HTMLElement | undefined;
    const concealed = context.signal(!revealed.value);
    context.effect(() => {
      const hide = !revealed.value;
      if (hide && element?.contains(element.ownerDocument.activeElement)) slide.focusFallback();
      if (element) element.style.visibility = hide ? "hidden" : "inherit";
      concealed.value = hide;
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
