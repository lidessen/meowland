import { h, type Child, type Context, type Props } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { createRovingFocus } from "../behaviors";
import { tabsCount, tabsIndex } from "./tabs.options";
import { elementId } from "../shared/element-id";
export { tabsCount, tabsIndex } from "./tabs.options";

export interface TabItem {
  value: string;
  label: Child;
  content: Child;
  disabled?: boolean;
}
export interface TabsProps extends Props {
  /** Base id for the ARIA references this component wires; generated when omitted. */
  id?: string;
  label: string;
  items: readonly TabItem[];
  value?: MaybeSignal<string>;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  activation?: "automatic" | "manual";
  className?: Props["className"];
}

/** Items are fixed for the mount, and panels stay mounted to preserve drafts. */
export function Tabs(
  {
    id = elementId("tabs"),
    label,
    items,
    value,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    activation = "automatic",
    className,
    children,
    ref,
    ...props
  }: TabsProps,
  context: Context<typeof Tabs>,
) {
  void children;
  const enabled = items.flatMap((item, index) => (item.disabled ? [] : [index]));
  const local = signal(defaultValue ?? items[enabled[0] ?? -1]?.value ?? "");
  const stop = signal<string | null>(enabled.length ? String(enabled[0]) : null);
  const elements = new Map<number, HTMLElement>();
  const roving = createRovingFocus({
    stop,
    orientation,
    items: () =>
      [...elements]
        .sort(([a], [b]) => a - b)
        .map(([index, el]) => ({
          key: String(index),
          el,
          disabled: items[index]?.disabled,
        })),
  });
  const current = value !== undefined ? value : local;
  const activeIndex = derived(() =>
    items.findIndex((item) => item.value === unwrap(current) && !item.disabled),
  );
  const indicatorIndex = derived(() => Math.max(0, activeIndex.value));
  const indicatorHidden = derived(() => activeIndex.value < 0);
  const selected = items.map((_, index) => derived(() => String(index === activeIndex.value)));
  const hidden = items.map((_, index) => derived(() => index !== activeIndex.value));
  const tabIndex = items.map((_, index) => derived(() => (String(index) === stop.value ? 0 : -1)));
  // Arrow keys set focus themselves. A host-driven value still moves the roving tabindex.
  context.effect(() => {
    const active = activeIndex.value;
    const index = active >= 0 ? active : (enabled[0] ?? -1);
    stop.value = index >= 0 ? String(index) : null;
  });
  const choose = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;
    stop.value = String(index);
    if (value === undefined) local.value = item.value;
    onValueChange?.(item.value);
  };
  const keydown = (event: KeyboardEvent) => {
    if (roving.keydown(event) && activation === "automatic" && stop.value !== null)
      choose(Number(stop.value));
  };
  context.onCleanup(() => roving.dispose());
  return (
    <div {...props} id={id} className={className} ref={[context.parts.root, ref]}>
      <div
        role="tablist"
        aria-label={label}
        aria-orientation={orientation}
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
              stop.value = String(index);
            }}
            onClick={() => choose(index)}
            onKeyDown={keydown}
            ref={[
              context.parts.tab,
              (element: HTMLElement) => {
                elements.set(index, element);
                return () => {
                  elements.delete(index);
                };
              },
            ]}
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
