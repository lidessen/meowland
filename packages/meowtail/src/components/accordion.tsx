import {
  defineComponent,
  derived,
  h,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Disclosure } from "./disclosure";

export const accordionContract = {
  name: "accordion",
  parts: ["root", "item"],
} as const satisfies ComponentContract;

export interface AccordionItem {
  id: string;
  summary: Child;
  content: Child;
}

export type AccordionType = "single" | "multiple";
export type AccordionValue = string | readonly string[];

export interface AccordionProps extends Props {
  items: readonly AccordionItem[];
  /** `single` keeps one section open; `multiple` lets several stay open. */
  type?: AccordionType;
  value?: MaybeSignal<AccordionValue>;
  defaultValue?: AccordionValue;
  onValueChange?: (value: AccordionValue) => void;
  label?: string;
  className?: string;
}

function asList(value: AccordionValue | undefined, type: AccordionType): string[] {
  if (value === undefined) return [];
  if (typeof value === "string") return type === "single" && value === "" ? [] : [value];
  return [...value];
}

function isOpen(value: AccordionValue | undefined, type: AccordionType, id: string): boolean {
  return asList(value, type).includes(id);
}

function nextValue(
  current: AccordionValue | undefined,
  type: AccordionType,
  id: string,
  open: boolean,
): AccordionValue {
  if (type === "single") {
    if (open) return id;
    const currentId = asList(current, type)[0] ?? "";
    return currentId === id ? "" : currentId;
  }
  const list = new Set(asList(current, type));
  if (open) list.add(id);
  else list.delete(id);
  return [...list];
}

/** Grouped disclosures. Items are fixed for the mount. Expansion is handed to the caller when `value` is set. */
export const Accordion = defineComponent<
  AccordionProps,
  typeof accordionContract.name,
  (typeof accordionContract.parts)[number]
>(
  accordionContract,
  (
    { items, type = "single", value, defaultValue, onValueChange, label, className, ...props },
    context,
  ) => {
    const local = context.signal<AccordionValue>(defaultValue ?? (type === "single" ? "" : []));
    const current = value !== undefined ? value : local;
    const readValue = () => unwrap(current);
    const opened = items.map((item) => derived(() => isOpen(readValue(), type, item.id)));
    const request = (id: string, open: boolean) => {
      const next = nextValue(readValue(), type, id, open);
      if (value === undefined) local.value = next;
      onValueChange?.(next);
    };
    return context.part(
      "root",
      "div",
      {
        ...props,
        className,
        "aria-label": label,
      },
      ...items.map((item, index) =>
        context.part(
          "item",
          "div",
          { "data-accordion-id": item.id },
          <Disclosure
            summary={item.summary}
            open={opened[index]}
            name={type === "single" ? props.id : undefined}
            onToggle={(event: Event) => {
              request(item.id, (event.currentTarget as HTMLDetailsElement).open);
            }}
          >
            {item.content}
          </Disclosure>,
        ),
      ),
    );
  },
);
