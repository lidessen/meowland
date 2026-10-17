import {
  defineComponent,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { tokenRef } from "meowcss";

export const tabsCount = tokenRef("tabs", "count");
export const tabsIndex = tokenRef("tabs", "index");

export interface TabItem {
  value: string;
  label: Child;
  content: Child;
  disabled?: boolean;
}
export const tabsContract = {
  name: "tabs",
  parts: ["root", "list", "indicator", "tab", "panel"],
} as const satisfies ComponentContract;
export interface TabsProps extends Props {
  id: string;
  label: string;
  items: readonly TabItem[];
  value?: MaybeSignal<string>;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/** Horizontal tabs with automatic keyboard activation. Panels remain mounted to preserve drafts. */
export const Tabs = defineComponent<TabsProps, "tabs", (typeof tabsContract.parts)[number]>(
  tabsContract,
  ({ id, label, items, value, defaultValue, onValueChange, className, ...props }, context) => {
    const enabled = items.flatMap((item, index) => (item.disabled ? [] : [index]));
    const local = context.signal(defaultValue ?? items[enabled[0] ?? -1]?.value ?? "");
    const focus = context.signal(enabled[0] ?? -1);
    const selected = items.map(() => context.signal("false"));
    const hidden = items.map(() => context.signal(true));
    const tabIndex = items.map(() => context.signal(-1));
    const indicatorIndex = context.signal(0);
    const indicatorHidden = context.signal(true);
    context.effect(() => {
      const current = unwrap(value === undefined ? local : value);
      const active = items.findIndex((item) => item.value === current && !item.disabled);
      indicatorIndex.value = Math.max(0, active);
      indicatorHidden.value = active < 0;
      focus.value = active >= 0 ? active : (enabled[0] ?? -1);
      for (const [index] of items.entries()) {
        selected[index]!.value = String(index === active);
        hidden[index]!.value = index !== active;
      }
    });
    context.effect(() => {
      const focused = focus.value;
      for (const [index] of items.entries()) tabIndex[index]!.value = index === focused ? 0 : -1;
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
    return context.part(
      "root",
      "div",
      { ...props, id, className },
      context.part(
        "list",
        "div",
        {
          role: "tablist",
          "aria-label": label,
          "aria-orientation": "horizontal",
          style: { [tabsCount.name]: Math.max(1, items.length), [tabsIndex.name]: indicatorIndex },
        },
        context.part("indicator", "span", { "aria-hidden": "true", hidden: indicatorHidden }),
        items.map((item, index) =>
          context.part(
            "tab",
            "button",
            {
              type: "button",
              role: "tab",
              id: `${id}-tab-${index}`,
              disabled: item.disabled,
              "aria-controls": `${id}-panel-${index}`,
              "aria-selected": selected[index],
              tabIndex: tabIndex[index],
              onFocus: () => {
                focus.value = index;
              },
              onClick: () => choose(index),
              onKeyDown: (event: KeyboardEvent) => keydown(event, index),
            },
            item.label,
          ),
        ),
      ),
      items.map((item, index) =>
        context.part(
          "panel",
          "div",
          {
            role: "tabpanel",
            id: `${id}-panel-${index}`,
            "aria-labelledby": `${id}-tab-${index}`,
            hidden: hidden[index],
            tabIndex: 0,
          },
          item.content,
        ),
      ),
    );
  },
);
