import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import {
  defineComponent,
  derived,
  h,
  keyed,
  unwrap,
  type Child,
  type MaybeSignal,
  type Props,
} from "meowjsx";

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
  /** Plain arrays are fixed for the mount. A signal keeps the row live. */
  items: MaybeSignal<readonly MetaItem[]>;
  /** Finite values clamp to 0–100; non-finite values omit the progress segment. A signal stays live. */
  progress?: MaybeSignal<number | undefined>;
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
    const entries = derived(() => unwrap(items).map((item, index) => ({ item, key: index })));
    const percent = derived(() => {
      const next = unwrap(progress);
      if (next === undefined || !Number.isFinite(next)) return undefined;
      return Math.max(0, Math.min(100, Math.round(next)));
    });
    const rows = keyed(
      entries,
      (entry) => entry.key,
      (entry) => {
        const item = context.part(
          "item",
          "span",
          null,
          derived(() => {
            const icon = entry.value.item.icon;
            if (icon === undefined || icon === null) return null;
            return context.part("icon", "span", null, icon);
          }),
          context.part(
            "label",
            "span",
            null,
            derived(() => entry.value.item.label),
          ),
        );
        // Index keys stay with their position, so the first row never owns a separator.
        if (entry.value.key === 0) return item;
        return [
          context.part("separator", "span", { "aria-hidden": "true" }, "·"),
          item,
        ] as unknown as Child;
      },
    );
    // The segment is omitted until progress is finite, matching the static contract.
    const progressSegment = derived(() => {
      const value = percent.value;
      if (value === undefined) return null;
      const bar = context.part(
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
      );
      return unwrap(items).length > 0
        ? [context.part("separator", "span", { "aria-hidden": "true" }, "·"), bar]
        : bar;
    });
    return context.part("root", "div", { ...props, className }, rows, progressSegment);
  },
);
