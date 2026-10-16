import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, type Child, type Props } from "meowjsx";

export const itemOptions = defineOptions("item", {
  size: ["small", "medium"],
  variant: ["plain", "outline"],
});

export const itemContract = {
  name: "item",
  parts: ["root", "leading", "content", "meta", "title", "description", "trailing"],
  styleProps: defineStyleProps(itemOptions, { defaults: { size: "medium", variant: "plain" } }),
} as const satisfies StyledComponentContract;

export interface ItemProps extends Props, ThemedProps<typeof itemOptions> {
  as?: "div" | "button";
  title: Child;
  description?: Child;
  leading?: Child;
  trailing?: Child;
  meta?: Child;
  selected?: boolean;
  className?: string;
}

/** A single readable destination. Button content must not contain nested controls. */
export const Item = defineComponent<ItemProps, "item", (typeof itemContract.parts)[number]>(
  itemContract,
  (
    {
      as = "div",
      title,
      description,
      leading,
      trailing,
      meta,
      selected,
      className,
      children,
      ...props
    },
    context,
  ) =>
    context.part(
      "root",
      as,
      {
        type: as === "button" ? "button" : undefined,
        ...props,
        className,
        "data-selected": selected ? "true" : undefined,
      },
      leading != null ? context.part("leading", "span", null, leading) : null,
      context.part(
        "content",
        "span",
        null,
        meta != null ? context.part("meta", "span", null, meta) : null,
        context.part("title", "span", null, title),
        description != null ? context.part("description", "span", null, description) : null,
        children,
      ),
      trailing != null ? context.part("trailing", "span", null, trailing) : null,
    ),
);
