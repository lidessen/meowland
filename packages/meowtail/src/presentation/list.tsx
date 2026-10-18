import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export interface PresentationListProps extends Props {
  as?: "ul" | "ol";
  /** Item content; static null, undefined and boolean entries are omitted. */
  items: readonly Child[];
  className?: string;
}

export const presentationListContract = {
  name: "presentation-list",
  parts: ["root", "item"],
} as const satisfies ComponentContract;

/** Native list semantics at the presentation's reading scale. */
export const PresentationList = defineComponent<
  PresentationListProps,
  "presentation-list",
  (typeof presentationListContract.parts)[number]
>(presentationListContract, ({ as = "ul", items, className, ...props }, context) =>
  context.part(
    "root",
    as,
    { ...props, className },
    items
      .filter((item) => item !== null && item !== undefined && typeof item !== "boolean")
      .map((item) => context.part("item", "li", null, item)),
  ),
);
