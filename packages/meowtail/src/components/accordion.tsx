import {
  derived,
  unwrap,
  h,
  type Child,
  type MaybeSignal,
  type Props,
  type Context,
} from "meowjsx";
import { Disclosure } from "./disclosure";

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
  className?: Props["className"];
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
export function Accordion(
  {
    items,
    type = "single",
    value,
    defaultValue,
    onValueChange,
    label,
    className,
    ref,
    ...props
  }: AccordionProps,
  context: Context<typeof Accordion>,
) {
  const local = context.signal<AccordionValue>(defaultValue ?? (type === "single" ? "" : []));
  const current = value !== undefined ? value : local;
  const readValue = () => unwrap(current);
  const opened = items.map((item) => derived(() => isOpen(readValue(), type, item.id)));
  const request = (id: string, open: boolean) => {
    const next = nextValue(readValue(), type, id, open);
    if (value === undefined) local.value = next;
    onValueChange?.(next);
  };
  return (
    <div {...props} className={className} aria-label={label} ref={[context.parts.root, ref]}>
      {items.map((item, index) => (
        <div key={item.id} data-accordion-id={item.id} ref={context.parts.item}>
          <Disclosure
            summary={item.summary}
            open={opened[index]}
            name={type === "single" ? props.id : undefined}
            onToggle={(event: Event) => {
              request(item.id, (event.currentTarget as HTMLDetailsElement).open);
            }}
          >
            {item.content}
          </Disclosure>
        </div>
      ))}
    </div>
  );
}
Accordion.meta = { name: "accordion", parts: ["root", "item"] } as const;
