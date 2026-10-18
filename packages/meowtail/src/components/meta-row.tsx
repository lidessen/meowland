import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, h, type Child, type Props } from "meowjsx";

export const metaRowOptions = defineOptions("meta-row", {
  align: ["start", "center"],
  progressTone: ["neutral", "accent"],
});

export const metaRowContract = {
  name: "meta-row",
  parts: ["root", "item", "icon", "label", "separator", "progress"],
  styleProps: defineStyleProps(metaRowOptions, {
    defaults: { align: "start", progressTone: "neutral" },
  }),
} as const satisfies StyledComponentContract;

export interface MetaItem {
  /** Decorative glyph that helps identify the fact. */
  icon?: Child;
  /** Short, scannable fact text. */
  label: Child;
}

export interface MetaRowProps extends Props, ThemedProps<typeof metaRowOptions> {
  items: readonly MetaItem[];
  /** Finite values clamp to 0–100; non-finite values omit the progress segment. */
  progress?: number;
  /** Accessible name for the progress segment. */
  progressLabel?: string;
  className?: string;
}

/**
 * A page-level fact row. Items keep separators, wrap instead of clipping, and
 * carry facts as text; the optional progress segment is one more fact.
 */
export const MetaRow = defineComponent<
  MetaRowProps,
  typeof metaRowContract.name,
  (typeof metaRowContract.parts)[number]
>(
  metaRowContract,
  (
    { items, progress, progressLabel = "Progress", children: hostChildren, className, ...props },
    context,
  ) => {
    void hostChildren;
    const value =
      progress === undefined || !Number.isFinite(progress)
        ? undefined
        : Math.max(0, Math.min(100, Math.round(progress)));
    const parts: Child[] = [];
    items.forEach((item, index) => {
      if (index > 0) parts.push(context.part("separator", "span", { "aria-hidden": "true" }, "·"));
      parts.push(
        context.part(
          "item",
          "span",
          null,
          item.icon !== undefined && item.icon !== null
            ? context.part("icon", "span", null, item.icon)
            : null,
          context.part("label", "span", null, item.label),
        ),
      );
    });
    if (value !== undefined) {
      if (items.length > 0)
        parts.push(context.part("separator", "span", { "aria-hidden": "true" }, "·"));
      parts.push(
        context.part(
          "progress",
          "span",
          {
            role: "progressbar",
            "aria-label": progressLabel,
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            "aria-valuenow": value,
            style: { "--meta-progress": `${value}%` },
          },
          h("span", { "aria-hidden": "true" }, `${value}%`),
        ),
      );
    }
    return context.part("root", "div", { ...props, className }, parts);
  },
);
