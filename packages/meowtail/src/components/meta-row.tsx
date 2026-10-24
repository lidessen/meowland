import { defineStyleProps, type ThemedProps } from "meowcss/meowjsx";
import {
  derived,
  h,
  keyed,
  unwrap,
  type Child,
  type MaybeSignal,
  type Props,
  type Context,
} from "meowjsx";

import { metaRowOptions } from "./meta-row.options";
export { metaRowOptions } from "./meta-row.options";

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
  className?: Props["className"];
}

/**
 * A page-level fact row. Items keep separators, wrap instead of clipping, and
 * carry facts as text; the optional progress segment is one more fact.
 */
export function MetaRow(
  {
    items,
    progress,
    progressLabel = "Progress",
    children: hostChildren,
    className,
    ...props
  }: MetaRowProps,
  context: Context<typeof MetaRow>,
) {
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
      const item = (
        <span ref={[context.parts.item]}>
          {derived(() => {
            const icon = entry.value.item.icon;
            if (icon === undefined || icon === null) return null;
            return <span ref={[context.parts.icon]}>{icon}</span>;
          })}
          <span ref={[context.parts.label]}>{derived(() => entry.value.item.label)}</span>
        </span>
      );
      // Index keys stay with their position, so the first row never owns a separator.
      if (entry.value.key === 0) return item;
      return [
        <span aria-hidden="true" ref={[context.parts.separator]}>
          ·
        </span>,
        item,
      ] as unknown as Child;
    },
  );
  // The segment is omitted until progress is finite, matching the static contract.
  const progressSegment = derived(() => {
    const value = percent.value;
    if (value === undefined) return null;
    const bar = (
      <span
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        style={{ "--meta-progress": `${value}%` }}
        ref={[context.parts.progress]}
      >
        {h("span", { "aria-hidden": "true" }, `${value}%`)}
      </span>
    );
    return unwrap(items).length > 0
      ? [
          <span aria-hidden="true" ref={[context.parts.separator]}>
            ·
          </span>,
          bar,
        ]
      : bar;
  });
  return (
    <div {...props} className={className} ref={[context.parts.root, props.ref]}>
      {rows}
      {progressSegment}
    </div>
  );
}
MetaRow.meta = {
  name: "meta-row",
  parts: ["root", "item", "icon", "label", "separator", "progress"],
  style: defineStyleProps(metaRowOptions, {
    defaults: { align: "start", progressTone: "neutral" },
  }),
} as const;
