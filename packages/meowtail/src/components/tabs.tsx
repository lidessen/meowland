import {
  derived,
  h,
  unwrap,
  type Child,
  type Context,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { tabsCount, tabsIndex } from "./tabs.options";
export { tabsCount, tabsIndex } from "./tabs.options";

export interface TabItem {
  value: string;
  label: Child;
  content: Child;
  disabled?: boolean;
}
export interface TabsProps extends Props {
  id: string;
  label: string;
  items: readonly TabItem[];
  value?: MaybeSignal<string>;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: Props["className"];
}

/** Horizontal tabs with automatic keyboard activation. Items are fixed for the mount, and panels stay mounted to preserve drafts. */
export function Tabs(
  {
    id,
    label,
    items,
    value,
    defaultValue,
    onValueChange,
    className,
    children,
    ref,
    ...props
  }: TabsProps,
  context: Context<typeof Tabs>,
) {
  void children;
  const enabled = items.flatMap((item, index) => (item.disabled ? [] : [index]));
  const local = context.signal(defaultValue ?? items[enabled[0] ?? -1]?.value ?? "");
  const focus = context.signal(enabled[0] ?? -1);
  const current = value !== undefined ? value : local;
  const activeIndex = derived(() =>
    items.findIndex((item) => item.value === unwrap(current) && !item.disabled),
  );
  const indicatorIndex = derived(() => Math.max(0, activeIndex.value));
  const indicatorHidden = derived(() => activeIndex.value < 0);
  const selected = items.map((_, index) => derived(() => String(index === activeIndex.value)));
  const hidden = items.map((_, index) => derived(() => index !== activeIndex.value));
  const tabIndex = items.map((_, index) => derived(() => (index === focus.value ? 0 : -1)));
  // Arrow keys set focus themselves. A host-driven value still moves the roving tabindex.
  context.effect(() => {
    const active = activeIndex.value;
    focus.value = active >= 0 ? active : (enabled[0] ?? -1);
  });
  const choose = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;
    focus.value = index;
    if (value === undefined) local.value = item.value;
    onValueChange?.(item.value);
  };
  const keydown = (event: KeyboardEvent, index: number) => {
    const position = enabled.indexOf(index);
    if (position < 0 || !enabled.length) return;
    const rtl = getComputedStyle(event.currentTarget as Element).direction === "rtl";
    let target: number | undefined;
    if (event.key === "Home") target = enabled[0];
    else if (event.key === "End") target = enabled.at(-1);
    else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const delta = (event.key === "ArrowRight" ? 1 : -1) * (rtl ? -1 : 1);
      target = enabled[(position + delta + enabled.length) % enabled.length];
    }
    if (target === undefined) return;
    event.preventDefault();
    const button = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll(
      '[role="tab"]',
    )[target] as HTMLElement | undefined;
    button?.focus();
    choose(target);
  };
  return (
    <div {...props} id={id} className={className} ref={[context.parts.root, ref]}>
      <div
        role="tablist"
        aria-label={label}
        aria-orientation="horizontal"
        style={{ [tabsCount.name]: Math.max(1, items.length), [tabsIndex.name]: indicatorIndex }}
        ref={context.parts.list}
      >
        <span aria-hidden="true" hidden={indicatorHidden} ref={context.parts.indicator} />
        {items.map((item, index) => (
          <button
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            disabled={item.disabled}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={selected[index]}
            tabIndex={tabIndex[index]}
            onFocus={() => {
              focus.value = index;
            }}
            onClick={() => choose(index)}
            onKeyDown={(event: KeyboardEvent) => keydown(event, index)}
            ref={context.parts.tab}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={hidden[index]}
          tabIndex={0}
          ref={context.parts.panel}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
Tabs.meta = { name: "tabs", parts: ["root", "list", "indicator", "tab", "panel"] } as const;
