import {
  defineComponent,
  isSignal,
  mapSignal,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";

export const iconRailContract = {
  name: "icon-rail",
  parts: ["root", "drawer", "brand", "items", "footer"],
} as const satisfies ComponentContract;

export interface IconRailProps extends Props {
  /** Accessible name of the navigation. */
  label: string;
  brand?: Child;
  /** Pinned to the bottom, for example settings. */
  footer?: Child;
  /** Keep the drawer open; by default it expands over the page on hover or keyboard focus. */
  expanded?: MaybeSignal<boolean>;
  className?: string;
}

/**
 * A narrow icon column that expands into a labelled drawer over the page. The column keeps its
 * width in the layout, so expanding never reflows the content beside it.
 */
export const IconRail = defineComponent<
  IconRailProps,
  typeof iconRailContract.name,
  (typeof iconRailContract.parts)[number]
>(
  iconRailContract,
  ({ label, brand, footer, expanded = false, className, children, ...props }, context) =>
    context.part(
      "root",
      "nav",
      { ...props, className, "aria-label": label },
      context.part(
        "drawer",
        "div",
        {
          "data-expanded": isSignal<boolean>(expanded)
            ? mapSignal(expanded, (value) => String(value))
            : String(expanded),
        },
        brand ? context.part("brand", "div", null, brand) : null,
        context.part("items", "div", null, children),
        footer ? context.part("footer", "div", null, footer) : null,
      ),
    ),
);
