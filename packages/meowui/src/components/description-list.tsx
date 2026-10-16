import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const descriptionListContract = {
  name: "description-list",
  parts: ["root"],
} as const satisfies ComponentContract;

export interface DescriptionListProps extends Props {
  className?: string;
}

/** Related terms and values share a natural label column within the available width. */
export const DescriptionList = defineComponent<DescriptionListProps, "description-list", "root">(
  descriptionListContract,
  ({ children, ...props }, context) => context.part("root", "dl", props, children),
);

export const descriptionItemContract = {
  name: "description-item",
  parts: ["root", "term", "value"],
} as const satisfies ComponentContract;

export interface DescriptionItemProps extends Props {
  term: Child;
  className?: string;
}

/** A native description group; its value can compose text and existing layout components. */
export const DescriptionItem = defineComponent<
  DescriptionItemProps,
  "description-item",
  (typeof descriptionItemContract.parts)[number]
>(descriptionItemContract, ({ term, children, ...props }, context) =>
  context.part(
    "root",
    "div",
    props,
    context.part("term", "dt", null, term),
    context.part("value", "dd", null, children),
  ),
);
